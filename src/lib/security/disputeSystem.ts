// ─────────────────────────────────────────────────────────────
// Dispute System v0.0.1 — Sistema de disputas com mediação
// Fluxo: Aberta → Revisão → Resolvida (a favor comprador/vendedor/divisão)
// Upload de provas + chat da disputa + mediador admin
// ─────────────────────────────────────────────────────────────

export type DisputeStatus = 'open' | 'under_review' | 'awaiting_evidence' | 'resolved' | 'cancelled'
export type DisputeResolution = 'buyer_win' | 'seller_win' | 'split' | 'cancelled'

export interface DisputeEvidence {
  id: string
  type: 'message' | 'file' | 'screenshot' | 'link' | 'other'
  content: string
  uploadedBy: 'buyer' | 'seller' | 'admin'
  uploadedAt: string
  fileUrl?: string
}

export interface Dispute {
  id: string
  orderId: string
  productId: string
  buyerId: string
  sellerId: string
  openedBy: 'buyer' | 'seller' | 'system'
  reason: string
  description: string
  status: DisputeStatus
  resolution: DisputeResolution | null
  resolutionNote: string | null
  adminId: string | null
  evidence: DisputeEvidence[]
  timeline: DisputeEvent[]
  escrowAction: 'release_to_seller' | 'refund_buyer' | 'split' | null
  createdAt: string
  resolvedAt: string | null
  metadata: Record<string, unknown>
}

export interface DisputeEvent {
  timestamp: string
  type: string
  actorId: string
  actorRole: 'buyer' | 'seller' | 'admin' | 'system'
  description: string
}

export const DISPUTE_DAYS_LIMIT = 30 // Máximo 30 dias após compra para abrir disputa
export const DISPUTE_RESPONSE_HOURS = 48 // 48h para responder

/**
 * Abre nova disputa
 */
export function openDispute(params: {
  orderId: string
  productId: string
  buyerId: string
  sellerId: string
  reason: string
  description: string
  openedBy: 'buyer' | 'seller' | 'system'
}): Dispute {
  const now = new Date().toISOString()

  const dispute: Dispute = {
    id: `disp_${Date.now()}_${params.orderId}`,
    orderId: params.orderId,
    productId: params.productId,
    buyerId: params.buyerId,
    sellerId: params.sellerId,
    openedBy: params.openedBy,
    reason: params.reason,
    description: params.description,
    status: 'open',
    resolution: null,
    resolutionNote: null,
    adminId: null,
    evidence: [],
    timeline: [
      {
        timestamp: now,
        type: 'opened',
        actorId: params.openedBy === 'system' ? 'system' : params.buyerId,
        actorRole: params.openedBy === 'system' ? 'system' : 'buyer',
        description: `Disputa aberta: ${params.reason}`,
      },
    ],
    escrowAction: null,
    createdAt: now,
    resolvedAt: null,
    metadata: {},
  }

  return dispute
}

/**
 * Envia evidência para a disputa
 */
export function addEvidence(
  dispute: Dispute,
  evidence: Omit<DisputeEvidence, 'id' | 'uploadedAt'>
): Dispute {
  return {
    ...dispute,
    evidence: [
      ...dispute.evidence,
      {
        ...evidence,
        id: `ev_${Date.now()}_${dispute.evidence.length}`,
        uploadedAt: new Date().toISOString(),
      },
    ],
    status: dispute.status === 'awaiting_evidence' ? 'under_review' : dispute.status,
    timeline: [
      ...dispute.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'evidence_added',
        actorId: evidence.uploadedBy === 'admin' ? (dispute.adminId || 'admin') : evidence.uploadedBy === 'buyer' ? dispute.buyerId : dispute.sellerId,
        actorRole: evidence.uploadedBy,
        description: `Nova evidência adicionada: ${evidence.type}`,
      },
    ],
  }
}

/**
 * Admin assume mediação da disputa
 */
export function assignMediator(
  dispute: Dispute,
  adminId: string
): Dispute {
  return {
    ...dispute,
    adminId,
    status: 'under_review',
    timeline: [
      ...dispute.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'assigned',
        actorId: adminId,
        actorRole: 'admin',
        description: 'Mediador atribuído à disputa',
      },
    ],
  }
}

/**
 * Resolve disputa
 */
export function resolveDispute(
  dispute: Dispute,
  resolution: DisputeResolution,
  resolutionNote: string,
  adminId: string
): Dispute {
  const escrowAction = resolution === 'buyer_win'
    ? 'refund_buyer'
    : resolution === 'seller_win'
    ? 'release_to_seller'
    : resolution === 'split'
    ? 'split'
    : null

  return {
    ...dispute,
    status: 'resolved',
    resolution,
    resolutionNote,
    adminId,
    escrowAction,
    resolvedAt: new Date().toISOString(),
    timeline: [
      ...dispute.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'resolved',
        actorId: adminId,
        actorRole: 'admin',
        description: `Disputa resolvida: ${resolution}. Nota: ${resolutionNote}`,
      },
    ],
  }
}

/**
 * Cancela disputa
 */
export function cancelDispute(
  dispute: Dispute,
  reason: string,
  actorId: string
): Dispute {
  return {
    ...dispute,
    status: 'cancelled',
    resolution: 'cancelled',
    resolutionNote: reason,
    escrowAction: 'release_to_seller',
    resolvedAt: new Date().toISOString(),
    timeline: [
      ...dispute.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'cancelled',
        actorId,
        actorRole: 'admin',
        description: `Disputa cancelada: ${reason}`,
      },
    ],
  }
}

/**
 * Solicita mais evidências
 */
export function requestEvidence(
  dispute: Dispute,
  requestedFrom: 'buyer' | 'seller',
  message: string
): Dispute {
  return {
    ...dispute,
    status: 'awaiting_evidence',
    timeline: [
      ...dispute.timeline,
      {
        timestamp: new Date().toISOString(),
        type: 'evidence_requested',
        actorId: dispute.adminId || 'system',
        actorRole: 'admin',
        description: `Evidência solicitada de ${requestedFrom}: ${message}`,
      },
    ],
  }
}

/**
 * Verifica se ainda é possível abrir disputa (dentro do prazo)
 */
export function canOpenDispute(purchaseDate: string): boolean {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  const daysSincePurchase = (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24)
  return daysSincePurchase <= DISPUTE_DAYS_LIMIT
}
