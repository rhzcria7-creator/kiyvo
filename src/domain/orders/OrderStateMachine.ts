// ─────────────────────────────────────────────────────────────
// OrderStateMachine — Máquina de Estados de Pedidos
// Define todas as transições válidas e regras de negócio
// ─────────────────────────────────────────────────────────────

/** Status possíveis de um pedido */
export type OrderStatus =
  | 'pending'        // Pedido criado, aguardando pagamento
  | 'payment_processing' // Pagamento em processamento
  | 'paid'           // Pagamento confirmado
  | 'delivering'     // Produto sendo entregue
  | 'delivered'      // Produto entregue ao comprador
  | 'confirmed'      // Comprador confirmou recebimento
  | 'in_dispute'     // Disputa aberta
  | 'refunded'       // Reembolsado
  | 'cancelled'      // Cancelado
  | 'expired'        // Pagamento expirou (PIX/boleto não pago)

/** Transição de status */
export interface StatusTransition {
  from: OrderStatus
  to: OrderStatus
  /** Quem pode executar esta transição */
  allowedBy: ('buyer' | 'seller' | 'system' | 'admin')[]
  /** Condições que devem ser verdadeiras para a transição */
  conditions?: string[]
  /** Ações automáticas após a transição */
  actions?: string[]
  /** Descrição da transição */
  description: string
}

/** Resultado de uma tentativa de transição */
export interface TransitionResult {
  success: boolean
  from: OrderStatus
  to: OrderStatus
  error?: string
  actionsTriggered?: string[]
}

/** Histórico de status */
export interface OrderStatusHistory {
  id: string
  orderId: string
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedBy: string
  changedByRole: 'buyer' | 'seller' | 'system' | 'admin'
  reason?: string
  createdAt: string
}

// ─── TRANSIÇÕES VÁLIDAS ──────────────────────────────────────

const VALID_TRANSITIONS: StatusTransition[] = [
  // Pagamento
  {
    from: 'pending',
    to: 'payment_processing',
    allowedBy: ['system'],
    actions: ['notify_seller_new_order', 'start_payment_timeout'],
    description: 'Pagamento iniciado pelo comprador',
  },
  {
    from: 'pending',
    to: 'cancelled',
    allowedBy: ['buyer', 'system'],
    actions: ['release_inventory'],
    description: 'Pedido cancelado antes do pagamento',
  },
  {
    from: 'pending',
    to: 'expired',
    allowedBy: ['system'],
    conditions: ['payment_timeout_reached'],
    actions: ['notify_buyer_expired', 'release_inventory'],
    description: 'Pagamento expirou (PIX/boleto não pago)',
  },
  {
    from: 'payment_processing',
    to: 'paid',
    allowedBy: ['system'],
    actions: ['process_delivery', 'credit_seller', 'award_kd_points', 'notify_seller_paid', 'notify_buyer_paid'],
    description: 'Pagamento confirmado pelo gateway',
  },
  {
    from: 'payment_processing',
    to: 'cancelled',
    allowedBy: ['system'],
    conditions: ['payment_failed'],
    actions: ['notify_buyer_payment_failed', 'release_inventory'],
    description: 'Pagamento falhou',
  },

  // Entrega
  {
    from: 'paid',
    to: 'delivering',
    allowedBy: ['system'],
    conditions: ['delivery_type_auto'],
    actions: ['send_download_link', 'send_license_key', 'grant_access'],
    description: 'Entrega automática iniciada',
  },
  {
    from: 'paid',
    to: 'delivered',
    allowedBy: ['system'],
    conditions: ['delivery_type_auto', 'instant_delivery'],
    actions: ['notify_buyer_delivered', 'start_confirmation_timer'],
    description: 'Entrega automática concluída',
  },
  {
    from: 'paid',
    to: 'delivering',
    allowedBy: ['seller'],
    conditions: ['delivery_type_manual'],
    actions: ['notify_buyer_seller_preparing'],
    description: 'Vendedor iniciou preparação da entrega manual',
  },
  {
    from: 'delivering',
    to: 'delivered',
    allowedBy: ['seller', 'system'],
    actions: ['notify_buyer_delivered', 'start_confirmation_timer'],
    description: 'Produto entregue ao comprador',
  },

  // Confirmação
  {
    from: 'delivered',
    to: 'confirmed',
    allowedBy: ['buyer', 'system'],
    conditions: ['confirmation_timer_expired', 'buyer_confirmed'],
    actions: ['release_funds_to_seller', 'request_review', 'notify_seller_confirmed'],
    description: 'Comprador confirmou recebimento',
  },

  // Disputas
  {
    from: 'delivered',
    to: 'in_dispute',
    allowedBy: ['buyer'],
    conditions: ['within_dispute_period'],
    actions: ['hold_seller_funds', 'notify_seller_dispute', 'create_dispute_case'],
    description: 'Comprador abriu disputa',
  },
  {
    from: 'confirmed',
    to: 'in_dispute',
    allowedBy: ['buyer'],
    conditions: ['within_dispute_period'],
    actions: ['hold_seller_funds', 'notify_seller_dispute', 'create_dispute_case'],
    description: 'Disputa aberta após confirmação',
  },
  {
    from: 'in_dispute',
    to: 'confirmed',
    allowedBy: ['admin'],
    conditions: ['dispute_resolved_in_favor_seller'],
    actions: ['release_funds_to_seller', 'close_dispute_case'],
    description: 'Disputa resolvida a favor do vendedor',
  },
  {
    from: 'in_dispute',
    to: 'refunded',
    allowedBy: ['admin', 'system'],
    conditions: ['dispute_resolved_in_favor_buyer'],
    actions: ['refund_buyer', 'deduct_seller', 'close_dispute_case'],
    description: 'Disputa resolvida a favor do comprador — reembolso',
  },

  // Reembolso
  {
    from: 'paid',
    to: 'refunded',
    allowedBy: ['admin'],
    actions: ['refund_buyer', 'deduct_seller', 'release_inventory'],
    description: 'Reembolso aprovado pelo admin',
  },
  {
    from: 'delivered',
    to: 'refunded',
    allowedBy: ['admin'],
    actions: ['refund_buyer', 'deduct_seller', 'revoke_access'],
    description: 'Reembolso após entrega',
  },
  {
    from: 'refunded',
    to: 'in_dispute',
    allowedBy: ['seller'],
    conditions: ['within_appeal_period'],
    actions: ['create_appeal_case'],
    description: 'Vendedor recorre do reembolso',
  },
]

// ─── ORDER STATE MACHINE ─────────────────────────────────────

export class OrderStateMachine {
  private history: Map<string, OrderStatusHistory[]> = new Map()

  /**
   * Tenta transicionar o status de um pedido
   * Retorna sucesso ou erro com motivo
   */
  transition(params: {
    orderId: string
    fromStatus: OrderStatus
    toStatus: OrderStatus
    changedBy: string
    changedByRole: 'buyer' | 'seller' | 'system' | 'admin'
    reason?: string
  }): TransitionResult {
    const { orderId, fromStatus, toStatus, changedBy, changedByRole, reason } = params

    // Encontrar a transição válida
    const transition = VALID_TRANSITIONS.find(
      t => t.from === fromStatus && t.to === toStatus
    )

    if (!transition) {
      return {
        success: false,
        from: fromStatus,
        to: toStatus,
        error: `Transição inválida: ${fromStatus} → ${toStatus}`,
      }
    }

    // Verificar permissão
    if (!transition.allowedBy.includes(changedByRole)) {
      return {
        success: false,
        from: fromStatus,
        to: toStatus,
        error: `${changedByRole} não tem permissão para esta transição`,
      }
    }

    // Registrar no histórico
    const historyEntry: OrderStatusHistory = {
      id: `osh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderId,
      fromStatus,
      toStatus,
      changedBy,
      changedByRole,
      reason,
      createdAt: new Date().toISOString(),
    }

    const orderHistory = this.history.get(orderId) || []
    orderHistory.push(historyEntry)
    this.history.set(orderId, orderHistory)

    return {
      success: true,
      from: fromStatus,
      to: toStatus,
      actionsTriggered: transition.actions,
    }
  }

  /**
   * Verifica se uma transição é possível
   */
  canTransition(fromStatus: OrderStatus, toStatus: OrderStatus, role: 'buyer' | 'seller' | 'system' | 'admin'): boolean {
    const transition = VALID_TRANSITIONS.find(
      t => t.from === fromStatus && t.to === toStatus
    )
    return !!transition && transition.allowedBy.includes(role)
  }

  /**
   * Retorna os próximos status possíveis a partir do status atual
   */
  getNextStatuses(currentStatus: OrderStatus, role?: 'buyer' | 'seller' | 'system' | 'admin'): OrderStatus[] {
    return VALID_TRANSITIONS
      .filter(t => t.from === currentStatus && (!role || t.allowedBy.includes(role)))
      .map(t => t.to)
  }

  /**
   * Retorna o histórico de status de um pedido
   */
  getHistory(orderId: string): OrderStatusHistory[] {
    return this.history.get(orderId) || []
  }

  /**
   * Retorna todas as transições válidas
   */
  getValidTransitions(): StatusTransition[] {
    return VALID_TRANSITIONS
  }

  /**
   * Verifica se o pedido pode ser cancelado
   */
  canCancel(status: OrderStatus, role: 'buyer' | 'seller' | 'system' | 'admin'): boolean {
    return this.canTransition(status, 'cancelled', role)
  }

  /**
   * Verifica se o pedido pode ser disputado
   */
  canDispute(status: OrderStatus): boolean {
    return this.canTransition(status, 'in_dispute', 'buyer')
  }

  /**
   * Verifica se o pedido pode ser reembolsado
   */
  canRefund(status: OrderStatus): boolean {
    return this.canTransition(status, 'refunded', 'admin')
  }
}

// Instância singleton
export const orderStateMachine = new OrderStateMachine()
