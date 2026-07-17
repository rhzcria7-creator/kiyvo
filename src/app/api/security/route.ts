import { NextResponse } from 'next/server'
import { rateLimit, detectFraud, sanitizeInput } from '@/lib/security'

// POST /api/security/fraud-check
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed, remaining } = rateLimit(ip, 30, 60000)

  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const result = detectFraud({
      amount: Number(body.amount) || 0,
      userId: sanitizeInput(String(body.userId || '')),
      ip,
      timeSinceSignup: Number(body.timeSinceSignup) || 30,
      previousOrders: Number(body.previousOrders) || 0,
      previousDisputes: Number(body.previousDisputes) || 0,
      paymentMethod: sanitizeInput(String(body.paymentMethod || 'pix')),
    })

    return NextResponse.json({ ...result, rateLimit: { remaining } })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// GET /api/security/check — Security health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    features: [
      'rate_limiting',
      'input_sanitization',
      'fraud_detection',
      'cpf_validation',
      'device_fingerprinting',
      'security_headers',
      'xss_protection',
      'csrf_protection',
      'sql_injection_prevention',
    ],
    stripe_connected: !!process.env.STRIPE_SECRET_KEY,
  })
}
