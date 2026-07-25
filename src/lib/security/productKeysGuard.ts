// ─────────────────────────────────────────────────────────────
// Product Keys Guard v0.0.1 — Chaves de produto de uso único
// Geração, validação, consumo e reembolso de license keys
// Formato: XXXX-XXXX-XXXX-XXXX
// ─────────────────────────────────────────────────────────────

import { randomBytes } from 'crypto'

export interface ProductKey {
  id: string
  key: string
  productId: string
  orderId: string | null
  buyerId: string | null
  status: 'available' | 'reserved' | 'used' | 'refunded' | 'expired'
  createdAt: string
  reservedAt: string | null
  usedAt: string | null
  expiresAt: string | null
  metadata: Record<string, unknown>
}

export interface KeyGenerationResult {
  keys: ProductKey[]
  count: number
  batchId: string
}

/**
 * Gera chave de licença no formato XXXX-XXXX-XXXX-XXXX
 * Usa crypto.randomBytes para alta entropia
 */
export function generateLicenseKey(): string {
  const bytes = randomBytes(8)
  const hex = bytes.toString('hex').toUpperCase()
  return [
    hex.slice(0, 4),
    hex.slice(4, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
  ].join('-')
}

/**
 * Gera lote de chaves de produto
 */
export function generateProductKeys(
  productId: string,
  count: number = 1,
  expiresInDays?: number
): KeyGenerationResult {
  const batchId = `batch_${Date.now()}_${randomBytes(4).toString('hex')}`
  const keys: ProductKey[] = []

  for (let i = 0; i < count; i++) {
    keys.push({
      id: `pk_${Date.now()}_${i}_${randomBytes(4).toString('hex')}`,
      key: generateLicenseKey(),
      productId,
      orderId: null,
      buyerId: null,
      status: 'available',
      createdAt: new Date().toISOString(),
      reservedAt: null,
      usedAt: null,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null,
      metadata: {},
    })
  }

  return { keys, count, batchId }
}

/**
 * Valida formato da chave
 */
export function validateKeyFormat(key: string): boolean {
  const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return keyPattern.test(key.trim().toUpperCase())
}

/**
 * Reserva chave para um pedido (antes do pagamento confirmar)
 */
export function reserveKey(
  key: ProductKey,
  orderId: string,
  buyerId: string
): { success: boolean; key?: ProductKey; reason?: string } {
  if (key.status !== 'available') {
    return {
      success: false,
      reason: `Chave ${key.key} não está disponível (status: ${key.status})`,
    }
  }

  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return {
      success: false,
      reason: `Chave ${key.key} expirou em ${key.expiresAt}`,
    }
  }

  return {
    success: true,
    key: {
      ...key,
      status: 'reserved',
      orderId,
      buyerId,
      reservedAt: new Date().toISOString(),
    },
  }
}

/**
 * Consome chave (após pagamento confirmado)
 */
export function consumeKey(
  key: ProductKey
): { success: boolean; key?: ProductKey; reason?: string } {
  if (key.status !== 'reserved') {
    return {
      success: false,
      reason: `Chave ${key.key} precisa estar reservada antes de ser consumida (status: ${key.status})`,
    }
  }

  return {
    success: true,
    key: {
      ...key,
      status: 'used',
      usedAt: new Date().toISOString(),
    },
  }
}

/**
 * Marca chave como reembolsada
 */
export function refundKey(
  key: ProductKey
): { success: boolean; key?: ProductKey } {
  return {
    success: true,
    key: {
      ...key,
      status: 'refunded',
      metadata: {
        ...key.metadata,
        refundedAt: new Date().toISOString(),
      },
    },
  }
}

/**
 * Libera chave reservada (pagamento falhou)
 */
export function releaseKey(
  key: ProductKey
): { success: boolean; key?: ProductKey } {
  return {
    success: true,
    key: {
      ...key,
      status: 'available',
      orderId: null,
      buyerId: null,
      reservedAt: null,
    },
  }
}

/**
 * Verifica se chave está disponível para venda
 */
export function isKeyAvailable(key: ProductKey): boolean {
  if (key.status !== 'available') return false
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) return false
  return true
}

/**
 * Normaliza chave (remove espaços, uppercase)
 */
export function normalizeKey(key: string): string {
  return key.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
}
