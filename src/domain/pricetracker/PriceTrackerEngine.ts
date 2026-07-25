// ─────────────────────────────────────────────────────────────
// Price Tracker Engine v0.0.1 — Histórico de preços + alertas
// Tracking de mudanças, preço mínimo, notificações de queda
// ─────────────────────────────────────────────────────────────

export interface PriceSnapshot {
  id: string
  productId: string
  price: number
  originalPrice: number | null
  currency: string
  source: string
  timestamp: string
}

export interface PriceAlert {
  id: string
  userId: string
  productId: string
  targetPrice: number
  type: 'below' | 'percent_drop' | 'any_change'
  percentDrop?: number
  isActive: boolean
  triggeredAt: string | null
  createdAt: string
}

export interface PriceStats {
  currentPrice: number
  lowestPrice: number
  highestPrice: number
  averagePrice: number
  lastChange: number
  percentChange: number
  totalSnapshots: number
  firstTracked: string
  lastUpdated: string
}

export class PriceTrackerEngine {
  /**
   * Calcula estatísticas de preço a partir de snapshots
   */
  calculateStats(snapshots: PriceSnapshot[]): PriceStats {
    if (snapshots.length === 0) {
      return {
        currentPrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        averagePrice: 0,
        lastChange: 0,
        percentChange: 0,
        totalSnapshots: 0,
        firstTracked: '',
        lastUpdated: '',
      }
    }

    const sorted = [...snapshots].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const prices = sorted.map(s => s.price)

    const currentPrice = prices[prices.length - 1]
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)
    const averagePrice = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length * 100) / 100
    const lastChange = prices.length >= 2 ? Math.round((currentPrice - prices[prices.length - 2]) * 100) / 100 : 0
    const percentChange = prices.length >= 2 && prices[prices.length - 2] > 0
      ? Math.round((lastChange / prices[prices.length - 2]) * 10000) / 100
      : 0

    return {
      currentPrice,
      lowestPrice,
      highestPrice,
      averagePrice,
      lastChange,
      percentChange,
      totalSnapshots: snapshots.length,
      firstTracked: sorted[0].timestamp,
      lastUpdated: sorted[sorted.length - 1].timestamp,
    }
  }

  /**
   * Verifica se alerta deve ser disparado
   */
  checkAlert(alert: PriceAlert, currentPrice: number, previousPrice?: number): { shouldTrigger: boolean; reason?: string } {
    if (!alert.isActive) return { shouldTrigger: false }

    switch (alert.type) {
      case 'below':
        if (currentPrice <= alert.targetPrice) {
          return { shouldTrigger: true, reason: `Preço caiu para R$ ${currentPrice.toFixed(2)} (abaixo de R$ ${alert.targetPrice.toFixed(2)})` }
        }
        break

      case 'percent_drop': {
        if (!previousPrice) return { shouldTrigger: false }
        const dropPercent = Math.round((1 - currentPrice / previousPrice) * 100)
        if (dropPercent >= (alert.percentDrop || 10)) {
          return { shouldTrigger: true, reason: `Preço caiu ${dropPercent}% (de R$ ${previousPrice.toFixed(2)} para R$ ${currentPrice.toFixed(2)})` }
        }
        break
      }

      case 'any_change':
        if (previousPrice && currentPrice !== previousPrice) {
          return { shouldTrigger: true, reason: `Preço alterado: R$ ${previousPrice.toFixed(2)} → R$ ${currentPrice.toFixed(2)}` }
        }
        break
    }

    return { shouldTrigger: false }
  }

  /**
   * Detecta tendência de preço
   */
  detectTrend(snapshots: PriceSnapshot[]): 'up' | 'down' | 'stable' | 'volatile' {
    if (snapshots.length < 3) return 'stable'

    const sorted = [...snapshots].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const prices = sorted.map(s => s.price)

    const firstHalf = prices.slice(0, Math.floor(prices.length / 2))
    const secondHalf = prices.slice(Math.floor(prices.length / 2))

    const firstAvg = firstHalf.reduce((s, p) => s + p, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, p) => s + p, 0) / secondHalf.length
    const diff = Math.round(((secondAvg - firstAvg) / firstAvg) * 100)

    if (Math.abs(diff) < 3) return 'stable'
    if (Math.abs(diff) > 15) return 'volatile'
    return diff > 0 ? 'up' : 'down'
  }

  /**
   * Calcula preço sugerido baseado em histórico
   */
  suggestOptimalPrice(snapshots: PriceSnapshot[], sellerPrice: number): {
    suggested: number
    reason: string
    confidence: 'low' | 'medium' | 'high'
  } {
    if (snapshots.length < 3) {
      return { suggested: sellerPrice, reason: 'Dados insuficientes para sugestão', confidence: 'low' }
    }

    const stats = this.calculateStats(snapshots)
    const trend = this.detectTrend(snapshots)

    if (trend === 'up' && sellerPrice < stats.averagePrice) {
      return {
        suggested: Math.round(stats.averagePrice * 100) / 100,
        reason: `Tendência de alta. Preço médio: R$ ${stats.averagePrice.toFixed(2)}`,
        confidence: 'medium',
      }
    }

    if (trend === 'down' && sellerPrice > stats.averagePrice) {
      return {
        suggested: Math.round(stats.lowestPrice * 1.05 * 100) / 100,
        reason: `Tendência de baixa. Sugerido 5% acima do menor preço: R$ ${(stats.lowestPrice * 1.05).toFixed(2)}`,
        confidence: 'medium',
      }
    }

    return { suggested: sellerPrice, reason: 'Preço atual alinhado com o mercado', confidence: 'high' }
  }
}

export const priceTrackerEngine = new PriceTrackerEngine()
