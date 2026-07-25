// ─────────────────────────────────────────────────────────────
// LedgerService v0.0.1 — Double-entry contabilidade + escrow 7d
// getBalance com available vs pending
// Integração com Supabase ledger_entries, escrow_transactions
// ─────────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string
  accountId: string
  transactionType: 'sale' | 'refund' | 'payout' | 'adjustment' | 'fee' | 'affiliate' | 'escrow_release' | 'escrow_refund'
  debit: number // Saída
  credit: number // Entrada
  balance: number // Saldo após esta entrada
  description: string
  referenceType: 'order' | 'withdrawal' | 'dispute' | 'adjustment'
  referenceId: string
  userId: string
  createdAt: string
  metadata: Record<string, unknown>
}

export interface BalanceInfo {
  available: number  // Disponível para saque
  pending: number    // Em escrow (7 dias)
  total: number      // Total (available + pending)
  blocked: number    // Bloqueado por disputa
}

export interface EscrowTransaction {
  id: string
  orderId: string
  sellerId: string
  buyerId: string
  amount: number
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  heldAt: string
  releaseAt: string // 7 dias após
  releasedAt: string | null
}

const ESCROW_DAYS = 7
const MIN_PAYOUT_AMOUNT = 0.99
const MIN_PAYOUT_AMOUNT_PIX = 30 // R$30 mínimo para PIX

export class LedgerService {
  /**
   * Registra venda no ledger com escrow
   */
  recordSale(params: {
    orderId: string
    sellerId: string
    buyerId: string
    grossAmount: number
    sellerFee: number
    paymentFee: number
    affiliateCommission: number
    netAmount: number
  }): { entries: LedgerEntry[]; escrow: EscrowTransaction } {
    const now = new Date()
    const releaseAt = new Date(now.getTime() + ESCROW_DAYS * 24 * 60 * 60 * 1000)
    const entries: LedgerEntry[] = []

    // 1. Débito do comprador
    entries.push(this.createEntry({
      accountId: params.buyerId,
      transactionType: 'sale',
      debit: params.grossAmount,
      credit: 0,
      description: `Pagamento do pedido ${params.orderId}`,
      referenceType: 'order',
      referenceId: params.orderId,
      userId: params.buyerId,
    }))

    // 2. Valor bruto em escrow (conta de custódia)
    entries.push(this.createEntry({
      accountId: `escrow_${params.orderId}`,
      transactionType: 'sale',
      debit: 0,
      credit: params.grossAmount,
      description: `Valor em custódia - Pedido ${params.orderId}`,
      referenceType: 'order',
      referenceId: params.orderId,
      userId: 'system',
    }))

    // 3. Taxa do marketplace
    if (params.sellerFee > 0) {
      entries.push(this.createEntry({
        accountId: 'marketplace_fees',
        transactionType: 'fee',
        debit: 0,
        credit: params.sellerFee,
        description: `Taxa de marketplace - Pedido ${params.orderId}`,
        referenceType: 'order',
        referenceId: params.orderId,
        userId: 'system',
      }))
    }

    // 4. Taxa de pagamento
    if (params.paymentFee > 0) {
      entries.push(this.createEntry({
        accountId: 'payment_fees',
        transactionType: 'fee',
        debit: 0,
        credit: params.paymentFee,
        description: `Taxa de pagamento - Pedido ${params.orderId}`,
        referenceType: 'order',
        referenceId: params.orderId,
        userId: 'system',
      }))
    }

    // 5. Comissão de afiliado
    if (params.affiliateCommission > 0) {
      entries.push(this.createEntry({
        accountId: 'affiliate_payable',
        transactionType: 'affiliate',
        debit: 0,
        credit: params.affiliateCommission,
        description: `Comissão de afiliado - Pedido ${params.orderId}`,
        referenceType: 'order',
        referenceId: params.orderId,
        userId: 'system',
      }))
    }

    // Escrow
    const escrow: EscrowTransaction = {
      id: `escrow_${Date.now()}`,
      orderId: params.orderId,
      sellerId: params.sellerId,
      buyerId: params.buyerId,
      amount: params.netAmount,
      status: 'held',
      heldAt: now.toISOString(),
      releaseAt: releaseAt.toISOString(),
      releasedAt: null,
    }

    return { entries, escrow }
  }

  /**
   * Libera escrow (automático após 7 dias ou confirmação manual)
   */
  releaseEscrow(escrow: EscrowTransaction): {
    entry: LedgerEntry
    updatedEscrow: EscrowTransaction
  } {
    const entry = this.createEntry({
      accountId: escrow.sellerId,
      transactionType: 'escrow_release',
      debit: 0,
      credit: escrow.amount,
      description: `Liberação de escrow - Pedido ${escrow.orderId}`,
      referenceType: 'order',
      referenceId: escrow.orderId,
      userId: escrow.sellerId,
    })

    return {
      entry,
      updatedEscrow: {
        ...escrow,
        status: 'released',
        releasedAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Calcula saldo available vs pending para um usuário
   */
  getBalance(
    userId: string,
    escrows: EscrowTransaction[],
    entries: LedgerEntry[]
  ): BalanceInfo {
    const userEntries = entries.filter(e => e.accountId === userId)
    const userEscrows = escrows.filter(e =>
      (e.sellerId === userId || e.buyerId === userId) && e.status === 'held'
    )

    // Total = créditos - débitos
    const totalCredits = userEntries.reduce((s, e) => s + e.credit, 0)
    const totalDebits = userEntries.reduce((s, e) => s + e.debit, 0)
    const total = Math.max(0, totalCredits - totalDebits)

    // Pending = valor em escrow não liberado
    const pending = userEscrows.reduce((s, e) => s + e.amount, 0)

    // Blocked = valor em disputa
    const disputedEscrows = escrows.filter(e =>
      (e.sellerId === userId || e.buyerId === userId) && e.status === 'disputed'
    )
    const blocked = disputedEscrows.reduce((s, e) => s + e.amount, 0)

    return {
      available: Math.max(0, total - pending - blocked),
      pending,
      total,
      blocked,
    }
  }

  /**
   * Verifica se pode sacar (mínimo R$0,99 para geral, R$30 para PIX)
   */
  canWithdraw(
    balance: BalanceInfo,
    method: 'pix' | 'ted' | 'boleto' = 'pix'
  ): { can: boolean; reason?: string; minAmount: number } {
    const minAmount = method === 'pix' ? MIN_PAYOUT_AMOUNT_PIX : MIN_PAYOUT_AMOUNT

    if (balance.available < minAmount) {
      return {
        can: false,
        reason: `Saldo disponível mínimo de R$ ${minAmount.toFixed(2)} para saque via ${method.toUpperCase()}`,
        minAmount,
      }
    }

    return { can: true, minAmount }
  }

  /**
   * Verifica escrows expirados que devem ser liberados
   */
  getExpiredEscrows(escrows: EscrowTransaction[]): EscrowTransaction[] {
    const now = new Date()
    return escrows.filter(e =>
      e.status === 'held' && new Date(e.releaseAt) <= now
    )
  }

  private createEntry(params: {
    accountId: string
    transactionType: LedgerEntry['transactionType']
    debit: number
    credit: number
    description: string
    referenceType: LedgerEntry['referenceType']
    referenceId: string
    userId: string
    metadata?: Record<string, unknown>
  }): LedgerEntry {
    return {
      id: `le_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      accountId: params.accountId,
      transactionType: params.transactionType,
      debit: params.debit,
      credit: params.credit,
      balance: params.credit - params.debit,
      description: params.description,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      userId: params.userId,
      createdAt: new Date().toISOString(),
      metadata: params.metadata || {},
    }
  }
}

export const ledgerService = new LedgerService()
