// ─────────────────────────────────────────────────────────────
// Leaderboard Engine v0.0.1 — Rankings de vendedores e compradores
// Gamificação semanal, mensal, geral
// ─────────────────────────────────────────────────────────────

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time'
export type LeaderboardCategory = 'sellers_revenue' | 'sellers_sales' | 'sellers_rating' | 'buyers_kd_points' | 'buyers_reviews' | 'affiliates'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl: string
  sellerLevel?: string
  metric: number
  metricLabel: string
  change: number // posição change vs período anterior
  badge?: string
}

export interface Leaderboard {
  id: string
  period: LeaderboardPeriod
  category: LeaderboardCategory
  entries: LeaderboardEntry[]
  totalParticipants: number
  lastUpdated: string
  expiresAt: string
}

export class LeaderboardEngine {
  /**
   * Gera pontuação composta para ranking
   */
  calculateScore(params: {
    revenue: number
    sales: number
    rating: number
    reviewCount: number
    responseTime: number
    age: number // days since registration
  }): number {
    const revenueScore = Math.min(params.revenue / 100, 100) // R$100 = 100 pontos
    const salesScore = Math.min(params.sales * 2, 100) // 50 vendas = 100 pontos
    const ratingScore = (params.rating / 5) * 100
    const reviewScore = Math.min(params.reviewCount, 100)
    const responseScore = params.responseTime < 24 ? 100 : params.responseTime < 72 ? 50 : 10
    const ageScore = Math.min(params.age / 30, 100) // 30 dias = 100 pontos

    return Math.round((revenueScore * 0.3 + salesScore * 0.25 + ratingScore * 0.2 + reviewScore * 0.1 + responseScore * 0.1 + ageScore * 0.05))
  }

  /**
   * Calcula mudança de posição
   */
  calculatePositionChange(currentRank: number, previousRank: number | null): number {
    if (previousRank === null) return 0
    return previousRank - currentRank
  }

  /**
   * Gera badge baseado na posição
   */
  getRankBadge(rank: number): string {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    if (rank <= 10) return '⭐'
    if (rank <= 50) return '🔥'
    return '💎'
  }

  /**
   * Formata métrica para exibição
   */
  formatMetric(value: number, category: LeaderboardCategory): string {
    switch (category) {
      case 'sellers_revenue':
        return `R$ ${value.toFixed(2)}`
      case 'sellers_sales':
        return `${value} vendas`
      case 'sellers_rating':
        return `${value.toFixed(1)} ⭐`
      case 'buyers_kd_points':
        return `${value.toLocaleString()} KD`
      case 'buyers_reviews':
        return `${value} reviews`
      case 'affiliates':
        return `R$ ${value.toFixed(2)}`
      default:
        return String(value)
    }
  }

  /**
   * Gera ID do leaderboard atual
   */
  generateLeaderboardId(period: LeaderboardPeriod, category: LeaderboardCategory): string {
    const now = new Date()
    let periodSuffix = ''

    switch (period) {
      case 'weekly': {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        periodSuffix = weekStart.toISOString().split('T')[0]
        break
      }
      case 'monthly':
        periodSuffix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        break
      case 'all_time':
        periodSuffix = 'all'
        break
    }

    return `lb_${period}_${category}_${periodSuffix}`
  }

  /**
   * Calcula data de expiração do leaderboard
   */
  calculateExpiry(period: LeaderboardPeriod): string {
    const now = new Date()

    switch (period) {
      case 'weekly': {
        const nextMonday = new Date(now)
        nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()))
        nextMonday.setHours(0, 0, 0, 0)
        return nextMonday.toISOString()
      }
      case 'monthly': {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        return nextMonth.toISOString()
      }
      case 'all_time':
        return new Date(now.getFullYear() + 100, 0, 1).toISOString()
    }
  }

  /**
   * Distribui prêmios baseado no rank
   */
  calculatePrizes(rank: number, category: LeaderboardCategory): { kdPoints: number; boostHours: number; couponDiscount?: number } {
    const prizes = {
      1: { kdPoints: 10000, boostHours: 168 },
      2: { kdPoints: 5000, boostHours: 72 },
      3: { kdPoints: 2000, boostHours: 24 },
      4: { kdPoints: 1000, boostHours: 6 },
      5: { kdPoints: 500, boostHours: 6 },
    }

    if (rank <= 5) {
      return prizes[rank as keyof typeof prizes]
    }

    if (rank <= 10) return { kdPoints: 200, boostHours: 0 }
    if (rank <= 25) return { kdPoints: 100, boostHours: 0 }
    if (rank <= 50) return { kdPoints: 50, boostHours: 0 }

    return { kdPoints: 10, boostHours: 0 }
  }
}

export const leaderboardEngine = new LeaderboardEngine()
