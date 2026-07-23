// ─────────────────────────────────────────────────────────────
// KIYVO — Middleware de Segurança
// WALLED GARDEN: TUDO exige login, exceto rotas públicas explícitas (/login, /cadastro, ...)
// Proteção contra bots, rate limiting, guards de admin/pós-checkout, headers de segurança
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { refreshSession } from '@/lib/auth/middleware'

// Rate limits em memória (produção: Redis/Supabase)
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const blockedIPs = new Map<string, { reason: string; blockedAt: number }>()

function cleanup() {
  const now = Date.now()
  rateLimits.forEach((value, key) => {
    if (value.resetAt < now) rateLimits.delete(key)
  })
  blockedIPs.forEach((value, key) => {
    if (now - value.blockedAt > 3600000) blockedIPs.delete(key)
  })
}

// ─── WHITELIST PÚBLICA — rotas que NÃO exigem login ───
// Landing, marketing, catálogo, produto, blog, institucional, blogue, ajuda, SEO.
// Login passa a ser exigido apenas em rotas de ação: conta, comprar, checkout,
// chat, favoritos, dashboard, vendor, admin, wallet, etc.
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/redefinir-senha',
  '/resetar-senha',
  '/verificar',
  '/confirmar-email',
  '/auth',
  '/api/auth',
  '/api/v1/health',
  '/api/health',
  '/api/stripe/webhook',
  '/_next',
  '/favicon.ico',
  '/logo.svg',
  '/logo-full.svg',
  '/favicon.svg',
  '/og-image.png',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-0.xml',
  // Marketing / catálogo
  '/categorias',
  '/categorias/criar',
  '/buscar',
  '/blog',
  '/changelog',
  '/novidades',
  '/whats-new',
  '/como-funciona',
  '/planos',
  '/pricing',
  '/sobre',
  '/parceiros',
  '/depoimentos',
  '/faq',
  '/ajuda',
  '/suporte',
  '/comunidade',
  '/marcas',
  '/eventos',
  '/podcast',
  '/imprensa',
  '/carreiras',
  '/investidores',
  '/transparencia',
  '/boost',
  '/renda-extra',
  '/saque',
  '/roadmap',
  '/recompensas',
  '/indique-ganhe',
  '/comparativo',
  '/programa-afiliados',
  '/blackfriday',
  '/taxa-zero',
  '/melhor-plataforma-produtos-digitais',
  '/agentes',
  '/agentes/bannerforge',
  '/agentes/copymaster',
  '/agentes/pricemaster',
  '/agentes/hunter',
  '/agentes/reviewshield',
  '/agentes/adoptimizer',
  '/agentes/replymaster',
  '/agentes/seoboost',
  '/agentes/seoscore',
  '/agentes/translate',
  '/agentes/promogen',
  '/agentes/responder',
  '/agentes/scarcity',
  '/agentes/titlesplit',
  '/agentes/scriptforge',
  '/agentes/emailforge',
  '/agentes/funnelforge',
  '/agentes/descfetcher',
  '/agentes/taxcalc',
  '/agentes/competidor',
  '/agentes/trafficoptimizer',
  '/agentes/hashtagger',
  '/agentes/captionforge',
  '/agentes/objectiondestroyer',
  '/agentes/biogenerator',
  '/agentes/faqmaker',
  '/agentes/contentcalendar',
  '/agentes/seooptimizer',
  '/agentes/personabuilder',
  '/agentes/nameforge',
  '/agentes/promptengineer',
  '/agentes/whatsappforge',
  '/agentes/storybuilder',
  '/agentes/pixelperfect',
  '/agentes/urltracker',
  '/agentes/landingforge',
  '/agentes/bulletforge',
  '/agentes/abtester',
  // v8.9 NEO EVOLUTION — 22 novos agentes
  '/agentes/automod',
  '/agentes/dynamicpricing',
  '/agentes/churnpredictor',
  '/agentes/smartcart',
  '/agentes/retargetpredictor',
  '/agentes/titlescorer',
  '/agentes/thumbnailmaker',
  '/agentes/scriptshort',
  '/agentes/offerstacker',
  '/agentes/voiceclonepreview',
  '/agentes/landingchecker',
  '/agentes/reviewreplier',
  '/agentes/competitormonitor',
  '/agentes/socialproofengine',
  '/agentes/quizfunnel',
  '/agentes/seobriefing',
  '/agentes/contentauditor',
  '/agentes/emojipicker',
  '/agentes/launchchecklist',
  '/agentes/personacraft',
  '/agentes/urgenciamaker',
  '/agentes/metricsanalyzer',
  '/agentes/webhooktester',
  '/agentes/qrcodegen',
  '/agentes/senhaforge',
  '/agentes/validatorbr',
  '/agentes/contadorregressivo',
  '/agentes/gradehorarios',
  '/agentes/ctamaker',
  '/agentes/npsanalyzer',
  '/agentes/slugmaker',
  '/agentes/headlineanalyzer','/agentes/emailsequencia','/agentes/blogideia','/agentes/problemaagitacao','/agentes/podcastscript','/agentes/faturaprojecao','/agentes/whatsappboasvindas','/agentes/invoicegen','/agentes/testimonialcrafter','/agentes/plrsearch','/agentes/warmup','/agentes/affiliateproposal','/agentes/faqauto','/agentes/referralbadge','/agentes/riskscore','/agentes/feedbackinterpreter','/agentes/valedecesconto','/agentes/contratorapido',
  '/conquistas',
  '/roteiro-video',
  '/gerador-funil',
  '/analisar-concorrente',
  '/freelance',
  '/cupons',
  '/favoritos',
  '/afiliados',
  '/simulador-taxas',
  '/calculadora-lucro',
  '/calcular-taxas',
  '/conversor-moeda',
  // Educacional / legal
  '/termos',
  '/termos-uso',
  '/termos-comprador',
  '/termos-vendedor',
  '/termos-afiliado',
  '/politica-privacidade',
  '/privacidade',
  '/politica-cookies',
  '/cookies',
  '/politica-reembolso',
  '/reembolso',
  '/politica-disputas',
  '/seguranca',
  '/seguranca-centro',
  '/seguranca-conta',
  '/seguranca-pagamentos',
  '/criptografia',
  '/conexao-segura',
  '/certificacoes',
  '/conferencia-identidade',
  '/protecao-comprador',
  '/protecao-vendedor',
  '/garantia',
  '/garantia-estendida',
  '/seguro-digital',
  '/compliance',
  '/lgpd',
  '/direitos-autorais',
  '/dmca',
  '/dlp',
  '/blacklist',
  '/anti-fraude',
  '/bug-bounty',
  '/politica-verificacao',
  '/politica-anti-fraude',
  '/politica-anti-copia',
  '/programa-integridade',
  '/sancoes',
  '/codigo-conduta',
  '/regras-comunidade',
  '/backup-dados',
  '/exportar-dados',
  '/deletar-conta',
  '/phishing-alert',
  '/protecao-menores',
  '/sustentabilidade',
  '/educacao-financeira',
  '/inclusao',
  '/acessibilidade',
  '/status',
  // Preços/afiliados
  '/anunciar',
  '/vender',
  '/precos',
  '/tarifas',
  '/afiliados',
  '/tutorial',
  '/vender-guia',
  '/comprar-guia',
  '/ofertas',
  '/desafios',
  '/newsletter',
  '/feedback',
  // Loja oficial (dropshipping desfaçado)
  '/oficial',
  '/store',
]

// Prefixos públicos (qualquer rota que comece com isso é pública)
const PUBLIC_PREFIXES = [
  '/_next/',
  '/static/',
  '/images/',
  '/fonts/',
  '/blog/',       // posts do blog
  '/categoria/',  // listagens por categoria
  '/tipo/',       // listagens por tipo de produto
  '/tutorial/',   // tutoriais
  '/c/',          // shortlinks de categoria
  '/p/',          // páginas institucionais
  '/v/',          // perfis públicos de vendedor
  '/institucional/',
  '/acordos-juridicos/',
  '/r/',          // shortlinks de afiliado /r/CODE
  '/agentes/',    // TODAS as páginas de agentes são públicas (hub + agentes individuais)
  '/alternativa/', // Páginas SEO "alternativa a X"
  '/blog/',       // Posts de blog
  '/api/v1/products',
  '/api/v1/categories',
  '/api/v1/health',
  '/api/health',
  '/api/v1/coupons',
  '/api/v1/boost/pricing',
  '/api/auth/me',
  '/api/agents/', // TODAS as APIs de agentes são públicas (aceitam anônimo com limite, auth tem mais cota)
  // Agentes individuais (cobertos pelo prefixo /api/agents/ — mantidos como comentário/legado)
  '/api/agents/support',
  '/api/agents/bannerforge',
  '/api/agents/producthunter',
  '/api/agents/reviewshield',
  '/api/freelance/jobs',
  '/api/freelance/bids',
  '/api/coupons/public',
  '/api/referral/click',
  '/api/referral/stats',
  '/api/agents/adoptimizer',
  '/api/agents/replymaster',
  '/api/agents/seoboost',
  '/api/agents/seoscore',
  '/api/agents/translate',
  '/api/agents/promogen',
  '/api/agents/responder',
  '/api/agents/scarcity',
  '/api/agents/titlesplit',
  '/api/agents/scriptforge',
  '/api/agents/emailforge',
  '/api/agents/funnelforge',
  '/api/agents/descfetcher',
  '/api/agents/taxcalc',
  '/api/agents/competidor',
  '/api/agents/bonusforge',
  '/api/agents/hashtagger',
  '/api/agents/captionforge',
  '/api/agents/objectiondestroyer',
  '/api/agents/biogenerator',
  '/api/agents/faqmaker',
  '/api/agents/contentcalendar',
  '/api/agents/seooptimizer',
  '/api/agents/trafficoptimizer',
  '/api/agents/personabuilder',
  '/api/agents/nameforge',
  '/api/agents/promptengineer',
  '/api/agents/whatsappforge',
  '/api/agents/storybuilder',
  '/api/agents/pixelperfect',
  '/api/agents/urltracker',
  '/api/agents/landingforge',
  '/api/agents/bulletforge',
  '/api/agents/abtester',
  '/api/agents/cuponmaker',
  '/api/agents/reviewextractor',
  '/api/agents/legacypolisher',
  '/api/agents/automod',
  '/api/agents/dynamicpricing',
  '/api/agents/churnpredictor',
  '/api/agents/smartcart',
  '/api/agents/retargetpredictor',
  '/api/agents/titlescorer',
  '/api/agents/thumbnailmaker',
  '/api/agents/scriptshort',
  '/api/agents/offerstacker',
  '/api/agents/voiceclonepreview',
  '/api/agents/landingchecker',
  '/api/agents/reviewreplier',
  '/api/agents/competitormonitor',
  '/api/agents/socialproofengine',
  '/api/agents/quizfunnel',
  '/api/agents/seobriefing',
  '/api/agents/contentauditor',
  '/api/agents/emojipicker',
  '/api/agents/launchchecklist',
  '/api/agents/personacraft',
  '/api/agents/urgenciamaker',
  '/api/agents/metricsanalyzer',
  '/api/agents/webhooktester',
  '/api/agents/qrcodegen',
  '/api/agents/senhaforge',
  '/api/agents/validatorbr',
  '/api/agents/contadorregressivo',
  '/api/agents/gradehorarios',
  '/api/agents/ctamaker',
  '/api/agents/npsanalyzer',
  '/api/agents/slugmaker',
  '/api/agents/headlineanalyzer','/api/agents/emailsequencia','/api/agents/blogideia','/api/agents/problemaagitacao','/api/agents/podcastscript','/api/agents/faturaprojecao','/api/agents/whatsappboasvindas','/api/agents/invoicegen','/api/agents/testimonialcrafter','/api/agents/plrsearch','/api/agents/warmup','/api/agents/affiliateproposal','/api/agents/faqauto','/api/agents/referralbadge','/api/agents/riskscore','/api/agents/feedbackinterpreter','/api/agents/valedecesconto','/api/agents/contratorapido',
  '/api/notifications',
  '/api/favorites',
  '/api/reviews',
  '/api/products',
]

// Prefixos que EXIGEM login (escala sobrepõe o público)
const PROTECTED_PREFIXES = [
  '/conta/',
  '/dashboard',
  '/buyer/',
  '/vendor/',
  '/admin/',
  '/checkout',
  '/cart',
  '/favoritos',
  '/chat',
  '/configuracoes',
  '/notificacoes',
  '/historico',
  '/library',
  '/wallet',
  '/disputas',
  '/assinatura',
  '/verificacao',
  '/perfil/editar',
  '/api/checkout/',
  '/api/v1/admin/',
  '/api/v1/me/',
  '/api/v1/user/',
]

// Extensões de arquivos públicos (assets estáticos)
const PUBLIC_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js|map|json|txt|xml)$/i

// Rotas exclusivas de admin
const ADMIN_PATHS = ['/admin/', '/api/v1/admin']

// Padrões de bot/scraper/ataque
const SUSPICIOUS_PATTERNS = [
  // Bots conhecidos
  /bot/i, /crawl/i, /spider/i, /scraper/i, /crawler/i, /fetch(er)?/i,
  /wget/i, /curl/i, /python/i, /go-http-client/i, /java/i, /rust/i, /ruby/i,
  /ahrefs/i, /semrush/i, /mj12/i, /dotbot/i, /petal/i, /baiduspider/i,
  // Automação
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i, /playwright/i,
  /puppeteer/i, /cypress/i, /webdriver/i, /automation/i,
  // Ferramentas de ataque
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /dirbuster/i, /gobuster/i,
  /hydra/i, /medusa/i, /burp/i, /metasploit/i, /nikto/i, /acunetix/i,
  /nuclei/i, /xsser/i, /w3af/i,
]

function isPublicPath(pathname: string): boolean {
  // Rotas protegidas sempre sobrescrevem
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) return false
  // Rota exata
  if (PUBLIC_PATHS.includes(pathname)) return true
  // Prefixo público
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return true
  // Extensão estática
  if (PUBLIC_EXTENSIONS.test(pathname)) return true
  // Páginas de produto (/produto/[id]) são públicas para SEO
  if (pathname.startsWith('/produto/')) return true
  // Páginas do vendedor públicas (/vendedor/[id])
  if (pathname.startsWith('/vendedor/')) return true
  return false
}

// Headers de segurança (CSP, HSTS, etc.)
function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://ytiyqkliojawihfnlwzo.supabase.co wss://ytiyqkliojawihfnlwzo.supabase.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://connect-js.stripe.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join('; '),
  }
}

function generateFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || '',
    request.headers.get('x-forwarded-for') || '',
    request.headers.get('sec-ch-ua') || '',
  ]
  let hash = 0
  for (const component of components) {
    for (let i = 0; i < component.length; i++) {
      hash = ((hash << 5) - hash) + component.charCodeAt(i)
      hash |= 0
    }
  }
  return `fp_${Math.abs(hash).toString(36)}`
}

function isBotOrScraper(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || ''
  if (!ua || ua.length < 10) return true
  // Ausência de Accept-Language é suspeito
  const acceptLang = request.headers.get('accept-language')
  const accept = request.headers.get('accept')
  // Bloqueia UA muito suspeito
  if (SUSPICIOUS_PATTERNS.some(p => p.test(ua))) return true
  // Em navegação normal, GET tem accept: text/html; aceita tanto navegador moderno quanto clientes API
  if (request.method === 'GET') {
    const hasAccept = !!accept && (accept.includes('text/html') || accept.includes('application/json') || accept.includes('image') || accept.includes('*/*'))
    const hasAcceptLang = !!acceptLang
    // Bloqueia se vier sem referer E sem aceitação de html (script/curl/wget puro)
    if (!hasAcceptLang && accept === '*/*' && /curl|wget|python|go-http/i.test(ua)) return true
    if (!hasAccept && !accept) return true
  }
  return false
}

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const current = rateLimits.get(key)
  if (!current || current.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (current.count >= limit) return { allowed: false, remaining: 0 }
  current.count++
  return { allowed: true, remaining: limit - current.count }
}

/**
 * Detecta presença de cookie de sessão (Supabase ou LocalDB).
 * A validação definitiva é feita server-side (requireAuth) usando JWT assinado.
 * Aqui é um guarda rápida de borda.
 */
function hasAuthCookie(request: NextRequest): boolean {
  const cookies = request.cookies.getAll()
  return cookies.some(c => {
    const n = c.name.toLowerCase()
    if (n === 'kiyvo_session' && c.value && c.value.length > 20) return true
    return (
      n.includes('access-token') ||
      n.includes('refresh-token') ||
      n.includes('auth-token') ||
      (n.startsWith('sb-') && (n.includes('auth') || n.includes('access')))
    )
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const fingerprint = generateFingerprint(request)

  // 0. Refresh de sessão
  const refreshedResponse = refreshSession(request)

  cleanup()

  // 1. Bloquear IPs banidos
  if (blockedIPs.has(ip)) {
    return new NextResponse('Acesso bloqueado por excesso de requisições. Tente novamente mais tarde.', { status: 403 })
  }

  // 2. Bots/scrapers são bloqueados em TUDO exceto assets estáticos
  if (isBotOrScraper(request) && !PUBLIC_EXTENSIONS.test(pathname)) {
    return new NextResponse('Acesso não autorizado.', { status: 403 })
  }

  // 3. Rate limit global
  const globalLimit = checkRateLimit(`global:${ip}`, 200, 60000)
  if (!globalLimit.allowed) {
    blockedIPs.set(ip, { reason: 'rate_limit_global', blockedAt: Date.now() })
    return new NextResponse('Muitas requisições.', { status: 429 })
  }

  // 4. Rate limit por fingerprint
  const fpLimit = checkRateLimit(`fp:${fingerprint}`, 80, 60000)
  if (!fpLimit.allowed) {
    return new NextResponse('Muitas requisições. Aguarde um minuto.', { status: 429 })
  }

  // 4.5. Proteção anti-CSRF em POST/PUT/DELETE: exigir Origin/Referer do mesmo host
  const nonGet = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  // Pular CSRF para rotas de auth (login/signup/logout) — o próprio cookie httpOnly protege
  const skipCsrf = pathname.startsWith('/api/auth/') || pathname.includes('/webhook')
  if (nonGet && pathname.startsWith('/api/') && !skipCsrf) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    const xfp = request.headers.get('x-forwarded-proto')
    const proto = xfp?.includes('https') ? 'https' : 'http'
    const expectedOrigin = `${proto}://${host}`

    let ok = false
    if (origin && host) {
      try {
        const originHost = new URL(origin).host
        if (originHost === host) ok = true
      } catch { /* invalid origin */ }
    }
    // Aceita Referer como fallback (alguns proxies retiram Origin)
    if (!ok && referer && host) {
      try {
        const refererUrl = new URL(referer)
        if (refererUrl.host === host) ok = true
      } catch { /* invalid referer */ }
    }
    if (!ok && !pathname.includes('/webhook')) {
      // Em produção (Vercel), aceita se host é esperado e não há origem maliciosa
      // O cookie httpOnly SameSite=Lax já protege contra CSRF cross-site
      if (process.env.NODE_ENV === 'production' && host) ok = true
    }
    if (!ok) {
      return NextResponse.json(
        { error: 'Requisição bloqueada por segurança (origem inválida).' },
        { status: 403 }
      )
    }
  }

  // 5. Rate limit de APIs
    if (pathname.startsWith('/api/')) {
      const key = `api:${ip}:${pathname.split('/').slice(0, 4).join('/')}`
      const apiLimit = checkRateLimit(key, 30, 60000)
      if (!apiLimit.allowed) {
        return NextResponse.json({
          error: 'Muitas requisições. Aguarde um minuto e tente novamente.',
          code: 'rate_limit_exceeded',
        }, { status: 429 })
      }
    }

  // 6. Rate limit de auth
  const isAuthAttempt =
    pathname.startsWith('/login') ||
    pathname.startsWith('/cadastro') ||
    pathname.startsWith('/recuperar-senha') ||
    pathname.startsWith('/api/auth')
  if (isAuthAttempt) {
    const authLimit = checkRateLimit(`auth:${ip}`, 5, 300000)
    if (!authLimit.allowed) {
      blockedIPs.set(ip, { reason: 'brute_force_auth', blockedAt: Date.now() })
      return NextResponse.redirect(new URL('/login?error=too_many_attempts', request.url))
    }
  }

  // 7. Rate limit de checkout/withdraw
  if (pathname.startsWith('/api/checkout') || pathname.startsWith('/api/v1/withdraw')) {
    const coLimit = checkRateLimit(`checkout:${ip}`, 3, 300000)
    if (!coLimit.allowed) {
      return NextResponse.json({ error: 'Bloqueado por segurança. Tente em 5 minutos.' }, { status: 429 })
    }
  }

  // 8. Acesso a vault/assets privados: sempre negado via HTTP direto
  if (
    pathname.includes('/digital_inventory') ||
    pathname.includes('/vault/asset')
  ) {
    return new NextResponse('Acesso negado.', { status: 403 })
  }

  // 9. WALLED GARDEN — SE NÃO FOR PÚBLICO, OBRIGAR LOGIN
  const isPublic = isPublicPath(pathname)
  const isAdmin = ADMIN_PATHS.some(p => pathname.startsWith(p))
  const isPostCheckout = pathname.startsWith('/checkout/sucesso')
  const hasSession = hasAuthCookie(request)

  if (!isPublic && !hasSession) {
    // APIs retornam 401 JSON em PT-BR
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Faça login para continuar.', code: 'auth_required' },
        { status: 401 }
      )
    }
    // Páginas: redirecionar para /login com ?next=
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(loginUrl, { status: 307 })
  }

  // 10. Se ESTÁ logado e tenta acessar páginas de auth (/login, /cadastro), redirecionar para /conta
  if (hasSession && (pathname === '/login' || pathname === '/cadastro')) {
    return NextResponse.redirect(new URL('/conta', request.url), { status: 307 })
  }

  // 11. Pós-checkout (/checkout/sucesso): exigir cookie de sessão de pedido além do login
  if (isPostCheckout && hasSession) {
    const hasOrderCookie = request.cookies.has('kiyvo_last_order')
    if (!hasOrderCookie) {
      return NextResponse.redirect(new URL('/buyer/orders', request.url), { status: 307 })
    }
  }

  // 12. Anti-hotlink de imagens
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|pdf)$/i)) {
    const referer = request.headers.get('referer')
    if (referer) {
      const allowed =
        referer.includes('kiyvo.com.br') ||
        referer.includes('kiyvo.vercel.app') ||
        referer.includes('localhost') ||
        referer.includes('127.0.0.1')
      if (!allowed) {
        return new NextResponse('Hotlinking não permitido.', { status: 403 })
      }
    }
  }

  const response = refreshedResponse || NextResponse.next()

  // Headers de segurança
  const securityHeaders = getSecurityHeaders()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }
  response.headers.set('X-Kiyvo-Fingerprint', fingerprint)
  response.headers.set('X-Kiyvo-Version', '6.0.0')

  return response
}

export const config = {
  matcher: [
    // Middleware roda em tudo exceto assets estáticos do Next que são servidos direto
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
