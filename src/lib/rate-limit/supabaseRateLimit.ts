// ─────────────────────────────────────────────────────────────
// Rate Limit Persistente v0.0.1 — Supabase-based rate limiting
// Não in-memory! Usa tabela rate_limits no Supabase
// Fallback para Map em memória se Supabase não disponível
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

export interface RateLimitConfig {
  windowMs: number      // Janela de tempo em ms
  maxRequests: number   // Máximo de requisições na janela
  identifier: string    // Identificador único (ex: 'login', 'register', 'api')
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
  limit: number
  current: number
  blocked?: boolean
  blockedReason?: string
}

interface RateLimitRecord {
  id?: string
  identifier: string
  ip: string
  route: string
  count: number
  window_start: number
  window_end: number
  created_at?: string
  updated_at?: string
}

// Configurações padrão
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, identifier: 'login' },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3, identifier: 'register' },
  api: { windowMs: 60 * 1000, maxRequests: 60, identifier: 'api' },
  checkout: { windowMs: 5 * 60 * 1000, maxRequests: 10, identifier: 'checkout' },
  search: { windowMs: 60 * 1000, maxRequests: 30, identifier: 'search' },
  download: { windowMs: 60 * 1000, maxRequests: 10, identifier: 'download' },
  review: { windowMs: 60 * 1000, maxRequests: 5, identifier: 'review' },
  contact: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 3, identifier: 'contact' },
  upload: { windowMs: 60 * 1000, maxRequests: 5, identifier: 'upload' },
  admin: { windowMs: 60 * 1000, maxRequests: 120, identifier: 'admin' },
}

// Fallback in-memory
const memoryStore = new Map<string, { count: number; windowEnd: number }>()

// Limpeza periódica do cache em memória
setInterval(() => {
  const now = Date.now()
  Array.from(memoryStore.entries()).forEach(([key, val]) => {
    if (val.windowEnd < now) memoryStore.delete(key)
  })
}, 60_000)

/**
 * Cria cliente Supabase para rate limiting (service role)
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (url && key) {
    return createClient(url, key, {
      auth: { persistSession: false },
    })
  }
  return null
}

/**
 * Rate limit check com persistência no Supabase
 */
export async function checkRateLimit(
  ip: string,
  route: string,
  config?: Partial<RateLimitConfig>
): Promise<RateLimitResult> {
  const cfg: RateLimitConfig = {
    ...(DEFAULT_CONFIGS[route] || DEFAULT_CONFIGS.api),
    ...config,
  }

  const identifier = `${cfg.identifier}:${ip}`
  const now = Date.now()
  const windowStart = now - cfg.windowMs

  // Tentar usar Supabase primeiro
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      return await checkRateLimitSupabase(supabase, identifier, ip, route, cfg, windowStart, now)
    } catch (err) {
      // Fallback para memória se Supabase falhar
      console.error('Rate limit Supabase error, falling back to memory:', err)
    }
  }

  // Fallback: rate limit em memória
  return checkRateLimitMemory(identifier, cfg, windowStart, now)
}

/**
 * Rate limit via Supabase
 */
async function checkRateLimitSupabase(
  supabase: any,
  identifier: string,
  ip: string,
  route: string,
  cfg: RateLimitConfig,
  windowStart: number,
  now: number
): Promise<RateLimitResult> {
  // Buscar registro existente
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .gte('window_start', windowStart)
    .order('window_start', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    const currentCount = existing.count + 1

    if (currentCount > cfg.maxRequests) {
      const retryAfter = Math.ceil((existing.window_end - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.window_end,
        retryAfter,
        limit: cfg.maxRequests,
        current: currentCount,
        blocked: currentCount > cfg.maxRequests * 2,
        blockedReason: currentCount > cfg.maxRequests * 2 ? 'Múltiplas violações de rate limit' : undefined,
      }
    }

    // Incrementar contador
    await supabase
      .from('rate_limits')
      .update({
        count: currentCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    return {
      allowed: true,
      remaining: cfg.maxRequests - currentCount,
      resetAt: existing.window_end,
      limit: cfg.maxRequests,
      current: currentCount,
    }
  }

  // Criar novo registro
  const windowEnd = now + cfg.windowMs
  await supabase.from('rate_limits').insert({
    identifier,
    ip,
    route,
    count: 1,
    window_start: now,
    window_end: windowEnd,
  })

  return {
    allowed: true,
    remaining: cfg.maxRequests - 1,
    resetAt: windowEnd,
    limit: cfg.maxRequests,
    current: 1,
  }
}

/**
 * Rate limit em memória (fallback)
 */
function checkRateLimitMemory(
  identifier: string,
  cfg: RateLimitConfig,
  windowStart: number,
  now: number
): RateLimitResult {
  const existing = memoryStore.get(identifier)
  const windowEnd = now + cfg.windowMs

  if (existing && existing.windowEnd > now) {
    existing.count++

    if (existing.count > cfg.maxRequests) {
      const retryAfter = Math.ceil((existing.windowEnd - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.windowEnd,
        retryAfter,
        limit: cfg.maxRequests,
        current: existing.count,
      }
    }

    return {
      allowed: true,
      remaining: cfg.maxRequests - existing.count,
      resetAt: existing.windowEnd,
      limit: cfg.maxRequests,
      current: existing.count,
    }
  }

  memoryStore.set(identifier, { count: 1, windowEnd })

  return {
    allowed: true,
    remaining: cfg.maxRequests - 1,
    resetAt: windowEnd,
    limit: cfg.maxRequests,
    current: 1,
  }
}

/**
 * Middleware helper para rate limit em API routes
 */
export async function rateLimitMiddleware(
  request: Request,
  route: string,
  config?: Partial<RateLimitConfig>
): Promise<RateLimitResult | null> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'

  const result = await checkRateLimit(ip, route, config)

  if (!result.allowed) {
    return result
  }

  return null // null = permitido
}
