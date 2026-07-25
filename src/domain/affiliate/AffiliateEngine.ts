// ─────────────────────────────────────────────────────────────
// Affiliate Engine v0.0.1 — Links de afiliado + rastreamento
// Cookie 30 dias, comissão custom 1-50%, clicks tracking
// Referral /r/CODIGO com bonus 500KD + 5% vitalício
// ─────────────────────────────────────────────────────────────

export interface AffiliateLink {
  id: string
  code: string
  userId: string
  commissionRate: number // 0.01 = 1%, max 0.50 = 50%
  cookieDays: number // default 30
  totalClicks: number
  totalSales: number
  totalCommission: number
  isActive: boolean
  createdAt: string
}

export interface ReferralCode {
  code: string
  referrerId: string
  referredId: string | null
  referredAt: string | null
  kdBonus: number // 500 KD Points
  commissionRate: number // 5% vitalício
  totalEarned: number
  createdAt: string
}

export class AffiliateEngine {
  /**
   * Gera link de afiliado único
   */
  generateAffiliateLink(baseUrl: string, code: string, productId?: string): string {
    const url = `${baseUrl}/r/${code}`
    return productId ? `${url}?product=${productId}` : url
  }

  /**
   * Gera link de referral /r/CODIGO
   */
  generateReferralLink(baseUrl: string, code: string): string {
    return `${baseUrl}/r/${code}`
  }

  /**
   * Calcula comissão de afiliado
   */
  calculateCommission(saleAmount: number, rate: number): number {
    return Math.round(saleAmount * rate * 100) / 100
  }

  /**
   * Gera código de referral aleatório
   */
  generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  /**
   * Calcula bonus de referral (500 KD + 5% vitalício)
   */
  calculateReferralBonus(saleAmount: number): { kdPoints: number; commission: number } {
    return {
      kdPoints: 500,
      commission: Math.round(saleAmount * 0.05 * 100) / 100,
    }
  }
}

export const affiliateEngine = new AffiliateEngine()
