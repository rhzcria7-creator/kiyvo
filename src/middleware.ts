import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { isBot, getSecurityHeaders } from '@/lib/security'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''

  // 1. Security headers on all responses
  const response = await updateSession(request)

  // Add security headers
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // 2. Block bots from sensitive routes
  if (isBot(userAgent)) {
    const sensitiveRoutes = ['/api/', '/admin/', '/checkout', '/anunciar', '/verificacao']
    if (sensitiveRoutes.some(r => pathname.startsWith(r))) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // 3. Block suspicious methods
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }

  // 4. CSRF protection for API POST/PUT/DELETE routes
  if (['POST', 'PUT', 'DELETE'].includes(request.method) && pathname.startsWith('/api/')) {
    // Skip webhook routes (Stripe sends its own verification)
    if (pathname === '/api/stripe/webhook') {
      return response
    }

    // Skip setup and health (they have their own auth)
    if (pathname === '/api/health' || pathname === '/api/setup/status') {
      return response
    }

    // Check Origin header for CSRF
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (origin) {
      const allowedOrigins = [siteUrl, `https://${host}`, `http://${host}`]
      const originValid = allowedOrigins.some(allowed => origin.startsWith(allowed))
      if (!originValid) {
        return new NextResponse(JSON.stringify({ error: 'CSRF check failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  // 5. Rate limit headers
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  response.headers.set('X-Request-IP', ip.replace(/,.*$/, '').trim())

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
