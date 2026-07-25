// v0.0.1 — Assinatura HMAC para webhooks de vendedor.
import { createHmac, timingSafeEqual } from 'crypto'
export function signWebhookPayload(payload: string, secret: string): string { return createHmac('sha256', secret).update(payload).digest('hex') }
export function verifyWebhookPayload(payload: string, signature: string, secret: string): boolean { const expected = signWebhookPayload(payload, secret); if (signature.length !== expected.length) return false; return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) }
