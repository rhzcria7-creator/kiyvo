// ─────────────────────────────────────────────────────────────
// Magic Link Engine v0.0.1 — Login sem senha via email
// Tokens únicos com expiração 15 min, rate limit
// ─────────────────────────────────────────────────────────────

import { randomBytes, createHash } from 'crypto'

export interface MagicLink {
  token: string
  email: string
  userId: string | null
  expiresAt: string
  usedAt: string | null
  ip: string
  userAgent: string
  status: 'pending' | 'used' | 'expired'
  createdAt: string
}

export interface MagicLinkRequest {
  email: string
  ip: string
  userAgent: string
  redirectTo?: string
}

const TOKEN_EXPIRY_MINUTES = 15
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 3
const MAX_REQUESTS_PER_DAY = 10

// Rate limiting
const requestStore = new Map<string, { count: number; windowStart: number; dailyCount: number; dayStart: number }>()

export class MagicLinkEngine {
  /**
   * Gera token de magic link
   */
  generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * Cria magic link
   */
  create(request: MagicLinkRequest): MagicLink {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

    return {
      token: this.generateToken(),
      email: request.email.toLowerCase().trim(),
      userId: null,
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      ip: request.ip,
      userAgent: request.userAgent,
      status: 'pending',
      createdAt: now.toISOString(),
    }
  }

  /**
   * Verifica rate limit para email
   */
  checkRateLimit(email: string): { allowed: boolean; retryAfter?: number; reason?: string } {
    const now = Date.now()
    const normalized = email.toLowerCase().trim()
    const entry = requestStore.get(normalized) || { count: 0, windowStart: now, dailyCount: 0, dayStart: now }

    // Reset daily counter
    if (now - entry.dayStart > 24 * 60 * 60 * 1000) {
      entry.dailyCount = 0
      entry.dayStart = now
    }

    // Reset window counter
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      entry.count = 0
      entry.windowStart = now
    }

    // Check daily limit
    if (entry.dailyCount >= MAX_REQUESTS_PER_DAY) {
      const resetAt = new Date(entry.dayStart + 24 * 60 * 60 * 1000)
      return {
        allowed: false,
        reason: `Limite diário de ${MAX_REQUESTS_PER_DAY} solicitações excedido. Tente novamente após ${resetAt.toLocaleTimeString('pt-BR')}`,
      }
    }

    // Check window limit
    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
      return {
        allowed: false,
        retryAfter,
        reason: `Muitas solicitações. Tente novamente em ${retryAfter} segundos.`,
      }
    }

    // Update counters
    entry.count++
    entry.dailyCount++
    requestStore.set(normalized, entry)

    return { allowed: true }
  }

  /**
   * Valida token de magic link
   */
  validateToken(token: string, email: string, ip: string): { valid: boolean; reason?: string; magicLink?: MagicLink } {
    // Em produção: buscar do Supabase
    // Aqui: validação básica de formato
    if (token.length !== 64) {
      return { valid: false, reason: 'Token inválido' }
    }

    if (!/^[a-f0-9]+$/.test(token)) {
      return { valid: false, reason: 'Token inválido' }
    }

    return { valid: true }
  }

  /**
   * Gera hash do token para armazenamento seguro
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * Gera link de login para email
   */
  generateLoginLink(baseUrl: string, token: string, email: string, redirectTo?: string): string {
    const params = new URLSearchParams({
      token,
      email: email.toLowerCase().trim(),
    })
    if (redirectTo) params.set('redirect', redirectTo)

    return `${baseUrl}/auth/magic-link?${params.toString()}`
  }

  /**
   * Tempo restante em segundos para expiração
   */
  expiresIn(magicLink: MagicLink): number {
    return Math.max(0, Math.floor((new Date(magicLink.expiresAt).getTime() - Date.now()) / 1000))
  }
}

export const magicLinkEngine = new MagicLinkEngine()
