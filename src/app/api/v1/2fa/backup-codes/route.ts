// ─────────────────────────────────────────────────────────────
// API v1 2FA Backup Codes — Regenera códigos de backup
// Invalida todos os códigos anteriores e gera novos
// Requer código TOTP válido para confirmar
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { regenerateBackupCodes } from '@/lib/auth/two-factor'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error || !user) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const body = await request.json()
    const { totp_code } = body

    if (!totp_code || typeof totp_code !== 'string') {
      return NextResponse.json({ error: 'Código TOTP é obrigatório' }, { status: 400 })
    }

    const sanitizedCode = totp_code.replace(/[^0-9]/g, '')

    const result = await regenerateBackupCodes(user.id, sanitizedCode)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // ⚠️ Códigos são retornados APENAS nesta resposta
    // O usuário deve salvá-los imediatamente
    return NextResponse.json({
      success: true,
      backupCodes: result.codes,
      message: 'Novos códigos de backup gerados. Salve-os em local seguro.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
