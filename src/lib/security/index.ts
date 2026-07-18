// ─────────────────────────────────────────────────────────────
// KIYVO — Security Utilities v3.0
// Anti-hacker, anti-fraud, rate limiting, CSRF, bot detection
// ✅ Sem setInterval (memory leak em serverless)
// ✅ Zero `any` types
// ✅ Lazy cleanup (igual ao middleware)
// ─────────────────────────────────────────────────────────────

// ─── Rate Limiting (in-memory com lazy cleanup) ──────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

/**
 * Lazy cleanup de entradas expiradas
 * Chamado a cada verificação — sem setInterval, sem memory leak
 */
function cleanupRateLimits(): void {
  const now = Date.now()
  rateLimitMap.forEach((val, key) => {
    if (now > val.resetTime || (val.blocked && now > val.resetTime + 3600000)) {
      rateLimitMap.delete(key)
    }
  })
}

export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000): { allowed: boolean; remaining: number; blocked: boolean } {
  // Lazy cleanup
  cleanupRateLimits()

  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs, blocked: false })
    return { allowed: true, remaining: limit - 1, blocked: false }
  }

  if (record.blocked) {
    return { allowed: false, remaining: 0, blocked: true }
  }

  if (record.count >= limit) {
    // Incrementar mesmo negado para rastrear abuso
    record.count++
    // Auto-block após 3x o limit excedido na mesma janela
    if (record.count >= limit * 3) {
      record.blocked = true
      return { allowed: false, remaining: 0, blocked: true }
    }
    return { allowed: false, remaining: 0, blocked: false }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, blocked: false }
}

export function unblockIP(ip: string): void {
  rateLimitMap.delete(ip)
}

export function getBlockedIPs(): string[] {
  const blocked: string[] = []
  const now = Date.now()
  rateLimitMap.forEach((val, ip) => {
    if (val.blocked && now <= val.resetTime + 3600000) blocked.push(ip)
  })
  return blocked
}

// ─── Input Sanitization ─────────────────────────────────────
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/url\s*\(/gi, '')
    .replace(/@import/gi, '')
    .replace(/document\./gi, '')
    .replace(/window\./gi, '')
    .replace(/\.cookie/gi, '')
    .replace(/\.localStorage/gi, '')
    .trim()
    .slice(0, 10000)
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>{}()[\]\\\/]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|WHERE|FROM|TABLE|ALTER|CREATE|EXEC|EXECUTE|xp_|sp_|0x)\b)/gi, '')
    .replace(/--/g, '')
    .replace(/;/g, '')
    .replace(/'/g, '')
    .replace(/"/g, '')
    .trim()
    .slice(0, 200)
}

// ─── CPF Validation ─────────────────────────────────────────
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

// ─── CEP Validation ─────────────────────────────────────────
export function validateCEP(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep)
}

// ─── CSRF Protection (lazy cleanup, sem setInterval) ────────
const csrfTokens = new Map<string, { token: string; expires: number }>()

function cleanupCSRFTokens(): void {
  const now = Date.now()
  csrfTokens.forEach((val, key) => {
    if (now > val.expires) csrfTokens.delete(key)
  })
}

export function generateCSRFToken(sessionId: string): string {
  // Lazy cleanup
  cleanupCSRFTokens()

  const token = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID() + crypto.randomUUID()
    : Array.from({ length: 64 }, () => Math.random().toString(36)[2]).join('')
  csrfTokens.set(sessionId, { token, expires: Date.now() + 24 * 60 * 60 * 1000 })
  return token
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  cleanupCSRFTokens()
  const stored = csrfTokens.get(sessionId)
  if (!stored) return false
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId)
    return false
  }
  // Timing-safe comparison
  let result = 0
  for (let i = 0; i < stored.token.length; i++) {
    result |= stored.token.charCodeAt(i) ^ (token.charCodeAt(i) || 0)
  }
  return result === 0 && stored.token.length === token.length
}

// ─── Bot Detection ──────────────────────────────────────────
const botPatterns = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /curl/i, /wget/i,
  /python-requests/i, /go-http/i, /php\//i, /ruby/i,
  /semrush/i, /ahrefs/i, /moz\.com/i, /screaming/i,
  /masscan/i, /nmap/i, /nikto/i, /sqlmap/i,
  /^java\//i,
]

export function isBot(userAgent: string): boolean {
  if (!userAgent) return true
  return botPatterns.some(pattern => pattern.test(userAgent))
}

// ─── Honeypot Field Validation ──────────────────────────────
export function isHoneypotTriggered(data: Record<string, string>): boolean {
  const honeypotFields = ['website', 'url', 'company_website', 'fax', 'phone_home']
  return honeypotFields.some(field => data[field] && data[field].length > 0)
}

// ─── Fraud Detection v3.0 ───────────────────────────────────
interface FraudCheckResult {
  risk: 'low' | 'medium' | 'high' | 'critical'
  score: number
  flags: string[]
  recommendedAction: 'allow' | 'review' | 'block' | 'block_and_alert'
}

export function detectFraud(params: {
  amount: number
  userId: string
  ip: string
  timeSinceSignup: number
  previousOrders: number
  previousDisputes: number
  paymentMethod: string
  deviceFingerprint?: string
  userAgent?: string
  velocityCheck?: number
}): FraudCheckResult {
  const flags: string[] = []
  let riskScore = 0

  if (params.userAgent && isBot(params.userAgent)) {
    flags.push('bot_detected')
    riskScore += 80
  }

  if (params.amount > 2000) { flags.push('very_high_value'); riskScore += 40 }
  else if (params.amount > 500) { flags.push('high_value'); riskScore += 20 }

  if (params.timeSinceSignup < 0.01) { flags.push('account_minutes_old'); riskScore += 40 }
  else if (params.timeSinceSignup < 1) { flags.push('new_account_same_day'); riskScore += 30 }
  else if (params.timeSinceSignup < 7) { flags.push('new_account_week'); riskScore += 15 }

  if (params.velocityCheck && params.velocityCheck > 5) { flags.push('velocity_attack'); riskScore += 50 }
  else if (params.velocityCheck && params.velocityCheck > 3) { flags.push('high_velocity'); riskScore += 25 }

  if (params.previousDisputes > 3) { flags.push('serial_disputer'); riskScore += 40 }
  else if (params.previousDisputes > 1) { flags.push('multiple_disputes'); riskScore += 25 }
  else if (params.previousDisputes > 0) { flags.push('has_disputes'); riskScore += 10 }

  if (params.paymentMethod === 'crypto') { flags.push('crypto_payment'); riskScore += 15 }

  if (params.previousOrders === 0 && params.amount > 100) { flags.push('first_purchase_high'); riskScore += 20 }

  if (params.ip === 'unknown' || params.ip.startsWith('10.')) { flags.push('suspicious_ip'); riskScore += 10 }

  let risk: FraudCheckResult['risk']
  let recommendedAction: FraudCheckResult['recommendedAction']

  if (riskScore >= 80) {
    risk = 'critical'
    recommendedAction = 'block_and_alert'
  } else if (riskScore >= 50) {
    risk = 'high'
    recommendedAction = 'block'
  } else if (riskScore >= 25) {
    risk = 'medium'
    recommendedAction = 'review'
  } else {
    risk = 'low'
    recommendedAction = 'allow'
  }

  return { risk, score: riskScore, flags, recommendedAction }
}

// ─── Security Headers ───────────────────────────────────────
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://api.stripe.com https://ytiyqkliojawihfnlwzo.supabase.co wss://ytiyqkliojawihfnlwzo.supabase.co",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join('; '),
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless',
  }
}

// ─── Password Strength v3.0 ─────────────────────────────────
export function checkPasswordStrength(password: string): { score: number; label: string; color: string; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score++
  else suggestions.push('Mínimo 8 caracteres')

  if (password.length >= 12) score++
  if (password.length >= 16) score++

  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Adicione letras maiúsculas')

  if (/[a-z]/.test(password)) score++
  else suggestions.push('Adicione letras minúsculas')

  if (/[0-9]/.test(password)) score++
  else suggestions.push('Adicione números')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else suggestions.push('Adicione caracteres especiais')

  const commonPasswords = ['123456', 'password', '12345678', 'qwerty', '123456789', 'abc123', 'senha', '1234567']
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0
    suggestions.length = 0
    suggestions.push('Esta senha é muito comum. Use uma senha única.')
  }

  if (/(?:abc|123|qwerty|asdf)/i.test(password)) {
    score = Math.max(0, score - 1)
    suggestions.push('Evite sequências óbvias')
  }

  if (score <= 2) return { score, label: 'Fraca', color: 'bg-red-500', suggestions }
  if (score <= 4) return { score, label: 'Média', color: 'bg-amber-500', suggestions }
  return { score, label: 'Forte', color: 'bg-emerald-500', suggestions }
}

// ─── Device Fingerprint (Client-side only) ──────────────────
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'unknown'

  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('KiyvoFP', 2, 2)

  const nav = navigator as Navigator & { deviceMemory?: number }
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    nav.deviceMemory || 0,
    canvas.toDataURL(),
  ].join('|')

  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return 'fp_' + Math.abs(hash).toString(36)
}

// ─── Encryption Utilities ───────────────────────────────────
export function hashSensitiveData(data: string): string {
  let hash = 0
  const salt = process.env.NEXT_PUBLIC_SITE_URL || 'kiyvo'
  const combined = data + salt
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export function generateSecureToken(length: number = 32): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length)
  }
  return Array.from({ length }, () => Math.random().toString(36)[2]).join('')
}

// ─── IP Analysis ────────────────────────────────────────────
export function analyzeIP(ip: string): { isProxy: boolean; isVPN: boolean; isTor: boolean; country: string } {
  const torExits = ['10.0.0.0']
  const isTor = torExits.includes(ip)

  return {
    isProxy: false,
    isVPN: false,
    isTor,
    country: 'BR',
  }
}

// ─── Setup Check ────────────────────────────────────────────
export function isSetupComplete(): {
  supabase: boolean
  stripe: boolean
  webhook: boolean
  storage: boolean
} {
  return {
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')),
    stripe: !!process.env.STRIPE_SECRET_KEY,
    webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    storage: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')),
  }
}
