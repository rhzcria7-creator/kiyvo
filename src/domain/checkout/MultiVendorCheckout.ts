// v0.0.1 — Divide carrinho por vendedor antes de qualquer cobrança.
import { calculateFee, type KiyvoSellerPlan } from '@/domain/fees/FeeEngine'

export interface CheckoutItem { productId: string; sellerId: string; sellerPlan: KiyvoSellerPlan; unitPrice: number; quantity: number }
export interface SellerOrderQuote { sellerId: string; subtotal: number; platformFee: number; sellerReceives: number; itemCount: number; feeExempt: boolean }
export interface CheckoutQuote { orders: SellerOrderQuote[]; subtotal: number; platformFee: number; total: number }

export function quoteMultiVendorCheckout(items: CheckoutItem[], salesBySeller: Record<string, number>): CheckoutQuote {
  if (items.length === 0) throw new Error('O carrinho está vazio.')
  const groups = new Map<string, CheckoutItem[]>()
  for (const item of items) {
    if (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 25) throw new Error('Item de carrinho inválido.')
    const group = groups.get(item.sellerId) ?? []
    group.push(item); groups.set(item.sellerId, group)
  }
  const orders = Array.from(groups.entries()).map(([sellerId, sellerItems]) => {
    const subtotal = Math.round(sellerItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0) * 100) / 100
    const fee = calculateFee(sellerItems[0].sellerPlan, subtotal, salesBySeller[sellerId] ?? 0)
    return { sellerId, subtotal, platformFee: fee.platformFee, sellerReceives: fee.sellerReceives, itemCount: sellerItems.reduce((total, item) => total + item.quantity, 0), feeExempt: fee.isFeeExempt }
  })
  const subtotal = Math.round(orders.reduce((total, order) => total + order.subtotal, 0) * 100) / 100
  const platformFee = Math.round(orders.reduce((total, order) => total + order.platformFee, 0) * 100) / 100
  return { orders, subtotal, platformFee, total: subtotal }
}
