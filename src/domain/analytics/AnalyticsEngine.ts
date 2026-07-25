// ─────────────────────────────────────────────────────────────
// Analytics Engine v0.0.1 — Event tracking, page views, funis
// Armazenamento Supabase + fallback localStorage
// ─────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | 'page_view'
  | 'product_view'
  | 'product_click'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'search'
  | 'view_category'
  | 'sign_up'
  | 'login'
  | 'share'
  | 'wishlist_add'
  | 'wishlist_remove'

export interface AnalyticsPayload {
  event: AnalyticsEvent
  userId?: string
  sessionId: string
  timestamp: string
  page: string
  referrer: string
  properties: Record<string, string | number | boolean | null>
  device: {
    screen: string
    userAgent: string
    language: string
  }
}

export class AnalyticsEngine {
  private sessionId: string
  private queue: AnalyticsPayload[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), 5000)
    }
  }

  /**
   * Rastreia evento de analytics
   */
  track(event: AnalyticsEvent, properties: Record<string, any> = {}): void {
    const payload: AnalyticsPayload = {
      event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      properties: this.sanitizeProperties(properties),
      device: {
        screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
      },
    }

    this.queue.push(payload)

    // Salvar no localStorage como fallback
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('kiyvo_analytics') || '[]')
        stored.push(payload)
        if (stored.length > 500) stored.splice(0, 100)
        localStorage.setItem('kiyvo_analytics', JSON.stringify(stored))
      } catch {}
    }

    // Flush se atingiu 10 eventos
    if (this.queue.length >= 10) this.flush()
  }

  /**
   * Envia eventos para o servidor
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = [...this.queue]
    this.queue = []

    try {
      await fetch('/api/v1/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      })
    } catch {
      // Re-queue on failure
      this.queue.push(...batch)
    }
  }

  /**
   * Sanitiza properties para evitar dados sensíveis
   */
  private sanitizeProperties(props: Record<string, any>): Record<string, string | number | boolean | null> {
    const sanitized: Record<string, string | number | boolean | null> = {}
    const blocklist = ['password', 'token', 'secret', 'key', 'credit_card', 'cvv', 'ssn', 'cpf']

    for (const [key, value] of Object.entries(props)) {
      if (blocklist.some(b => key.toLowerCase().includes(b))) continue
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
        sanitized[key] = value
      } else {
        sanitized[key] = String(value)
      }
    }

    return sanitized
  }

  /**
   * Gera session ID único
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  /**
   * Page view tracking automático
   */
  trackPageView(page?: string): void {
    this.track('page_view', { page: page || (typeof window !== 'undefined' ? window.location.pathname : '') })
  }

  /**
   * Product view
   */
  trackProductView(productId: string, productName: string, price: number): void {
    this.track('product_view', { productId, productName, price })
  }

  /**
   * Add to cart
   */
  trackAddToCart(productId: string, quantity: number, price: number): void {
    this.track('add_to_cart', { productId, quantity, price })
  }

  /**
   * Purchase
   */
  trackPurchase(orderId: string, total: number, items: number): void {
    this.track('purchase', { orderId, total, items })
  }

  /**
   * Search
   */
  trackSearch(query: string, results: number): void {
    this.track('search', { query, results })
  }
}

export const analyticsEngine = new AnalyticsEngine()
