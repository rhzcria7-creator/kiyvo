// ─────────────────────────────────────────────────────────────
// DeliveryService v0.0.1 — Entrega digital com tokens 7d max 5
// Tokens com IP bound + license key XXXX-XXXX única
// Download seguro com rate limit por IP
// ─────────────────────────────────────────────────────────────

import { randomBytes, createHash } from 'crypto'

export interface DownloadToken {
  id: string
  orderId: string
  productId: string
  buyerId: string
  token: string
  maxDownloads: number  // Máximo 5
  downloadsUsed: number
  expiresAt: string      // 7 dias
  ipBound: string | null // IP que pode baixar (null = qualquer IP)
  isActive: boolean
  metadata: Record<string, unknown>
  createdAt: string
}

export interface LicenseKey {
  id: string
  key: string           // XXXX-XXXX-XXXX-XXXX
  productId: string
  orderId: string
  buyerId: string
  status: 'active' | 'revoked' | 'expired'
  activatedAt: string | null
  hwidBound: string | null // Hardware ID (opcional)
  ipBound: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface DeliveryResult {
  success: boolean
  token?: DownloadToken
  licenseKey?: LicenseKey
  downloadUrl?: string
  error?: string
  remainingDownloads?: number
  expiresInHours?: number
}

const TOKEN_EXPIRY_DAYS = 7
const MAX_DOWNLOADS = 5
const TOKEN_LENGTH = 48
const DOWNLOAD_RATE_LIMIT = 10 // downloads por minuto por IP

// Rate limiter em memória para downloads (em produção: Redis/Supabase)
const downloadRateMap = new Map<string, { count: number; resetAt: number }>()

export class DeliveryService {
  private tokens: Map<string, DownloadToken> = new Map()
  private licenses: Map<string, LicenseKey> = new Map()
  private tokenIdCounter = 0

  /**
   * Gera token de download seguro
   */
  createDownloadToken(params: {
    orderId: string
    productId: string
    buyerId: string
    ip?: string
    maxDownloads?: number
    expiryDays?: number
  }): DownloadToken {
    const token = generateSecureToken(TOKEN_LENGTH)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + (params.expiryDays || TOKEN_EXPIRY_DAYS) * 24 * 60 * 60 * 1000)
    const id = `dt_${Date.now()}_${this.tokenIdCounter++}`

    const downloadToken: DownloadToken = {
      id,
      orderId: params.orderId,
      productId: params.productId,
      buyerId: params.buyerId,
      token,
      maxDownloads: Math.min(params.maxDownloads || MAX_DOWNLOADS, MAX_DOWNLOADS),
      downloadsUsed: 0,
      expiresAt: expiresAt.toISOString(),
      ipBound: params.ip || null,
      isActive: true,
      metadata: {},
      createdAt: now.toISOString(),
    }

    this.tokens.set(token, downloadToken)
    return downloadToken
  }

  /**
   * Valida e consome token de download
   */
  validateDownload(
    token: string,
    buyerId: string,
    ip?: string
  ): DeliveryResult {
    // 1. Buscar token
    const downloadToken = this.tokens.get(token)
    if (!downloadToken) {
      return { success: false, error: 'Token de download inválido' }
    }

    // 2. Verificar se está ativo
    if (!downloadToken.isActive) {
      return { success: false, error: 'Token de download desativado' }
    }

    // 3. Verificar expiração
    if (new Date(downloadToken.expiresAt) < new Date()) {
      downloadToken.isActive = false
      return { success: false, error: 'Token de download expirado' }
    }

    // 4. Verificar propriedade
    if (downloadToken.buyerId !== buyerId) {
      return { success: false, error: 'Token não pertence a este comprador' }
    }

    // 5. Verificar IP bound
    if (downloadToken.ipBound && ip && downloadToken.ipBound !== ip) {
      return { success: false, error: 'Token vinculado a outro IP' }
    }

    // 6. Verificar limite de downloads
    if (downloadToken.downloadsUsed >= downloadToken.maxDownloads) {
      downloadToken.isActive = false
      return {
        success: false,
        error: `Limite de ${downloadToken.maxDownloads} downloads atingido`,
      }
    }

    // 7. Rate limit check
    if (ip) {
      const rateCheck = checkDownloadRateLimit(ip)
      if (!rateCheck.allowed) {
        return { success: false, error: 'Muitos downloads. Tente novamente em 1 minuto' }
      }
    }

    // 8. Consumir download
    downloadToken.downloadsUsed++
    const remaining = downloadToken.maxDownloads - downloadToken.downloadsUsed

    // Desativar se atingiu limite
    if (remaining <= 0) {
      downloadToken.isActive = false
    }

    const expiresInHours = Math.round(
      (new Date(downloadToken.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
    )

    return {
      success: true,
      token: downloadToken,
      downloadUrl: `/api/v1/delivery/${token}/download`,
      remainingDownloads: remaining,
      expiresInHours: Math.max(0, expiresInHours),
      error: undefined,
    }
  }

  /**
   * Gera chave de licença única
   */
  generateLicenseKey(params: {
    productId: string
    orderId: string
    buyerId: string
    hwid?: string
    ip?: string
  }): LicenseKey {
    const key = generateLicenseKeyFormat()
    const id = `lic_${Date.now()}_${randomBytes(4).toString('hex')}`

    const license: LicenseKey = {
      id,
      key,
      productId: params.productId,
      orderId: params.orderId,
      buyerId: params.buyerId,
      status: 'active',
      activatedAt: null,
      hwidBound: params.hwid || null,
      ipBound: params.ip || null,
      metadata: {},
      createdAt: new Date().toISOString(),
    }

    this.licenses.set(key, license)
    return license
  }

  /**
   * Revoga chave de licença (reembolso)
   */
  revokeLicense(licenseKey: string): { success: boolean; error?: string } {
    const license = this.licenses.get(licenseKey)
    if (!license) {
      return { success: false, error: 'Chave de licença não encontrada' }
    }

    license.status = 'revoked'
    return { success: true }
  }

  /**
   * Ativa chave de licença (HWID bind)
   */
  activateLicense(params: {
    key: string
    hwid: string
    ip: string
  }): { success: boolean; license?: LicenseKey; error?: string } {
    const license = this.licenses.get(params.key)
    if (!license) {
      return { success: false, error: 'Chave de licença inválida' }
    }

    if (license.status !== 'active') {
      return { success: false, error: `Licença está ${license.status}` }
    }

    // Se já tem HWID bound, verificar se é o mesmo
    if (license.hwidBound && license.hwidBound !== params.hwid) {
      return { success: false, error: 'Licença já ativada em outro dispositivo' }
    }

    license.hwidBound = params.hwid
    license.ipBound = params.ip
    license.activatedAt = new Date().toISOString()

    return { success: true, license }
  }

  /**
   * Busca token por ID
   */
  getTokenById(id: string): DownloadToken | undefined {
    const values = Array.from(this.tokens.values())
    return values.find(token => token.id === id)
  }

  /**
   * Busca licença por chave
   */
  getLicenseByKey(key: string): LicenseKey | undefined {
    return this.licenses.get(key)
  }

  /**
   * Lista tokens de um pedido
   */
  getOrderTokens(orderId: string): DownloadToken[] {
    return Array.from(this.tokens.values()).filter(t => t.orderId === orderId)
  }
}

/**
 * Gera token seguro com caracteres aleatórios
 */
function generateSecureToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(length)
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars[bytes[i] % chars.length]
  }
  return token
}

/**
 * Gera chave no formato XXXX-XXXX-XXXX-XXXX
 */
function generateLicenseKeyFormat(): string {
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
 * Rate limit check para downloads
 */
function checkDownloadRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now()
  const entry = downloadRateMap.get(ip)

  if (!entry || entry.resetAt < now) {
    downloadRateMap.set(ip, { count: 1, resetAt: now + 60 * 1000 })
    return { allowed: true }
  }

  if (entry.count >= DOWNLOAD_RATE_LIMIT) {
    return { allowed: false }
  }

  entry.count++
  return { allowed: true }
}

export const deliveryService = new DeliveryService()
