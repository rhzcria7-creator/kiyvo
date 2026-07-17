// ─────────────────────────────────────────────────────────────
// API v1 Coupons Validate — Valida cupom de desconto real
// Zero mock — busca do Supabase
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * GET /api/v1/coupons/validate?code=WELCOME10&subtotal=100
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase()
    const subtotal = parseFloat(searchParams.get('subtotal') || '0')

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Código do cupom é obrigatório' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Cupom inválido ou expirado' })
    }

    // Validações
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'Cupom esgotado' })
    }

    if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
      return NextResponse.json({
        valid: false,
        error: `Pedido mínimo de R$ ${Number(coupon.min_order_value).toFixed(2)}`,
      })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Cupom expirado' })
    }

    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return NextResponse.json({ valid: false, error: 'Cupom ainda não está disponível' })
    }

    // Calcular desconto
    const discountValue = coupon.discount_type === 'percentage'
      ? Math.round(subtotal * (Number(coupon.discount_value) / 100) * 100) / 100
      : Number(coupon.discount_value)

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        calculated_discount: discountValue,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao validar cupom'
    return NextResponse.json({ valid: false, error: message }, { status: 500 })
  }
}
