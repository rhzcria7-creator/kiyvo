// ─────────────────────────────────────────────────────────────
// Coupon Engine v0.0.1 — Cupons de 2% a 70% de desconto
// Tipos: percentage, fixed, free shipping
// Validação: data, uso máximo, valor mínimo, uso por usuário
// ─────────────────────────────────────────────────────────────

export type CouponType = 'percentage' | 'fixed' | 'free_delivery'
export type CouponScope = 'global' | 'seller' | 'product' | 'category'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number // percentage (2-70) or fixed amount in BRL
  scope: CouponScope
  scopeId?: string // seller_id, product_id, or category
  minPurchase: number
  maxDiscount: number | null // cap for percentage coupons
  maxUses: number
  usedCount: number
  maxUsesPerUser: number
  isActive: boolean
  startsAt: string
  expiresAt: string
  createdAt: string
}

export interface CouponValidationResult {
  valid: boolean
  coupon?: Coupon
  discount: number
  reason?: string
}

export class CouponEngine {
  /**
   * Valida e calcula desconto de um cupom
   */
  validate(params: {
    coupon: Coupon
    subtotal: number
    userId: string
    userPreviousUses: number
    sellerId?: string
    productId?: string
    category?: string
  }): CouponValidationResult {
    const { coupon, subtotal, userId, userPreviousUses, sellerId, productId, category } = params

    // 1. Ativo
    if (!coupon.isActive) {
      return { valid: false, discount: 0, reason: 'Cupom inativo' }
    }

    // 2. Data
    const now = new Date()
    if (new Date(coupon.startsAt) > now) {
      return { valid: false, discount: 0, reason: 'Cupom ainda não está válido' }
    }
    if (new Date(coupon.expiresAt) < now) {
      return { valid: false, discount: 0, reason: 'Cupom expirado' }
    }

    // 3. Uso máximo global
    if (coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discount: 0, reason: 'Cupom esgotado' }
    }

    // 4. Uso por usuário
    if (userPreviousUses >= coupon.maxUsesPerUser) {
      return { valid: false, discount: 0, reason: 'Você já usou este cupom' }
    }

    // 5. Valor mínimo
    if (subtotal < coupon.minPurchase) {
      return { valid: false, discount: 0, reason: `Valor mínimo: R$ ${coupon.minPurchase.toFixed(2)}` }
    }

    // 6. Scope
    if (coupon.scope === 'seller' && coupon.scopeId !== sellerId) {
      return { valid: false, discount: 0, reason: 'Cupom não aplicável a este vendedor' }
    }
    if (coupon.scope === 'product' && coupon.scopeId !== productId) {
      return { valid: false, discount: 0, reason: 'Cupom não aplicável a este produto' }
    }
    if (coupon.scope === 'category' && coupon.scopeId !== category) {
      return { valid: false, discount: 0, reason: 'Cupom não aplicável a esta categoria' }
    }

    // 7. Calcular desconto
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100)
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, subtotal)
    }

    discount = Math.round(discount * 100) / 100

    return { valid: true, coupon, discount }
  }

  /**
   * Gera código de cupom aleatório
   */
  generateCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    // Format: KIYVO-XXXX
    return `KIYVO-${code}`
  }
}

export const couponEngine = new CouponEngine()
