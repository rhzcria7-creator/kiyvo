export const runtime = "nodejs";
// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/validate-email
//
// Valida e-mail no servidor (anti-temp-mail completo).
// Retorna { allowed: boolean, reason?: string }
// Usado pelo formulário de cadastro em onBlur.
// Rate limitado pra não virar ferramenta de scraping.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { isEmailAllowed } from '@/lib/security/antiFraud'

// Rate limit in-memory simples
const attempts = new Map<string, number>()
const WINDOW_MS = 60_000
const MAX_PER_MIN = 30

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const now = Date.now()
    const current = attempts.get(ip) ?? 0
    if (current >= MAX_PER_MIN) {
      return NextResponse.json({ allowed: false, reason: 'Muitas tentativas. Aguarde um minuto.' }, { status: 429 })
    }
    attempts.set(ip, current + 1)
    setTimeout(() => {
      const c = attempts.get(ip) ?? 1
      if (c <= 1) attempts.delete(ip)
      else attempts.set(ip, c - 1)
    }, WINDOW_MS)

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email : ''

    if (!email) {
      return NextResponse.json({ allowed: false, reason: 'E-mail é obrigatório' }, { status: 400 })
    }

    const result = isEmailAllowed(email)
    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason ?? null,
      domain: result.domain,
    })
  } catch {
    return NextResponse.json({ allowed: false, reason: 'Erro ao validar e-mail' }, { status: 400 })
  }
}
