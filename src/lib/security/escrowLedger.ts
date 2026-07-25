// ─────────────────────────────────────────────────────────────
// Escrow Ledger v0.0.1 — Sistema de Custódia 7 dias
// Dinheiro fica retido até confirmação ou liberação automática
// Suporte a disputas com provas e mediação
// ─────────────────────────────────────────────────────────────

export type EscrowStatus =
  | 'pending_payment'
  | 'held'
  | 'released'
  | 'disputed'
  | 'partially_released'
  | 'refunded'
  | 'cancelled'

export type EscrowReleaseType = 'auto' | 'buyer_confirmed' | 'admin_release' | 'dispute_resolved'

export interface EscrowTransaction {
  id: string
  orderId: string
  sellerId: string
  buyerId: string
  amount: number
  platformFee: number
  affiliateFee: number
  netAmount: number
  status: EscrowStatus
  heldAt: string
  releaseAt: string // Data de liberação automática (7 dias)
  releasedAt: string | null
  releaseType: EscrowReleaseType | null
  disputeId: string | null
  metadata: Record<string, unknown>
  timeline: EscrowEvent[]
}

export interface EscrowEvent {
  timestamp: string
  type: string
  description: string
  actorId: string
  actorRole: 'system' | 'buyer' | 'seller' | 'admin'
}

/**
 * Cria transação de escrow para um pedido
 * O dinheiro fica retido por 7 dias ou até confirmação do comprador
 */
export function createEscrow(params: {
  orderId: string
  sellerId: string
  buyerId: string
  amount: number
  platformFee: number
  affiliateFee: number
}): EscrowTransaction {
  const now = new Date()
  const releaseAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 dias

  return {
    id: `escrow_${Date.now()}_${params.orderId}`,
    orderId: params.orderId,
    sellerId: params.sellerId,
    buyerId: params.buyerId,
    amount: params.amount,
    platformFee: params.platformFee,
    affiliateFee: params.affiliateFee,
    netAmount: params.amount - params.platformFee - params.affiliateFee,
    status: 'pending_payment',
    heldAt: now.toISOString(),
    releaseAt: releaseAt.toISOString(),
    releasedAt: null,
    releaseType: null,
    disputeId: null,
    metadata: {},
    timeline: [
      {
        timestamp: now.toISOString(),
        type: 'created',
        description: 'Escrow criado aguardando pagamento',
        actorId: 'system',
        actorRole: 'system',
      },
    ],
  }
}

/**
 * Confirma pagamento e coloca em custódia
 */
export function holdEscrow(escrow: EscrowTransaction): EscrowTransaction {
  return {
    ...escrow,
    status: 'held',
    timeline: [
      ...escrow.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'payment_confirmed',
        description: 'Pagamento confirmado, valor em custódia',
        actorId: 'system',
        actorRole: 'system',
      },
    ],
  }
}

/**
 * Libera fundos para o vendedor
 */
export function releaseEscrow(
  escrow: EscrowTransaction,
  releaseType: EscrowReleaseType,
  actorId: string
): EscrowTransaction {
  return {
    ...escrow,
    status: 'released',
    releasedAt: new Date().toISOString(),
    releaseType,
    timeline: [
      ...escrow.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'released',
        description: `Fundos liberados para o vendedor (${releaseType})`,
        actorId,
        actorRole: actorId === 'system' ? 'system' : 'admin',
      },
    ],
  }
}

/**
 * Libera fundos automaticamente após 7 dias
 */
export function processAutoRelease(escrow: EscrowTransaction): {
  shouldRelease: boolean
  escrow?: EscrowTransaction
  reason?: string
} {
  const now = new Date()
  const releaseDate = new Date(escrow.releaseAt)

  if (escrow.status !== 'held') {
    return { shouldRelease: false, reason: `Escrow não está em custódia (status: ${escrow.status})` }
  }

  if (now < releaseDate) {
    return {
      shouldRelease: false,
      reason: `Prazo de custódia não expirou. Liberação em ${releaseDate.toISOString()}`,
    }
  }

  return {
    shouldRelease: true,
    escrow: releaseEscrow(escrow, 'auto', 'system'),
  }
}

/**
 * Cancela escrow e reembolsa comprador
 */
export function cancelEscrow(
  escrow: EscrowTransaction,
  reason: string,
  actorId: string
): EscrowTransaction {
  return {
    ...escrow,
    status: 'refunded',
    timeline: [
      ...escrow.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'cancelled',
        description: `Escrow cancelado: ${reason}`,
        actorId,
        actorRole: 'admin',
      },
    ],
  }
}

/**
 * Calcula tempo restante de custódia em horas
 */
export function getRemainingHoldTime(escrow: EscrowTransaction): number {
  if (escrow.status !== 'held') return 0
  const now = new Date().getTime()
  const release = new Date(escrow.releaseAt).getTime()
  return Math.max(0, Math.floor((release - now) / (1000 * 60 * 60)))
}

/**
 * Verifica se escrow pode ser liberado antecipadamente (comprador confirmou)
 */
export function canEarlyRelease(escrow: EscrowTransaction): boolean {
  return escrow.status === 'held'
}
