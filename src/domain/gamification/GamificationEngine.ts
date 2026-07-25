// ─────────────────────────────────────────────────────────────
// Gamification Engine v0.0.1 — Badges, Daily Check-in, Streak, Spin Wheel
// Shopee-style gamificação para engajamento
// ─────────────────────────────────────────────────────────────

export type BadgeType = 
  | 'first_purchase' | 'first_sale' | 'power_seller' | 'top_rated'
  | 'streak_7' | 'streak_30' | 'streak_365'
  | 'reviewer' | 'photographer' | 'early_adopter'
  | 'inviter' | 'legendary'

export interface Badge {
  id: BadgeType
  name: string
  description: string
  icon: string
  kdPointsReward: number
  criteria: string
}

export interface DailyCheckIn {
  userId: string
  streak: number
  lastCheckIn: string
  totalCheckIns: number
  kdPointsEarned: number
}

export interface SpinWheelPrize {
  id: string
  name: string
  type: 'kd_points' | 'coupon' | 'boost' | 'free_delivery' | 'cashback'
  value: number
  probability: number // 0-1, sum = 1
  emoji: string
}

const BADGES: Record<BadgeType, Badge> = {
  first_purchase: { id: 'first_purchase', name: 'Primeira Compra', description: 'Realizou sua primeira compra no marketplace', icon: '🛒', kdPointsReward: 100, criteria: 'Completar 1 pedido' },
  first_sale: { id: 'first_sale', name: 'Primeira Venda', description: 'Vendeu seu primeiro produto', icon: '💰', kdPointsReward: 500, criteria: 'Realizar 1 venda' },
  power_seller: { id: 'power_seller', name: 'Power Seller', description: '100 vendas realizadas', icon: '⚡', kdPointsReward: 5000, criteria: '100 vendas' },
  top_rated: { id: 'top_rated', name: 'Top Rated', description: 'Média de avaliações acima de 4.8', icon: '⭐', kdPointsReward: 2000, criteria: 'Rating ≥ 4.8' },
  streak_7: { id: 'streak_7', name: 'Semana Completa', description: '7 dias seguidos de check-in', icon: '🔥', kdPointsReward: 200, criteria: '7 dias streak' },
  streak_30: { id: 'streak_30', name: 'Mês Completo', description: '30 dias seguidos de check-in', icon: '💪', kdPointsReward: 1000, criteria: '30 dias streak' },
  streak_365: { id: 'streak_365', name: 'Ano Completo', description: '365 dias seguidos de check-in', icon: '👑', kdPointsReward: 50000, criteria: '365 dias streak' },
  reviewer: { id: 'reviewer', name: 'Reviewer', description: '10 reviews escritas', icon: '📝', kdPointsReward: 300, criteria: '10 reviews' },
  photographer: { id: 'photographer', name: 'Fotógrafo', description: '5 reviews com foto', icon: '📸', kdPointsReward: 500, criteria: '5 fotos em reviews' },
  early_adopter: { id: 'early_adopter', name: 'Early Adopter', description: 'Primeiros 1000 usuários', icon: '🚀', kdPointsReward: 10000, criteria: 'Registro nos primeiros 1000' },
  inviter: { id: 'inviter', name: 'Convidador', description: '10 amigos convidados', icon: '🤝', kdPointsReward: 3000, criteria: '10 referrals' },
  legendary: { id: 'legendary', name: 'Lendário', description: 'Vendas acima de R$ 1 milhão', icon: '🏆', kdPointsReward: 100000, criteria: 'R$ 1M em vendas' },
}

const SPIN_PRIZES: SpinWheelPrize[] = [
  { id: 'sp_1', name: '10 KD Points', type: 'kd_points', value: 10, probability: 0.30, emoji: '🪙' },
  { id: 'sp_2', name: '50 KD Points', type: 'kd_points', value: 50, probability: 0.20, emoji: '🪙' },
  { id: 'sp_3', name: '100 KD Points', type: 'kd_points', value: 100, probability: 0.15, emoji: '💰' },
  { id: 'sp_4', name: 'Cupom 10%', type: 'coupon', value: 10, probability: 0.15, emoji: '🎫' },
  { id: 'sp_5', name: 'Cupom 20%', type: 'coupon', value: 20, probability: 0.08, emoji: '🎟️' },
  { id: 'sp_6', name: 'Boost 6h Grátis', type: 'boost', value: 1, probability: 0.05, emoji: '🚀' },
  { id: 'sp_7', name: '500 KD Points', type: 'kd_points', value: 500, probability: 0.04, emoji: '💎' },
  { id: 'sp_8', name: 'Cashback 5%', type: 'cashback', value: 5, probability: 0.02, emoji: '🔄' },
  { id: 'sp_9', name: '1000 KD Points', type: 'kd_points', value: 1000, probability: 0.009, emoji: '👑' },
  { id: 'sp_10', name: 'Boost 24h Grátis', type: 'boost', value: 24, probability: 0.001, emoji: '🌟' },
]

const CHECKIN_REWARDS: Record<number, number> = {
  1: 5,    // Dia 1: 5 KD
  2: 5,    // Dia 2: 5 KD
  3: 10,   // Dia 3: 10 KD
  4: 10,   // Dia 4: 10 KD
  5: 15,   // Dia 5: 15 KD
  6: 15,   // Dia 6: 15 KD
  7: 50,   // Dia 7: 50 KD (bônus semanal)
}

export class GamificationEngine {
  /**
   * Processa daily check-in e calcula streak
   */
  processCheckIn(current: DailyCheckIn | null): DailyCheckIn & { reward: number; bonus: boolean; message: string } {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    if (current && current.lastCheckIn.split('T')[0] === today) {
      return { ...current, reward: 0, bonus: false, message: 'Você já fez check-in hoje!' }
    }

    let streak = 1
    let totalCheckIns = 1
    let kdPointsEarned = 0

    if (current) {
      const lastDate = new Date(current.lastCheckIn)
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        streak = current.streak + 1
      } else if (diffDays > 1) {
        streak = 1 // Streak quebrada
      } else {
        streak = current.streak
      }

      totalCheckIns = current.totalCheckIns + 1
      kdPointsEarned = current.kdPointsEarned
    }

    // Calcular recompensa
    const dayInCycle = ((streak - 1) % 7) + 1
    const baseReward = CHECKIN_REWARDS[dayInCycle] || 5
    const bonus = dayInCycle === 7
    const reward = bonus ? baseReward + 50 : baseReward

    return {
      userId: current?.userId || '',
      streak,
      lastCheckIn: now.toISOString(),
      totalCheckIns,
      kdPointsEarned: kdPointsEarned + reward,
      reward,
      bonus,
      message: bonus
        ? `🔥 Streak de ${streak} dias! Bônus semanal de ${reward} KD Points!`
        : `Check-in dia ${dayInCycle}/7 — ${reward} KD Points ganhos!`,
    }
  }

  /**
   * Gira a roleta e retorna prêmio
   */
  spinWheel(): SpinWheelPrize {
    const rand = Math.random()
    let cumulative = 0

    for (const prize of SPIN_PRIZES) {
      cumulative += prize.probability
      if (rand <= cumulative) return prize
    }

    return SPIN_PRIZES[0] // fallback
  }

  /**
   * Calcula badges desbloqueáveis baseado em conquistas
   */
  checkBadges(achievements: {
    totalPurchases: number
    totalSales: number
    averageRating: number
    streak: number
    reviewCount: number
    photoReviewCount: number
    referralCount: number
    totalRevenue: number
    isEarlyAdopter: boolean
  }): Badge[] {
    const unlocked: Badge[] = []

    if (achievements.totalPurchases >= 1) unlocked.push(BADGES.first_purchase)
    if (achievements.totalSales >= 1) unlocked.push(BADGES.first_sale)
    if (achievements.totalSales >= 100) unlocked.push(BADGES.power_seller)
    if (achievements.averageRating >= 4.8) unlocked.push(BADGES.top_rated)
    if (achievements.streak >= 7) unlocked.push(BADGES.streak_7)
    if (achievements.streak >= 30) unlocked.push(BADGES.streak_30)
    if (achievements.streak >= 365) unlocked.push(BADGES.streak_365)
    if (achievements.reviewCount >= 10) unlocked.push(BADGES.reviewer)
    if (achievements.photoReviewCount >= 5) unlocked.push(BADGES.photographer)
    if (achievements.isEarlyAdopter) unlocked.push(BADGES.early_adopter)
    if (achievements.referralCount >= 10) unlocked.push(BADGES.inviter)
    if (achievements.totalRevenue >= 1_000_000) unlocked.push(BADGES.legendary)

    return unlocked
  }

  getBadge(type: BadgeType): Badge {
    return BADGES[type]
  }

  getAllBadges(): Badge[] {
    return Object.values(BADGES)
  }

  getSpinPrizes(): SpinWheelPrize[] {
    return SPIN_PRIZES
  }
}

export const gamificationEngine = new GamificationEngine()
