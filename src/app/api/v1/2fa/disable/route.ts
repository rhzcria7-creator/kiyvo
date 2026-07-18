// ─────────────────────────────────────────────────────────────
// API v1 2FA Disable — Desativa 2FA para o usuário
// Requer código TOTP ou backup para confirmar
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { disableTwoFactor } from '@/lib/auth/two-factor'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error || !user) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código de verificação é obrigatório' }, { status: 400 })
    }

    const sanitizedCode = code.replace(/[^A-Za-z0-9-]/g, '').toUpperCase()

    const result = await disableTwoFactor(user.id, sanitizedCode)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: '2FA desativado' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
