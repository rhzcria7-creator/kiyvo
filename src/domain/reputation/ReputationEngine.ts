// ─────────────────────────────────────────────────────────────
// Reputation Engine v0.0.1 — Termômetro verde/amarelo/vermelho
// Mercado Livre style + Response Time tracker
// ─────────────────────────────────────────────────────────────

export type ThermometerColor = 'green' | 'yellow' | 'red'

export interface SellerReputation {
  rating: number
  totalReviews: number
  verifiedReviews: number
  positivePercent: number
  responseRate: number
  averageResponseTime: number // em horas
  salesLast30d: number
  completedOrders: number
  cancellations: number
  disputes: number
  disputesWon: number
  thermometer: ThermometerColor
  level: string
}

export class ReputationEngine {
  /**
   * Calcula termômetro estilo Mercado Livre
   */
  calculateThermometer(positivePercent: number, rating: number): ThermometerColor {
    if (positivePercent >= 90 && rating >= 4.5) return 'green'
    if (positivePercent >= 70 || rating >= 3.5) return 'yellow'
    return 'red'
  }

  /**
   * Calcula resposta média em horas
   */
  calculateAverageResponseTime(responseTimes: number[]): number {
    if (responseTimes.length === 0) return 0
    return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10
  }

  /**
   * Calcula taxa de resposta
   */
  calculateResponseRate(answered: number, total: number): number {
    if (total === 0) return 100
    return Math.round((answered / total) * 100)
  }

  /**
   * Calcula reputação completa
   */
  calculateFullReputation(params: {
    reviews: Array<{ rating: number; verified: boolean }>
    responseTimes: number[]
    totalMessages: number
    answeredMessages: number
    sales30d: number
    completedOrders: number
    cancellations: number
    disputes: number
    disputesWon: number
    sellerLevel: string
  }): SellerReputation {
    const { reviews, responseTimes, totalMessages, answeredMessages, sales30d, completedOrders, cancellations, disputes, disputesWon, sellerLevel } = params

    const totalReviews = reviews.length
    const verifiedReviews = reviews.filter(r => r.verified).length
    const averageRating = totalReviews > 0
      ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / totalReviews * 10) / 10
      : 0
    const positiveReviews = reviews.filter(r => r.rating >= 4).length
    const positivePercent = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0

    return {
      rating: averageRating,
      totalReviews,
      verifiedReviews,
      positivePercent,
      responseRate: this.calculateResponseRate(answeredMessages, totalMessages),
      averageResponseTime: this.calculateAverageResponseTime(responseTimes),
      salesLast30d: sales30d,
      completedOrders,
      cancellations,
      disputes,
      disputesWon,
      thermometer: this.calculateThermometer(positivePercent, averageRating),
      level: sellerLevel,
    }
  }
}

export const reputationEngine = new ReputationEngine()
