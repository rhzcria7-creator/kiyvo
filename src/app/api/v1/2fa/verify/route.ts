// ─────────────────────────────────────────────────────────────
// API v1 2FA Verify — Verifica código TOTP ou backup
// Usado tanto para ativar 2FA (setup) quanto para login (2º fator)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { verifyTOTPSetup, verifyTwoFactorLogin } from '@/lib/auth/two-factor'
import { rateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting rigoroso para verificação 2FA (5 tentativas / 5 min)
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimit(ip, 5, 300000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 5 minutos.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { code, purpose } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 })
    }

    // Sanitizar código — apenas alfanuméricos e hífen
    const sanitizedCode = code.replace(/[^A-Za-z0-9-]/g, '').toUpperCase()
    if (sanitizedCode.length < 4 || sanitizedCode.length > 20) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    if (purpose === 'setup') {
      // Verificação durante ativação do 2FA
      const { user, error } = await requireAuth()
      if (error || !user) {
        return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
      }

      const result = await verifyTOTPSetup(user.id, sanitizedCode)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: '2FA ativado com sucesso!' })
    }

    if (purpose === 'login') {
      // Verificação durante login (2º fator)
      const { user, error } = await requireAuth()
      if (error || !user) {
        return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
      }

      const result = await verifyTwoFactorLogin(user.id, sanitizedCode)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Verificação 2FA concluída' })
    }

    return NextResponse.json({ error: 'Purpose inválido (use "setup" ou "login")' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
