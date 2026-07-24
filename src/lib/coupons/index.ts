// ===========================================================================
// KIYVO — Serviço de Cupons (compartilhado)
//
// Valida e calcula descontos de cupons de forma SEGURA e CONSISTENTE entre:
//   - Modo demo (LocalDB): usa os cupons semeados em src/lib/localdb.
//   - Modo produção (Supabase): usa a tabela `coupons`.
//
// Em modo local, valida direto no LocalDB (sem dependência do Supabase).
// Em modo produção, valida no Supabase (não cai no LocalDB para evitar
// vazar cupons de demonstração).
//
// Comentários em PT-BR. Tipagem estrita.
// ===========================================================================

import { isLocalBackend } from '@/lib/backend/detect'

export interface CouponInfo {
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  calculated_discount: number
}

export interface CouponValidation {
  valid: boolean
  coupon?: CouponInfo
  error?: string
}

/** Formato normalizado de um cupom vindo de qualquer fonte (LocalDB ou Supabase). */
interface RawCoupon {
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_active: boolean
  max_uses: number | null
  used_count: number
  min_order_value: number | null
  expires_at: string | null
  starts_at: string | null
}

function calcDiscount(subtotal: number, type: string, value: number): number {
  if (type === 'percentage') {
    return Math.round(subtotal * (value / 100) * 100) / 100
  }
  return Math.round(value * 100) / 100
}

/** Valida um cupom normalizado contra o subtotal atual. */
function evaluate(raw: RawCoupon, subtotal: number): CouponValidation {
  if (!raw.is_active) return { valid: false, error: 'Cupom inválido ou expirado' }
  if (raw.max_uses != null && raw.used_count >= raw.max_uses) {
    return { valid: false, error: 'Cupom esgotado' }
  }
  if (raw.starts_at && new Date(raw.starts_at) > new Date()) {
    return { valid: false, error: 'Cupom ainda não está disponível' }
  }
  if (raw.expires_at && new Date(raw.expires_at) < new Date()) {
    return { valid: false, error: 'Cupom expirado' }
  }
  if (raw.min_order_value != null && subtotal < raw.min_order_value) {
    return {
      valid: false,
      error: `Pedido mínimo de R$ ${Number(raw.min_order_value).toFixed(2).replace('.', ',')}`,
    }
  }
  const calculated = calcDiscount(subtotal, raw.discount_type, Number(raw.discount_value))
  return {
    valid: true,
    coupon: {
      code: raw.code,
      description: raw.description,
      discount_type: raw.discount_type,
      discount_value: Number(raw.discount_value),
      calculated_discount: calculated,
    },
  }
}

/** Validação no LocalDB (modo demo). */
function validateLocal(code: string, subtotal: number): CouponValidation {
  // Importação lazy para não carregar o LocalDB em produção.
  const { getDb } = require('@/lib/localdb') as typeof import('@/lib/localdb')
  const db = getDb()
  const found = db.coupons.find((c) => c.code === code && c.is_active)
  if (!found) return { valid: false, error: 'Cupom inválido ou expirado' }
  return evaluate(
    {
      code: found.code,
      description: null,
      discount_type: found.discount_type,
      discount_value: found.discount_value,
      is_active: found.is_active,
      max_uses: found.max_uses,
      used_count: found.used_count,
      min_order_value: found.min_order_value,
      expires_at: found.expires_at,
      starts_at: null,
    },
    subtotal,
  )
}

/** Validação no Supabase (modo produção). */
async function validateSupabase(code: string, subtotal: number): Promise<CouponValidation> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const sb = createAdminClient()
    if (!sb) return { valid: false, error: 'Serviço de cupons indisponível' }

    const { data: coupon, error } = await sb
      .from('coupons')
      .select('code, description, discount_type, discount_value, is_active, max_uses, used_count, min_order_value, expires_at, starts_at')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !coupon) return { valid: false, error: 'Cupom inválido ou expirado' }

    return evaluate(
      {
        code: String(coupon.code),
        description: (coupon.description as string | null) ?? null,
        discount_type: (coupon.discount_type as 'percentage' | 'fixed') ?? 'percentage',
        discount_value: Number(coupon.discount_value),
        is_active: Boolean(coupon.is_active),
        max_uses: (coupon.max_uses as number | null) ?? null,
        used_count: Number(coupon.used_count ?? 0),
        min_order_value: (coupon.min_order_value as number | null) ?? null,
        expires_at: (coupon.expires_at as string | null) ?? null,
        starts_at: (coupon.starts_at as string | null) ?? null,
      },
      subtotal,
    )
  } catch {
    return { valid: false, error: 'Erro ao validar cupom' }
  }
}

/**
 * Valida um cupom e retorna o desconto calculado.
 * Em modo local usa o LocalDB; em produção usa o Supabase.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  const normalized = code.toUpperCase().trim()
  if (!normalized) return { valid: false, error: 'Código do cupom é obrigatório' }

  if (isLocalBackend()) {
    return validateLocal(normalized, subtotal)
  }
  return validateSupabase(normalized, subtotal)
}
