// ─────────────────────────────────────────────────────────────
// Affiliate Payout Engine v0.0.1 — Comissões e saques afiliados
// Cálculo automático, períodos, mínimo para saque
// ─────────────────────────────────────────────────────────────

export interface AffiliateCommission { id: string; affiliateId: string; orderId: string; amount: number; rate: number; commission: number; status: 'pending' | 'approved' | 'paid' | 'cancelled'; orderStatus: string; createdAt: string; paidAt?: string }
export interface AffiliatePayout { id: string; affiliateId: string; periodStart: string; periodEnd: string; grossCommission: number; adjustments: number; netCommission: number; fee: number; method: 'pix' | 'ted' | 'credit'; status: 'pending' | 'processing' | 'completed' | 'failed'; createdAt: string }

export class AffiliatePayoutEngine {
  MIN_PAYOUT = 50
  PAYOUT_FEE = 4.99

  calculateCommission(saleAmount: number, rate: number): number { return Math.round(saleAmount * (rate / 100) * 100) / 100 }

  calculatePayout(commissions: AffiliateCommission[], adjustments = 0): Omit<AffiliatePayout, 'id' | 'affiliateId' | 'periodStart' | 'periodEnd' | 'createdAt'> {
    const grossCommission = commissions.filter(c => c.status === 'approved').reduce((s, c) => s + c.commission, 0)
    const netCommission = Math.max(0, grossCommission - adjustments)
    const fee = netCommission > 0 ? this.PAYOUT_FEE : 0

    return { grossCommission: Math.round(grossCommission * 100) / 100, adjustments, netCommission: Math.round(netCommission * 100) / 100, fee, method: 'pix', status: netCommission >= this.MIN_PAYOUT ? 'pending' : 'pending' }
  }

  canRequestPayout(pendingCommissions: AffiliateCommission[], alreadyRequested: AffiliateCommission[]): { can: boolean; reason?: string; availableBalance: number } {
    const approved = pendingCommissions.filter(c => c.status === 'approved')
    const total = approved.reduce((s, c) => s + c.commission, 0)
    if (total < this.MIN_PAYOUT) return { can: false, reason: `Saldo mínimo de R$ ${this.MIN_PAYOUT.toFixed(2)}. Seu saldo: R$ ${total.toFixed(2)}`, availableBalance: total }
    return { can: true, availableBalance: Math.round(total * 100) / 100 }
  }

  generatePeriod(): { start: string; end: string } {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start: start.toISOString(), end: end.toISOString() }
  }
}
export const affiliatePayoutEngine = new AffiliatePayoutEngine()
