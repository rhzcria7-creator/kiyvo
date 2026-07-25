// ─────────────────────────────────────────────────────────────
// Social Proof Engine v0.0.1 — Provas sociais em tempo real
// Notificações de vendas recentes, reviews, usuários online
// ─────────────────────────────────────────────────────────────

export interface SocialProofEvent {
  id: string
  type: 'sale' | 'review' | 'signup' | 'download'
  productName: string
  productId: string
  buyerName: string
  buyerCity?: string
  buyerAvatar?: string
  rating?: number
  amount: number
  timestamp: string
  ttl: number // ms until expiry
}

export interface LiveVisitor {
  id: string
  page: string
  referrer: string
  timestamp: string
}

const MOCK_BUYERS = ['Ana S.', 'Carlos M.', 'Julia R.', 'Pedro A.', 'Maria F.', 'Lucas O.', 'Beatriz C.', 'Rafael S.']
const MOCK_CITIES = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Salvador, BA', 'Brasília, DF', 'Fortaleza, CE', 'Porto Alegre, RS']

export class SocialProofEngine {
  private recentEvents: SocialProofEvent[] = []
  private visitors: Map<string, LiveVisitor> = new Map()
  private eventId = 0

  generateMockSale(productName: string, amount: number): SocialProofEvent {
    const event: SocialProofEvent = {
      id: `sp_${++this.eventId}`,
      type: 'sale',
      productName,
      productId: `prod_${Math.random().toString(36).slice(2, 6)}`,
      buyerName: MOCK_BUYERS[Math.floor(Math.random() * MOCK_BUYERS.length)],
      buyerCity: MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)],
      amount,
      timestamp: new Date().toISOString(),
      ttl: 8000,
    }
    this.recentEvents.push(event)
    if (this.recentEvents.length > 20) this.recentEvents.shift()
    return event
  }

  generateMockReview(productName: string, rating: number): SocialProofEvent {
    const event: SocialProofEvent = {
      id: `sp_review_${++this.eventId}`,
      type: 'review',
      productName,
      productId: `prod_${Math.random().toString(36).slice(2, 6)}`,
      buyerName: MOCK_BUYERS[Math.floor(Math.random() * MOCK_BUYERS.length)],
      rating,
      amount: 0,
      timestamp: new Date().toISOString(),
      ttl: 10000,
    }
    this.recentEvents.push(event)
    if (this.recentEvents.length > 20) this.recentEvents.shift()
    return event
  }

  trackVisitor(sessionId: string, page: string, referrer: string): LiveVisitor {
    const visitor: LiveVisitor = { id: sessionId, page, referrer, timestamp: new Date().toISOString() }
    this.visitors.set(sessionId, visitor)
    return visitor
  }

  removeVisitor(sessionId: string): void {
    this.visitors.delete(sessionId)
  }

  getActiveVisitors(): number {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    let count = 0
    this.visitors.forEach(v => {
      if (new Date(v.timestamp).getTime() > fiveMinAgo) count++
    })
    return count
  }

  getRecentEvents(limit = 10): SocialProofEvent[] {
    return this.recentEvents.slice(-limit).reverse()
  }

  getEventsForProduct(productId: string): SocialProofEvent[] {
    return this.recentEvents.filter(e => e.productId === productId)
  }
}

export const socialProofEngine = new SocialProofEngine()
