// v0.0.1 — Cupons com faixa segura e cálculo determinístico.
export interface Coupon { code: string; discountType: 'percent' | 'fixed'; value: number; minOrder: number; maxUses?: number; usedCount: number; startsAt?: Date; expiresAt?: Date }
export function applyCoupon(coupon: Coupon, subtotal: number, now = new Date()): { valid: boolean; discount: number; total: number; reason?: string } {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return { valid: false, discount: 0, total: subtotal, reason: 'Subtotal inválido.' }
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false, discount: 0, total: subtotal, reason: 'Cupom ainda não está ativo.' }
  if (coupon.expiresAt && coupon.expiresAt < now) return { valid: false, discount: 0, total: subtotal, reason: 'Cupom expirado.' }
  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0, total: subtotal, reason: 'Limite de uso atingido.' }
  if (subtotal < coupon.minOrder) return { valid: false, discount: 0, total: subtotal, reason: 'Valor mínimo não atingido.' }
  if (coupon.discountType === 'percent' && (coupon.value < 2 || coupon.value > 70)) return { valid: false, discount: 0, total: subtotal, reason: 'Percentual fora da faixa permitida.' }
  const discount = Math.min(subtotal, Math.round((coupon.discountType === 'percent' ? subtotal * coupon.value / 100 : coupon.value) * 100) / 100)
  return { valid: true, discount, total: Math.round((subtotal - discount) * 100) / 100 }
}
