// ─────────────────────────────────────────────────────────────
// API v1 Coupons Validate — Valida cupom de desconto real
// Usa o serviço compartilhado (Supabase em produção, LocalDB em demo).
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon } from '@/lib/coupons'

/**
 * GET /api/v1/coupons/validate?code=WELCOME10&subtotal=100
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code') ?? ''
    const subtotal = parseFloat(searchParams.get('subtotal') || '0')

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Código do cupom é obrigatório' },
        { status: 400 },
      )
    }

    const result = await validateCoupon(code, subtotal)

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error || 'Cupom inválido' })
    }

    return NextResponse.json({ valid: true, coupon: result.coupon })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao validar cupom'
    return NextResponse.json({ valid: false, error: message }, { status: 500 })
  }
}
