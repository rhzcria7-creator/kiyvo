// ─────────────────────────────────────────────────────────────
// Refund Engine v0.0.1 — Automação de reembolsos
// Regras automáticas, prorrateio, taxas, chargeback prevention
// ─────────────────────────────────────────────────────────────

export type RefundReason = 'product_defective' | 'not_as_described' | 'didnt_deliver' | 'buyer_remorse' | 'duplicate_purchase' | 'unauthorized_charge' | 'technical_issue' | 'other'
export type RefundType = 'full' | 'partial' | 'store_credit' | 'exchange'
export interface RefundRequest { id: string; orderId: string; buyerId: string; sellerId: string; amount: number; reason: RefundReason; description: string; type: RefundType; feeDeduction: number; netRefund: number; status: 'pending' | 'approved' | 'rejected' | 'processed'; approvedBy: string | null; processedAt: string | null; createdAt: string }

export class RefundEngine {
  AUTO_REFUND_HOURS = 7 * 24 // 7 dias para auto-refund
  AUTO_REFUND_MAX_AMOUNT = 100

  canAutoRefund(orderAmount: number, hoursSincePurchase: number): { auto: boolean; reason?: string } {
    if (orderAmount > this.AUTO_REFUND_MAX_AMOUNT) return { auto: false, reason: 'Valor acima do limite de reembolso automático' }
    if (hoursSincePurchase > this.AUTO_REFUND_HOURS) return { auto: false, reason: 'Prazo de reembolso automático excedido' }
    return { auto: true }
  }

  calculateRefund(amount: number, type: RefundType, sellerFee: number, daysSincePurchase: number): { refundAmount: number; feeDeduction: number; netRefund: number } {
    let refundAmount = amount
    let feeDeduction = 0

    if (type === 'partial') refundAmount = amount * 0.5
    else if (type === 'store_credit') feeDeduction = 0

    if (daysSincePurchase <= 7) feeDeduction = 0 // Full refund within 7 days
    else feeDeduction = sellerFee

    return { refundAmount: Math.round(refundAmount * 100) / 100, feeDeduction: Math.round(feeDeduction * 100) / 100, netRefund: Math.round((refundAmount - feeDeduction) * 100) / 100 }
  }

  createRequest(params: { orderId: string; buyerId: string; sellerId: string; amount: number; reason: RefundReason; description: string; type?: RefundType }): RefundRequest {
    const calc = this.calculateRefund(params.amount, params.type || 'full', params.amount * 0.07, 0)
    return { id: `ref_${Date.now()}`, ...params, type: params.type || 'full', ...calc, status: 'pending', approvedBy: null, processedAt: null, createdAt: new Date().toISOString() }
  }

  processAutoRefund(request: RefundRequest): RefundRequest {
    return { ...request, status: 'processed', approvedBy: 'system', processedAt: new Date().toISOString() }
  }
}
export const refundEngine = new RefundEngine()
