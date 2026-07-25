// v0.0.1 — Pré-checagem protegida para checkout; jamais retorna detalhes que ajudem fraude.
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getSafeAdminClient } from '@/lib/auth/server'
import { evaluateServerAntiFraud } from '@/lib/security/serverAntiFraud'
import { enforcePersistentRateLimit } from '@/lib/security/persistentRateLimit'

export async function POST(request: NextRequest) {
  const { user, adminClient, error } = await requireAuth()
  if (error || !user) return NextResponse.json({ error: error || 'Faça login para continuar.' }, { status: 401 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const limit = await enforcePersistentRateLimit(`${user.id}:${ip}`, 'security-risk-check', 8, 300)
  if (!limit.allowed) return NextResponse.json({ error: 'Muitas tentativas. Aguarde antes de continuar.', retryAfter: limit.retryAfter }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
  try {
    const body = await request.json() as Record<string, unknown>
    const result = await evaluateServerAntiFraud({ ...body, ip })
    const admin = getSafeAdminClient(adminClient)
    await admin.from('risk_events').insert({ user_id: user.id, event_type: 'checkout_precheck', score: result.score, ip, metadata: { blocked: result.blocked, requiresStepUp: result.requiresStepUp, reasonCount: result.reasons.length } })
    if (result.blocked) return NextResponse.json({ error: 'Não foi possível validar esta tentativa de pagamento. Fale com o suporte.', requiresStepUp: false }, { status: 403 })
    return NextResponse.json({ allowed: true, requiresStepUp: result.requiresStepUp })
  } catch { return NextResponse.json({ error: 'Não foi possível validar esta tentativa.' }, { status: 400 }) }
}
