// ─────────────────────────────────────────────────────────────
// Webhook Engine v0.0.1 — Envio de webhooks para vendedores
// Eventos: sale, refund, dispute, payout, product_approved
// ─────────────────────────────────────────────────────────────

export type WebhookEvent = 'order.created' | 'order.paid' | 'order.refunded' | 'order.disputed' | 'order.completed' | 'product.approved' | 'product.rejected' | 'payout.completed' | 'withdrawal.completed'

export interface WebhookEndpoint { id: string; userId: string; url: string; events: WebhookEvent[]; secret: string; isActive: boolean; lastDeliveryAt: string | null; lastSuccessAt: string | null; consecutiveFailures: number; createdAt: string }

export interface WebhookDelivery { id: string; webhookId: string; event: WebhookEvent; payload: Record<string, unknown>; status: 'pending' | 'delivered' | 'failed'; statusCode: number | null; attempt: number; error: string | null; duration: number; createdAt: string }

const MAX_RETRIES = 5
const RETRY_DELAYS = [60, 300, 900, 3600, 86400] // 1min, 5min, 15min, 1h, 24h

export class WebhookEngine {
  generateSecret(): string {
    const { randomBytes } = require('crypto')
    return `whsec_${randomBytes(32).toString('hex')}`
  }

  createEndpoint(params: { userId: string; url: string; events: WebhookEvent[] }): WebhookEndpoint {
    return { id: `wh_${Date.now()}`, ...params, secret: this.generateSecret(), isActive: true, lastDeliveryAt: null, lastSuccessAt: null, consecutiveFailures: 0, createdAt: new Date().toISOString() }
  }

  async deliver(webhook: WebhookEndpoint, event: WebhookEvent, payload: Record<string, unknown>): Promise<WebhookDelivery> {
    const start = Date.now()
    const delivery: WebhookDelivery = { id: `whd_${Date.now()}`, webhookId: webhook.id, event, payload, status: 'pending', statusCode: null, attempt: 1, error: null, duration: 0, createdAt: new Date().toISOString() }

    try {
      const signature = await this.signPayload(payload, webhook.secret)
      const response = await fetch(webhook.url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Kiyvo-Signature': signature, 'X-Kiyvo-Event': event, 'User-Agent': 'Kiyvo-Webhook/1.0' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(10000),
      })
      delivery.statusCode = response.status
      delivery.status = response.ok ? 'delivered' : 'failed'
      delivery.duration = Date.now() - start
      if (!response.ok) delivery.error = `HTTP ${response.status}`
    } catch (err: any) {
      delivery.status = 'failed'; delivery.error = err.message; delivery.duration = Date.now() - start
    }
    return delivery
  }

  shouldRetry(delivery: WebhookDelivery): boolean {
    return delivery.status === 'failed' && delivery.attempt < MAX_RETRIES
  }

  getRetryDelay(attempt: number): number {
    return RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
  }

  private async signPayload(payload: Record<string, unknown>, secret: string): Promise<string> {
    const { createHmac } = await import('crypto')
    return createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
  }
}
export const webhookEngine = new WebhookEngine()
