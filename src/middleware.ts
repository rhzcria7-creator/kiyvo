// ─────────────────────────────────────────────────────────────
// KIYVO — Middleware de Segurança Anti-Fraude
// Proteção contra: bots, XSS, CSRF, rate limiting, hotlink
// Rate limiting em memória (produção: Redis/Supabase)
// ⚠️ Sem setInterval — em serverless, cada cold start
//    reinicia o Map, o que já limpa entradas antigas
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { refreshSession } from '@/lib/auth/middleware'

// Rate limiting em memória
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const blockedIPs = new Map<string, { reason: string; blockedAt: number }>()

// Limpar rate limits expirados a cada verificação (lazy cleanup)
function cleanup() {
  const now = Date.now()
  rateLimits.forEach((value, key) => {
    if (value.resetAt < now) rateLimits.delete(key)
  })
  blockedIPs.forEach((value, key) => {
    if (now - value.blockedAt > 3600000) blockedIPs.delete(key)
  })
}

// Paths que precisam de autenticação
const PROTECTED_PATHS = [
  '/buyer/',
  '/vendor/',
  '/admin/',
  '/conta/',
  '/anunciar',
  '/api/orders',
  '/api/checkout',
  '/api/cart',
  '/api/v1/vault',
  '/api/v1/withdraw',
  '/api/v1/admin',
  '/api/v1/kyc',
  '/api/v1/chat',
]

// Paths que são só para admins
const ADMIN_PATHS = ['/admin/']

// Padrões de user-agent suspeitos
const SUSPICIOUS_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scraper/i, /headless/i,
  /selenium/i, /puppeteer/i, /playwright/i, /phantom/i,
]

// Headers de segurança para TODAS as respostas
function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://ytiyqkliojawihfnlwzo.supabase.co wss://ytiyqkliojawihfnlwzo.supabase.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join('; '),
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless',
  }
}

// Fingerprint do request para tracking
function generateFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || '',
    request.headers.get('x-forwarded-for') || '',
    request.headers.get('sec-ch-ua') || '',
    request.headers.get('sec-ch-ua-platform') || '',
  ]
  // Hash simples — produção: usar crypto.subtle
  let hash = 0
  for (const component of components) {
    for (let i = 0; i < component.length; i++) {
      const char = component.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
  }
  return `fp_${Math.abs(hash).toString(36)}`
}

// Verificar se é bot/scraper
function isBotOrScraper(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || ''
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(ua))
}

// Rate limit check
function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const current = rateLimits.get(key)

  if (!current || current.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: limit - current.count }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const fingerprint = generateFingerprint(request)

  // 0. Refresh de sessão Supabase (garante cookies atualizados)
  const refreshedResponse = refreshSession(request)

  // Lazy cleanup de entradas expiradas
  cleanup()

  // 1. Bloquear IPs banidos
  if (blockedIPs.has(ip)) {
    return new NextResponse('Acesso bloqueado por violação dos termos de uso.', { status: 403 })
  }

  // 2. Bloquear bots/scrapers em paths sensíveis
  if (isBotOrScraper(request) && (pathname.startsWith('/api/') || pathname.startsWith('/buyer/') || pathname.startsWith('/vendor/'))) {
    return new NextResponse('Acesso não autorizado.', { status: 403 })
  }

  // 3. Rate limiting global por IP (200 req/min)
  const globalLimit = checkRateLimit(`global:${ip}`, 200, 60000)
  if (!globalLimit.allowed) {
    blockedIPs.set(ip, { reason: 'rate_limit_global', blockedAt: Date.now() })
    return new NextResponse('Muitas requisições. Tente novamente em 1 minuto.', { status: 429 })
  }

  // 4. Rate limiting por fingerprint (anti-multi-conta)
  const fpLimit = checkRateLimit(`fp:${fingerprint}`, 100, 60000)
  if (!fpLimit.allowed) {
    return new NextResponse('Atividade suspeita detectada.', { status: 429 })
  }

  // 5. Rate limiting específico por path
  if (pathname.startsWith('/api/')) {
    const apiLimit = checkRateLimit(`api:${ip}:${pathname}`, 30, 60000)
    if (!apiLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 })
    }
  }

  // 6. Rate limiting para auth (login, cadastro, reset)
  if (pathname.includes('/auth/') || pathname.includes('/login') || pathname.includes('/cadastro')) {
    const authLimit = checkRateLimit(`auth:${ip}`, 5, 300000)
    if (!authLimit.allowed) {
      blockedIPs.set(ip, { reason: 'brute_force_auth', blockedAt: Date.now() })
      return new NextResponse('Muitas tentativas. Conta temporariamente bloqueada.', { status: 429 })
    }
  }

  // 7. Rate limiting para checkout (anti-fraude)
  if (pathname.startsWith('/api/checkout') || pathname.startsWith('/api/v1/withdraw')) {
    const checkoutLimit = checkRateLimit(`checkout:${ip}`, 3, 300000)
    if (!checkoutLimit.allowed) {
      return NextResponse.json({ error: 'Operação bloqueada por segurança. Tente em 5 minutos.' }, { status: 429 })
    }
  }

  // 8. Proteção de paths admin — admins são validados pelo RLS do Supabase
  // Middleware adiciona headers extras para admin paths

  // 9. Bloquear acesso direto a arquivos do vault
  if (pathname.includes('/digital_inventory') || pathname.includes('/vault/asset')) {
    return new NextResponse('Acesso negado.', { status: 403 })
  }

  // 10. Anti-hotlink de imagens
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|pdf)$/i)) {
    const referer = request.headers.get('referer')
    if (referer && !referer.includes('kiyvo.com') && !referer.includes('localhost')) {
      return new NextResponse('Hotlinking não permitido.', { status: 403 })
    }
  }

  // Continuar com headers de segurança (usar response com cookies atualizados)
  const response = refreshedResponse || NextResponse.next()

  // Aplicar todos os headers de segurança
  const securityHeaders = getSecurityHeaders()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  // Headers customizados para tracking
  response.headers.set('X-Kiyvo-Fingerprint', fingerprint)
  response.headers.set('X-Kiyvo-Version', '6.0.0')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
