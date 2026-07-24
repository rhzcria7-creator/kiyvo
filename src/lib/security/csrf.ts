// ─────────────────────────────────────────────────────────────
// CSRF Protection — geração/validação de tokens anti-cross-site
// Usa cookie SameSite=Lax + token em header/body para mutations.
// ─────────────────────────────────────────────────────────────
import crypto from 'crypto'

const SECRET = process.env.CSRF_SECRET || 'kiyvo-csrf-default-secret-change-me'
const COOKIE_NAME = 'kiyvo_csrf'
const TOKEN_VALIDITY_MS = 1000 * 60 * 60 * 6 // 6h

export function generateCSRFToken(): { token: string; cookieValue: string } {
  const sessionId = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now().toString(36)
  const payload = `${sessionId}.${timestamp}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 16)
  const token = `${payload}.${sig}`
  return { token, cookieValue: token }
}

export function validateCSRFToken(token: string | null | undefined): boolean {
  if (!token) return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const [sessionId, ts, sig] = parts
    const payload = `${sessionId}.${ts}`
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 16)
    if (sig !== expectedSig) return false
    const timestamp = parseInt(ts, 36)
    if (Date.now() - timestamp > TOKEN_VALIDITY_MS) return false
    return true
  } catch {
    return false
  }
}

export const CSRF_COOKIE_NAME = COOKIE_NAME
