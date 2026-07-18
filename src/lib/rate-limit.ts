// ─────────────────────────────────────────────────────────────
// KIYVO — Rate Limiting Persistente via Supabase
// Substitui o rate limiting em memória que reseta em cada deploy
// Usa tabela rate_limit_tracking (schema v6) para persistência
// Com fallback in-memory para quando DB não está disponível
// ─────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/server'

// ─── IN-MEMORY FALLBACK ─────────────────────────────────────
// Usado quando o DB não está disponível ou para performance
const memoryMap = new Map<string, { count: number; resetAt: number }>()

function cleanupMemory(): void {
  const now = Date.now()
  memoryMap.forEach((val, key) => {
    if (val.resetAt < now) memoryMap.delete(key)
  })
}

function checkMemoryLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  cleanupMemory()
  const now = Date.now()
  const current = memoryMap.get(key)

  if (!current || current.resetAt < now) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: limit - current.count }
}

// ─── DATABASE-BACKED RATE LIMITING ───────────────────────────

interface RateLimitEntry {
  id: string
  identifier: string
  action: string
  request_count: number
  window_start: string
  window_end: string
  blocked_until: string | null
}

/**
 * Verifica rate limit usando o banco de dados (persistente)
 * Cai para in-memory se o DB não estiver disponível
 *
 * @param identifier - IP, user_id, fingerprint, etc.
 * @param action - Nome da ação (ex: 'login', 'checkout', 'api_search')
 * @param limit - Número máximo de requisições na janela
 * @param windowMs - Duração da janela em milissegundos
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; blocked: boolean }> {
  const admin = createAdminClient()

  if (!admin) {
    // Fallback in-memory
    const memResult = checkMemoryLimit(`${action}:${identifier}`, limit, windowMs)
    return { ...memResult, blocked: false }
  }

  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() - (now.getTime() % windowMs))
    const windowEnd = new Date(windowStart.getTime() + windowMs)

    // Buscar entrada existente na janela atual
    const { data: existing, error: fetchError } = await admin
      .from('rate_limit_tracking')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('window_end', now.toISOString())
      .maybeSingle()

    if (fetchError) {
      // DB error — fallback in-memory
      const memResult = checkMemoryLimit(`${action}:${identifier}`, limit, windowMs)
      return { ...memResult, blocked: false }
    }

    // Verificar se está bloqueado
    const entry = existing as RateLimitEntry | null
    if (entry?.blocked_until && new Date(entry.blocked_until) > now) {
      return { allowed: false, remaining: 0, blocked: true }
    }

    if (!entry) {
      // Criar nova entrada
      await admin
        .from('rate_limit_tracking')
        .insert({
          identifier,
          action,
          request_count: 1,
          window_start: windowStart.toISOString(),
          window_end: windowEnd.toISOString(),
          blocked_until: null,
        })

      return { allowed: true, remaining: limit - 1, blocked: false }
    }

    // Verificar limite
    if (entry.request_count >= limit) {
      // Auto-block após 3x o limite
      const shouldBlock = entry.request_count >= limit * 3
      const blockedUntil = shouldBlock
        ? new Date(now.getTime() + 3600000).toISOString() // 1 hora
        : null

      if (shouldBlock && !entry.blocked_until) {
        await admin
          .from('rate_limit_tracking')
          .update({ blocked_until: blockedUntil })
          .eq('id', entry.id)
      }

      return { allowed: false, remaining: 0, blocked: shouldBlock }
    }

    // Incrementar contador
    await admin
      .from('rate_limit_tracking')
      .update({ request_count: entry.request_count + 1 })
      .eq('id', entry.id)

    return {
      allowed: true,
      remaining: limit - entry.request_count - 1,
      blocked: false,
    }
  } catch {
    // Qualquer erro — fallback in-memory
    const memResult = checkMemoryLimit(`${action}:${identifier}`, limit, windowMs)
    return { ...memResult, blocked: false }
  }
}

/**
 * Limpa entradas expiradas do rate limiting
 * Deve ser chamado periodicamente (ex: via cron ou middleware)
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const admin = createAdminClient()
  if (!admin) return 0

  try {
    const { count } = await admin
      .from('rate_limit_tracking')
      .delete({ count: 'exact' })
      .lt('window_end', new Date().toISOString())

    return count || 0
  } catch {
    return 0
  }
}

/**
 * Desbloqueia um identificador (uso admin)
 */
export async function unblockIdentifier(
  identifier: string,
  action: string
): Promise<boolean> {
  const admin = createAdminClient()
  if (!admin) return false

  try {
    await admin
      .from('rate_limit_tracking')
      .delete()
      .eq('identifier', identifier)
      .eq('action', action)

    return true
  } catch {
    return false
  }
}

/**
 * Obtém todos os IPs/identifiers bloqueados
 */
export async function getBlockedIdentifiers(): Promise<RateLimitEntry[]> {
  const admin = createAdminClient()
  if (!admin) return []

  try {
    const { data } = await admin
      .from('rate_limit_tracking')
      .select('*')
      .not('blocked_until', 'is', null)
      .gt('blocked_until', new Date().toISOString())

    return (data as RateLimitEntry[]) || []
  } catch {
    return []
  }
}
