// ─────────────────────────────────────────────────────────────
// DeliveryEngine — Motor de Entrega Digital
// Gerencia todos os tipos de entrega de produtos digitais
// ─────────────────────────────────────────────────────────────

import { generateSecureToken } from '@/lib/security'

/** Tipos de entrega digital */
export type DeliveryType =
  | 'download'           // Download direto de arquivo
  | 'license_key'        // Chave de licença entregue automaticamente
  | 'source_code'        // Acesso a repositório/arquivo de código
  | 'course_access'      // Acesso a plataforma de curso
  | 'ebook_download'     // Download de e-book
  | 'template_download'  // Download de template
  | 'asset_download'     // Download de asset pack
  | 'api_credentials'    // Credenciais de API
  | 'saas_access'        // Acesso a plataforma SaaS
  | 'subscription_access' // Acesso a assinatura
  | 'service_delivery'   // Entrega de serviço (milestones)
  | 'custom_delivery'    // Entrega personalizada pelo vendedor
  | 'account_transfer'   // Transferência de conta (com restrições)
  | 'membership_access'  // Acesso a membership/comunidade

/** Status da entrega */
export type DeliveryStatus =
  | 'pending'        // Aguardando pagamento
  | 'preparing'      // Preparando entrega
  | 'ready'          // Pronta para entrega
  | 'delivered'      // Entregue ao comprador
  | 'confirmed'      // Confirmada pelo comprador
  | 'expired'        // Link/token expirou
  | 'revoked'        // Acesso revogado (reembolso/disputa)
  | 'failed'         // Falha na entrega

/** Token de download seguro */
export interface DownloadToken {
  id: string
  orderId: string
  productId: string
  buyerId: string
  token: string
  /** URL do arquivo ou conteúdo */
  resourceUrl: string
  /** Número máximo de downloads */
  maxDownloads: number
  /** Downloads realizados */
  downloadsCount: number
  /** Data de expiração do token */
  expiresAt: string
  /** Se o token está ativo */
  isActive: boolean
  createdAt: string
}

/** Registro de entrega */
export interface DeliveryRecord {
  id: string
  orderId: string
  productId: string
  sellerId: string
  buyerId: string
  deliveryType: DeliveryType
  status: DeliveryStatus
  /** Dados da entrega (criptografados quando sensíveis) */
  deliveryData: DeliveryData
  /** Tentativas de entrega */
  attempts: DeliveryAttempt[]
  /** Data de entrega */
  deliveredAt: string | null
  /** Data de confirmação */
  confirmedAt: string | null
  createdAt: string
}

/** Dados específicos por tipo de entrega */
export type DeliveryData =
  | { type: 'download'; fileUrl: string; fileName: string; fileSize: number; checksum: string }
  | { type: 'license_key'; key: string; instructions: string; activationUrl?: string }
  | { type: 'source_code'; repoUrl: string; branch?: string; accessToken?: string }
  | { type: 'course_access'; platformUrl: string; username: string; password: string }
  | { type: 'ebook_download'; fileUrl: string; format: 'pdf' | 'epub' | 'mobi'; drm?: boolean }
  | { type: 'template_download'; fileUrl: string; platform: string; editUrl?: string }
  | { type: 'asset_download'; fileUrl: string; assetCount: number; formats: string[] }
  | { type: 'api_credentials'; apiKey: string; apiSecret: string; endpoint: string; docs: string }
  | { type: 'saas_access'; platformUrl: string; inviteUrl?: string; credentials: { email: string; password: string } }
  | { type: 'subscription_access'; platformUrl: string; planName: string; startDate: string; endDate: string }
  | { type: 'service_delivery'; milestones: ServiceMilestone[] }
  | { type: 'custom_delivery'; content: string; attachments: string[] }
  | { type: 'account_transfer'; accountDetails: string; instructions: string; warnings: string[] }
  | { type: 'membership_access'; communityUrl: string; inviteCode: string }

/** Milestone de serviço */
export interface ServiceMilestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'delivered' | 'revision_requested' | 'approved' | 'rejected'
  deliveredAt: string | null
  approvedAt: string | null
  revisionNotes: string | null
}

/** Tentativa de entrega */
export interface DeliveryAttempt {
  id: string
  type: string
  status: 'success' | 'failed'
  message: string
  attemptedAt: string
}

/** Resultado de uma entrega */
export interface DeliveryResult {
  success: boolean
  deliveryId: string
  deliveryType: DeliveryType
  status: DeliveryStatus
  message: string
  /** Informações visíveis para o comprador (sem dados sensíveis) */
  buyerInfo: {
    type: DeliveryType
    instructions: string
    expiresAt?: string
    downloadUrl?: string
  }
}

// ─── DELIVERY ENGINE ─────────────────────────────────────────

export class DeliveryEngine {
  private downloadTokens: Map<string, DownloadToken> = new Map()
  private deliveries: Map<string, DeliveryRecord> = new Map()

  /**
   * Processa a entrega de um pedido após pagamento confirmado
   * Tipo automático: entrega instantânea
   * Tipo manual: notifica vendedor para preparar
   */
  processDelivery(params: {
    orderId: string
    productId: string
    sellerId: string
    buyerId: string
    deliveryType: DeliveryType
    deliveryData: DeliveryData
    isAutomatic: boolean
  }): DeliveryResult {
    const deliveryId = `del_${Date.now()}_${params.orderId}`
    const now = new Date().toISOString()

    // Se entrega automática, processar imediatamente
    if (params.isAutomatic) {
      const record: DeliveryRecord = {
        id: deliveryId,
        orderId: params.orderId,
        productId: params.productId,
        sellerId: params.sellerId,
        buyerId: params.buyerId,
        deliveryType: params.deliveryType,
        status: 'delivered',
        deliveryData: params.deliveryData,
        attempts: [{
          id: `att_${Date.now()}`,
          type: 'automatic',
          status: 'success',
          message: 'Entrega automática processada',
          attemptedAt: now,
        }],
        deliveredAt: now,
        confirmedAt: null,
        createdAt: now,
      }

      this.deliveries.set(deliveryId, record)

      // Criar token de download se aplicável
      if (this.requiresDownloadToken(params.deliveryType)) {
        this.createDownloadToken({
          orderId: params.orderId,
          productId: params.productId,
          buyerId: params.buyerId,
          deliveryType: params.deliveryType,
          deliveryData: params.deliveryData,
        })
      }

      return {
        success: true,
        deliveryId,
        deliveryType: params.deliveryType,
        status: 'delivered',
        message: 'Produto entregue automaticamente',
        buyerInfo: this.buildBuyerInfo(params.deliveryType, params.deliveryData, params.orderId),
      }
    }

    // Entrega manual: aguardar vendedor
    const record: DeliveryRecord = {
      id: deliveryId,
      orderId: params.orderId,
      productId: params.productId,
      sellerId: params.sellerId,
      buyerId: params.buyerId,
      deliveryType: params.deliveryType,
      status: 'pending',
      deliveryData: params.deliveryData,
      attempts: [],
      deliveredAt: null,
      confirmedAt: null,
      createdAt: now,
    }

    this.deliveries.set(deliveryId, record)

    return {
      success: true,
      deliveryId,
      deliveryType: params.deliveryType,
      status: 'pending',
      message: 'Aguardando vendedor preparar a entrega',
      buyerInfo: {
        type: params.deliveryType,
        instructions: 'O vendedor foi notificado e entregará seu produto em breve.',
      },
    }
  }

  /**
   * Vendedor entrega manualmente
   */
  sellerDeliver(params: {
    deliveryId: string
    deliveryData: DeliveryData
  }): DeliveryResult {
    const delivery = this.deliveries.get(params.deliveryId)
    if (!delivery) {
      return {
        success: false,
        deliveryId: params.deliveryId,
        deliveryType: 'custom_delivery',
        status: 'failed',
        message: 'Entrega não encontrada',
        buyerInfo: { type: 'custom_delivery', instructions: '' },
      }
    }

    const now = new Date().toISOString()
    delivery.deliveryData = params.deliveryData
    delivery.status = 'delivered'
    delivery.deliveredAt = now
    delivery.attempts.push({
      id: `att_${Date.now()}`,
      type: 'manual',
      status: 'success',
      message: 'Vendedor realizou a entrega',
      attemptedAt: now,
    })

    // Criar download token se necessário
    if (this.requiresDownloadToken(delivery.deliveryType)) {
      this.createDownloadToken({
        orderId: delivery.orderId,
        productId: delivery.productId,
        buyerId: delivery.buyerId,
        deliveryType: delivery.deliveryType,
        deliveryData: params.deliveryData,
      })
    }

    return {
      success: true,
      deliveryId: params.deliveryId,
      deliveryType: delivery.deliveryType,
      status: 'delivered',
      message: 'Entrega realizada com sucesso',
      buyerInfo: this.buildBuyerInfo(delivery.deliveryType, params.deliveryData, delivery.orderId),
    }
  }

  /**
   * Comprador confirma recebimento
   */
  confirmDelivery(deliveryId: string, buyerId: string): { success: boolean; message: string } {
    const delivery = this.deliveries.get(deliveryId)
    if (!delivery) {
      return { success: false, message: 'Entrega não encontrada' }
    }

    if (delivery.buyerId !== buyerId) {
      return { success: false, message: 'Apenas o comprador pode confirmar' }
    }

    if (delivery.status !== 'delivered') {
      return { success: false, message: `Status atual: ${delivery.status}. Apenas entregas com status "delivered" podem ser confirmadas.` }
    }

    delivery.status = 'confirmed'
    delivery.confirmedAt = new Date().toISOString()

    return { success: true, message: 'Entrega confirmada' }
  }

  /**
   * Revoga acesso (reembolso/disputa)
   */
  revokeAccess(deliveryId: string): { success: boolean; message: string } {
    const delivery = this.deliveries.get(deliveryId)
    if (!delivery) {
      return { success: false, message: 'Entrega não encontrada' }
    }

    delivery.status = 'revoked'

    // Invalidar tokens de download
    this.downloadTokens.forEach((token) => {
      if (token.orderId === delivery.orderId) {
        token.isActive = false
      }
    })

    return { success: true, message: 'Acesso revogado' }
  }

  /**
   * Cria token de download seguro
   */
  private createDownloadToken(params: {
    orderId: string
    productId: string
    buyerId: string
    deliveryType: DeliveryType
    deliveryData: DeliveryData
  }): DownloadToken {
    const token = generateSecureToken(48)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias

    // Extrair URL do recurso baseado no tipo
    let resourceUrl = ''
    if ('fileUrl' in params.deliveryData) {
      resourceUrl = params.deliveryData.fileUrl
    } else if ('platformUrl' in params.deliveryData) {
      resourceUrl = params.deliveryData.platformUrl
    }

    const downloadToken: DownloadToken = {
      id: `dt_${Date.now()}`,
      orderId: params.orderId,
      productId: params.productId,
      buyerId: params.buyerId,
      token,
      resourceUrl,
      maxDownloads: 5, // Máximo 5 downloads
      downloadsCount: 0,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    this.downloadTokens.set(token, downloadToken)
    return downloadToken
  }

  /**
   * Valida e consome um token de download
   */
  validateDownloadToken(token: string, buyerId: string): {
    valid: boolean
    downloadUrl?: string
    error?: string
    remainingDownloads?: number
  } {
    const downloadToken = this.downloadTokens.get(token)

    if (!downloadToken) {
      return { valid: false, error: 'Token inválido' }
    }

    if (!downloadToken.isActive) {
      return { valid: false, error: 'Token desativado' }
    }

    if (downloadToken.buyerId !== buyerId) {
      return { valid: false, error: 'Token não pertence a este comprador' }
    }

    if (new Date(downloadToken.expiresAt) < new Date()) {
      downloadToken.isActive = false
      return { valid: false, error: 'Token expirado' }
    }

    if (downloadToken.downloadsCount >= downloadToken.maxDownloads) {
      downloadToken.isActive = false
      return { valid: false, error: 'Limite de downloads atingido' }
    }

    // Consumir download
    downloadToken.downloadsCount++
    const remainingDownloads = downloadToken.maxDownloads - downloadToken.downloadsCount

    return {
      valid: true,
      downloadUrl: downloadToken.resourceUrl,
      remainingDownloads,
    }
  }

  /**
   * Verifica se o tipo de entrega requer token de download
   */
  private requiresDownloadToken(type: DeliveryType): boolean {
    return ['download', 'ebook_download', 'template_download', 'asset_download', 'source_code'].includes(type)
  }

  /**
   * Constrói informações visíveis para o comprador
   */
  private buildBuyerInfo(type: DeliveryType, data: DeliveryData, orderId: string): DeliveryResult['buyerInfo'] {
    const baseInfo = { type, instructions: '' }

    switch (data.type) {
      case 'download':
        return {
          ...baseInfo,
          instructions: `Faça o download do arquivo "${data.fileName}" (${this.formatFileSize(data.fileSize)})`,
          downloadUrl: `/download/${orderId}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      case 'license_key':
        return {
          ...baseInfo,
          instructions: `Sua chave de licença: ${data.key}. ${data.instructions}`,
        }
      case 'course_access':
        return {
          ...baseInfo,
          instructions: `Acesse o curso em: ${data.platformUrl}`,
        }
      case 'ebook_download':
        return {
          ...baseInfo,
          instructions: `Download do e-book em formato ${data.format.toUpperCase()}`,
          downloadUrl: `/download/${orderId}`,
        }
      case 'api_credentials':
        return {
          ...baseInfo,
          instructions: `Suas credenciais de API foram geradas. Documentação: ${data.docs}`,
        }
      case 'saas_access':
        return {
          ...baseInfo,
          instructions: `Acesse a plataforma: ${data.platformUrl}`,
        }
      case 'subscription_access':
        return {
          ...baseInfo,
          instructions: `Acesso ao plano ${data.planName} ativado de ${data.startDate} até ${data.endDate}`,
        }
      case 'service_delivery':
        return {
          ...baseInfo,
          instructions: `Serviço com ${data.milestones.length} etapas. Acompanhe o progresso.`,
        }
      default:
        return {
          ...baseInfo,
          instructions: 'Entrega processada. Verifique os detalhes no pedido.',
        }
    }
  }

  /** Formata tamanho de arquivo */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  /** Obtém entrega pelo ID */
  getDelivery(deliveryId: string): DeliveryRecord | undefined {
    return this.deliveries.get(deliveryId)
  }

  /** Lista entregas de um comprador */
  getBuyerDeliveries(buyerId: string): DeliveryRecord[] {
    return Array.from(this.deliveries.values())
      .filter(d => d.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /** Lista entregas de um vendedor */
  getSellerDeliveries(sellerId: string): DeliveryRecord[] {
    return Array.from(this.deliveries.values())
      .filter(d => d.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

// Instância singleton
export const deliveryEngine = new DeliveryEngine()
