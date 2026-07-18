// ─────────────────────────────────────────────────────────────
// API v1 2FA Setup — Inicia configuração do 2FA
// Gera segredo TOTP, URI para QR Code e códigos de backup
// 2FA só é ativado após verificação bem-sucedida
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { setupTwoFactor } from '@/lib/auth/two-factor'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error || !user) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const result = await setupTwoFactor(user.id, user.email)

    // ⚠️ O segredo e códigos de backup são retornados APENAS nesta resposta
    // Nunca armazene no client — o usuário deve salvar os backup codes
    return NextResponse.json({
      success: true,
      uri: result.uri,          // URI para QR Code (otpauth://)
      backupCodes: result.backupCodes, // Códigos de backup (uso único)
      // NÃO retornamos o secret diretamente — apenas via URI
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
