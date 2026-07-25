// v0.0.1 — Rate limit persistente. O banco faz incremento atômico para evitar corrida.
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

export interface PersistentRateLimitResult { allowed: boolean; remaining: number; retryAfter: number }

function hashIdentifier(identifier: string): string {
  return createHash('sha256').update(identifier).digest('hex')
}

const emergencyWindows = new Map<string, { count: number; resetAt: number }>()

function emergencyLimit(key: string, limit: number, windowSeconds: number): PersistentRateLimitResult {
  const now = Date.now(); const current = emergencyWindows.get(key)
  if (!current || current.resetAt <= now) { emergencyWindows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 }); return { allowed: true, remaining: limit - 1, retryAfter: windowSeconds } }
  current.count += 1
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
}

export async function enforcePersistentRateLimit(identifier: string, endpoint: string, limit: number, windowSeconds: number): Promise<PersistentRateLimitResult> {
  const admin = createAdminClient(); const key = `${endpoint}:${hashIdentifier(identifier)}`
  if (!admin) return emergencyLimit(key, limit, windowSeconds)
  try {
    const { data, error } = await admin.rpc('check_rate_limit_v001', { p_identifier_hash: hashIdentifier(identifier), p_endpoint: endpoint, p_limit: limit, p_window_seconds: windowSeconds })
    if (error || !data) return emergencyLimit(key, limit, windowSeconds)
    const result = data as { allowed: boolean; remaining: number; retry_after: number }
    return { allowed: result.allowed, remaining: result.remaining, retryAfter: result.retry_after }
  } catch { return emergencyLimit(key, limit, windowSeconds) }
}
