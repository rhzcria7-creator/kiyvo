// ─────────────────────────────────────────────────────────────
// Cart Engine v0.0.1 — Gerenciamento completo de carrinho
// Multi-vendedor, validação estoque, cálculo automático
// ─────────────────────────────────────────────────────────────

import { FeeEngineV2 } from '@/domain/fees/FeeEngineV2'

export interface CartItem {
  productId: string
  sellerId: string
  title: string
  slug: string
  price: number
  originalPrice?: number
  quantity: number
  maxQuantity: number
  thumbnail: string
  category: string
  sellerName: string
  sellerLevel: string
  deliveryType: 'instant' | 'manual'
  isTaxFree: boolean
  hasBoost: boolean
  licenseType?: 'personal' | 'commercial' | 'enterprise'
}

export interface CartSellerGroup {
  sellerId: string
  sellerName: string
  sellerLevel: string
  items: CartItem[]
  subtotal: number
  fee: number
  netAmount: number
}

export interface CartSummary {
  items: CartItem[]
  sellerGroups: CartSellerGroup[]
  totalItems: number
  subtotal: number
  totalFees: number
  totalNetAmount: number
  buyerServiceFee: number
  totalWithFees: number
  canCheckout: boolean
  errors: string[]
}

const feeEngine = new FeeEngineV2()

export class CartEngine {
  /**
   * Agrupa itens por vendedor e calcula taxas
   */
  calculateSummary(items: CartItem[], couponDiscount: number = 0): CartSummary {
    const errors: string[] = []
    const sellerMap = new Map<string, CartItem[]>()

    // Agrupar por vendedor
    for (const item of items) {
      const existing = sellerMap.get(item.sellerId) || []
      existing.push(item)
      sellerMap.set(item.sellerId, existing)

      // Validar quantidade
      if (item.quantity > item.maxQuantity) {
        errors.push(`"${item.title}" excede a quantidade máxima de ${item.maxQuantity}`)
      }
    }

    // Calcular por vendedor
    const sellerGroups: CartSellerGroup[] = []
    let subtotal = 0

    for (const [sellerId, sellerItems] of Array.from(sellerMap.entries())) {
      const groupSubtotal = sellerItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
      const sellerLevel = sellerItems[0]?.sellerLevel || 'bronze'
      const sellerName = sellerItems[0]?.sellerName || 'Vendedor'

      const feeResult = feeEngine.calculate({
        price: groupSubtotal,
        sellerLevel: sellerLevel as any,
        paymentMethod: 'pix',
      })

      sellerGroups.push({
        sellerId,
        sellerName,
        sellerLevel,
        items: sellerItems,
        subtotal: groupSubtotal,
        fee: feeResult.totalDeductions,
        netAmount: feeResult.netAmount,
      })

      subtotal += groupSubtotal
    }

    // Aplicar cupom
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount)

    // Taxa de serviço do comprador (0.7%)
    const buyerServiceFee = Math.round(discountedSubtotal * 0.007 * 100) / 100
    const totalWithFees = discountedSubtotal + buyerServiceFee

    return {
      items,
      sellerGroups,
      totalItems: items.length,
      subtotal,
      totalFees: sellerGroups.reduce((s: number, g: any) => s + g.fee, 0),
      totalNetAmount: sellerGroups.reduce((s, g) => s + g.netAmount, 0),
      buyerServiceFee,
      totalWithFees,
      canCheckout: errors.length === 0 && items.length > 0,
      errors,
    }
  }

  /**
   * Valida carrinho (estoque, preço, etc)
   */
  validateItem(item: CartItem): { valid: boolean; reason?: string } {
    if (item.quantity < 1) {
      return { valid: false, reason: 'Quantidade deve ser pelo menos 1' }
    }
    if (item.quantity > item.maxQuantity) {
      return { valid: false, reason: `Máximo ${item.maxQuantity} unidades` }
    }
    if (item.price <= 0) {
      return { valid: false, reason: 'Preço inválido' }
    }
    return { valid: true }
  }

  /**
   * Serializa carrinho para localStorage
   */
  serialize(items: CartItem[]): string {
    return JSON.stringify(items.map(i => ({
      ...i,
      // Remove dados computados
    })))
  }

  /**
   * Deserializa carrinho do localStorage
   */
  deserialize(data: string): CartItem[] {
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }
}

export const cartEngine = new CartEngine()
