// ─────────────────────────────────────────────────────────────
// Gift Card Engine v0.0.1 — Geração e resgate de Gift Cards
// Códigos únicos, saldo, expiração
// ─────────────────────────────────────────────────────────────

import { randomBytes } from 'crypto'

export interface GiftCard {
  id: string
  code: string
  amount: number
  balance: number
  senderId: string
  senderName: string
  recipientEmail: string
  recipientName: string
  message: string
  status: 'active' | 'partially_used' | 'exhausted' | 'expired' | 'cancelled'
  expiresAt: string
  usedAt: string | null
  createdAt: string
}

export interface GiftCardRedemption {
  id: string
  giftCardId: string
  orderId: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export class GiftCardEngine {
  /**
   * Gera código de gift card único
   */
  generateCode(): string {
    const bytes = randomBytes(6)
    const hex = bytes.toString('hex').toUpperCase()
    return [
      hex.slice(0, 4),
      hex.slice(4, 8),
      hex.slice(8, 12),
    ].join('-')
  }

  /**
   * Cria gift card
   */
  create(params: {
    amount: number
    senderId: string
    senderName: string
    recipientEmail: string
    recipientName?: string
    message?: string
    expiresInDays?: number
  }): GiftCard {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + (params.expiresInDays || 365) * 24 * 60 * 60 * 1000)

    return {
      id: `gc_${Date.now()}_${randomBytes(4).toString('hex')}`,
      code: this.generateCode(),
      amount: params.amount,
      balance: params.amount,
      senderId: params.senderId,
      senderName: params.senderName,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName || '',
      message: params.message || '',
      status: 'active',
      expiresAt: expiresAt.toISOString(),
      usedAt: null,
      createdAt: now.toISOString(),
    }
  }

  /**
   * Resgata gift card em um pedido
   */
  redeem(giftCard: GiftCard, orderId: string, amount: number): {
    success: boolean
    redemption?: GiftCardRedemption
    updatedCard?: GiftCard
    reason?: string
  } {
    if (giftCard.status === 'exhausted') {
      return { success: false, reason: 'Gift card já utilizado' }
    }
    if (giftCard.status === 'expired') {
      return { success: false, reason: 'Gift card expirado' }
    }
    if (giftCard.status === 'cancelled') {
      return { success: false, reason: 'Gift card cancelado' }
    }
    if (new Date(giftCard.expiresAt) < new Date()) {
      return { success: false, reason: 'Gift card expirado' }
    }
    if (giftCard.balance <= 0) {
      return { success: false, reason: 'Saldo insuficiente' }
    }

    const redeemAmount = Math.min(amount, giftCard.balance)
    const balanceBefore = giftCard.balance
    const balanceAfter = Math.round((giftCard.balance - redeemAmount) * 100) / 100

    const redemption: GiftCardRedemption = {
      id: `gcr_${Date.now()}`,
      giftCardId: giftCard.id,
      orderId,
      amount: redeemAmount,
      balanceBefore,
      balanceAfter,
      createdAt: new Date().toISOString(),
    }

    const updatedCard: GiftCard = {
      ...giftCard,
      balance: balanceAfter,
      status: balanceAfter <= 0 ? 'exhausted' : 'partially_used',
      usedAt: new Date().toISOString(),
    }

    return { success: true, redemption, updatedCard }
  }

  /**
   * Verifica se gift card é válido
   */
  isValid(giftCard: GiftCard): { valid: boolean; reason?: string } {
    if (giftCard.status === 'exhausted') return { valid: false, reason: 'Saldo esgotado' }
    if (giftCard.status === 'expired') return { valid: false, reason: 'Expirado' }
    if (giftCard.status === 'cancelled') return { valid: false, reason: 'Cancelado' }
    if (new Date(giftCard.expiresAt) < new Date()) return { valid: false, reason: 'Expirado' }
    if (giftCard.balance <= 0) return { valid: false, reason: 'Sem saldo' }
    return { valid: true }
  }
}

export const giftCardEngine = new GiftCardEngine()
