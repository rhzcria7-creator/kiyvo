// ─────────────────────────────────────────────────────────────
// Ledger — Sistema de Contabilidade de Partidas Dobradas
// Double-Entry Bookkeeping para auditoria financeira completa
// Cada transação DEVE balancear: Total Débitos = Total Créditos
// ─────────────────────────────────────────────────────────────

/** Tipos de conta no ledger */
export type LedgerAccountType =
  | 'asset'           // Ativo (caixa, banco, a receber)
  | 'liability'       // Passivo (a pagar, comissões a liquidar)
  | 'revenue'         // Receita (comissões, taxas)
  | 'expense'         // Despesa (gateway, chargebacks)
  | 'equity'          // Patrimônio
  | 'contra_revenue'  // Dedução de receita (descontos, cashback)

/** Identificador das contas do ledger — cada conta é única */
export type LedgerAccountName =
  | 'seller_wallet'           // Carteira do vendedor (asset do vendedor)
  | 'buyer_wallet'            // Carteira do comprador
  | 'platform_revenue'        // Receita da plataforma
  | 'platform_expense'        // Despesa da plataforma
  | 'payment_processor'       // Conta do gateway (saída)
  | 'affiliate_payable'       // Comissões a pagar para afiliados
  | 'points_liability'        // KD Points emitidos (passivo)
  | 'buyer_fee_revenue'       // Receita de taxa do comprador
  | 'seller_fee_revenue'      // Receita de taxa do vendedor
  | 'gateway_expense'         // Despesa com gateway
  | 'hold_account'            // Conta de retenção (dinheiro em custódia)
  | 'payout_account'          // Conta de saques
  | 'refund_payable'          // Reembolsos a processar
  | 'tax_payable'             // Impostos a recolher
  | 'insurance_reserve'       // Reserva para garantias

/** Entrada individual do ledger — débito ou crédito */
export interface LedgerEntry {
  id: string
  transactionId: string
  accountName: LedgerAccountName
  accountType: LedgerAccountType
  /** Débito (valor que sai da conta) */
  debit: number
  /** Crédito (valor que entra na conta) */
  credit: number
  description: string
  referenceType: 'order' | 'withdrawal' | 'payout' | 'refund' | 'affiliate' | 'points' | 'adjustment' | 'subscription'
  referenceId: string
  createdAt: string
}

/** Transação do ledger — agrupa entradas que devem balancear */
export interface LedgerTransaction {
  id: string
  description: string
  entries: LedgerEntry[]
  /** Total de débitos — DEVE ser igual ao total de créditos */
  totalDebit: number
  totalCredit: number
  /** Se a transação está balanceada */
  isBalanced: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

/** Snapshot de saldo de uma conta em um momento */
export interface BalanceSnapshot {
  accountName: LedgerAccountName
  balance: number
  totalDebit: number
  totalCredit: number
  snapshotAt: string
}

/** Resultado de uma liquidação (settlement) */
export interface Settlement {
  id: string
  sellerId: string
  periodStart: string
  periodEnd: string
  grossAmount: number
  fees: number
  netAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  entries: string[] // IDs das ledger entries
  createdAt: string
}

// ─── LEDGER ENGINE ───────────────────────────────────────────

/**
 * LedgerEngine — Motor de Contabilidade
 * 
 * Regras:
 * 1. Toda transação DEVE balancear (total débitos = total créditos)
 * 2. Entradas são imutáveis — nunca alterar, apenas estornar
 * 3. Cada centavo é rastreável
 * 4. Auditoria completa com referências
 */
export class LedgerEngine {
  private transactions: Map<string, LedgerTransaction> = new Map()
  private accountBalances: Map<LedgerAccountName, { debit: number; credit: number }> = new Map()

  constructor() {
    // Inicializar saldos zerados para todas as contas
    const accounts: LedgerAccountName[] = [
      'seller_wallet', 'buyer_wallet', 'platform_revenue', 'platform_expense',
      'payment_processor', 'affiliate_payable', 'points_liability',
      'buyer_fee_revenue', 'seller_fee_revenue', 'gateway_expense',
      'hold_account', 'payout_account', 'refund_payable', 'tax_payable',
      'insurance_reserve',
    ]
    for (const account of accounts) {
      this.accountBalances.set(account, { debit: 0, credit: 0 })
    }
  }

  /**
   * Registra uma venda completa no ledger
   * Cria todas as entradas de débito/crédito necessárias
   */
  recordSale(params: {
    orderId: string
    grossAmount: number
    buyerServiceFee: number
    sellerMarketplaceFee: number
    paymentProcessorFee: number
    affiliateCommission: number
    rewardPointsCost: number
    netSellerAmount: number
    sellerId: string
    buyerId: string
    affiliateId?: string
  }): LedgerTransaction {
    const {
      orderId,
      grossAmount,
      buyerServiceFee,
      sellerMarketplaceFee,
      paymentProcessorFee,
      affiliateCommission,
      rewardPointsCost,
      netSellerAmount,
    } = params

    const txId = `ledger_${Date.now()}_${orderId}`
    const now = new Date().toISOString()
    const entries: LedgerEntry[] = []
    let entryIndex = 0

    // 1. Dinheiro do comprador → Conta de custódia (hold)
    // DÉBITO em hold_account (dinheiro retido)
    entries.push({
      id: `${txId}_e${entryIndex++}`,
      transactionId: txId,
      accountName: 'hold_account',
      accountType: 'asset',
      debit: grossAmount + buyerServiceFee,
      credit: 0,
      description: `Valor retido do comprador para pedido ${orderId}`,
      referenceType: 'order',
      referenceId: orderId,
      createdAt: now,
    })
    // CRÉDITO em buyer_wallet (desconta do comprador)
    entries.push({
      id: `${txId}_e${entryIndex++}`,
      transactionId: txId,
      accountName: 'buyer_wallet',
      accountType: 'asset',
      debit: 0,
      credit: grossAmount + buyerServiceFee,
      description: `Débito do comprador para pedido ${orderId}`,
      referenceType: 'order',
      referenceId: orderId,
      createdAt: now,
    })

    // 2. Taxa do comprador → Receita da plataforma
    if (buyerServiceFee > 0) {
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'buyer_fee_revenue',
        accountType: 'revenue',
        debit: buyerServiceFee,
        credit: 0,
        description: `Taxa de serviço do comprador (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'hold_account',
        accountType: 'asset',
        debit: 0,
        credit: buyerServiceFee,
        description: `Liberação da taxa do comprador (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
    }

    // 3. Taxa do vendedor → Receita da plataforma
    if (sellerMarketplaceFee > 0) {
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'seller_fee_revenue',
        accountType: 'revenue',
        debit: sellerMarketplaceFee,
        credit: 0,
        description: `Taxa de marketplace do vendedor (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'hold_account',
        accountType: 'asset',
        debit: 0,
        credit: sellerMarketplaceFee,
        description: `Dedução da taxa do vendedor (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
    }

    // 4. Gateway → Despesa da plataforma
    if (paymentProcessorFee > 0) {
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'gateway_expense',
        accountType: 'expense',
        debit: paymentProcessorFee,
        credit: 0,
        description: `Taxa do gateway de pagamento (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'payment_processor',
        accountType: 'asset',
        debit: 0,
        credit: paymentProcessorFee,
        description: `Pagamento ao gateway (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
    }

    // 5. Comissão de afiliado → Passivo (a pagar)
    if (affiliateCommission > 0) {
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'affiliate_payable',
        accountType: 'liability',
        debit: affiliateCommission,
        credit: 0,
        description: `Comissão de afiliado reservada (${orderId})`,
        referenceType: 'affiliate',
        referenceId: params.affiliateId || 'unknown',
        createdAt: now,
      })
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'hold_account',
        accountType: 'asset',
        debit: 0,
        credit: affiliateCommission,
        description: `Dedução da comissão de afiliado (${orderId})`,
        referenceType: 'order',
        referenceId: orderId,
        createdAt: now,
      })
    }

    // 6. KD Points → Passivo (pontos emitidos)
    if (rewardPointsCost > 0) {
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'points_liability',
        accountType: 'liability',
        debit: rewardPointsCost,
        credit: 0,
        description: `KD Points emitidos como cashback (${orderId})`,
        referenceType: 'points',
        referenceId: orderId,
        createdAt: now,
      })
      entries.push({
        id: `${txId}_e${entryIndex++}`,
        transactionId: txId,
        accountName: 'platform_expense',
        accountType: 'expense',
        debit: 0,
        credit: rewardPointsCost,
        description: `Custo dos KD Points (${orderId})`,
        referenceType: 'points',
        referenceId: orderId,
        createdAt: now,
      })
    }

    // 7. Valor líquido → Carteira do vendedor
    entries.push({
      id: `${txId}_e${entryIndex++}`,
      transactionId: txId,
      accountName: 'seller_wallet',
      accountType: 'asset',
      debit: netSellerAmount,
      credit: 0,
      description: `Valor líquido creditado ao vendedor (${orderId})`,
      referenceType: 'order',
      referenceId: orderId,
      createdAt: now,
    })
    entries.push({
      id: `${txId}_e${entryIndex++}`,
      transactionId: txId,
      accountName: 'hold_account',
      accountType: 'asset',
      debit: 0,
      credit: netSellerAmount,
      description: `Liberação do valor líquido ao vendedor (${orderId})`,
      referenceType: 'order',
      referenceId: orderId,
      createdAt: now,
    })

    // Calcular totais e validar balanceamento
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0)
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0)
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

    if (!isBalanced) {
      // Log de alerta — transação não balanceada é ERRO CRÍTICO
      // Em produção, isso deve disparar alerta imediato
      const diff = Math.abs(totalDebit - totalCredit)
      if (diff >= 0.01) {
        throw new Error(`LEDGER IMBALANCE: Debit ${totalDebit} ≠ Credit ${totalCredit} (diff: ${diff}) for order ${orderId}`)
      }
    }

    const transaction: LedgerTransaction = {
      id: txId,
      description: `Venda do pedido ${orderId} — R$${grossAmount.toFixed(2)}`,
      entries,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      isBalanced,
      createdAt: now,
      metadata: { orderId, sellerId: params.sellerId, buyerId: params.buyerId },
    }

    // Atualizar saldos das contas
    for (const entry of entries) {
      const balance = this.accountBalances.get(entry.accountName)
      if (balance) {
        balance.debit += entry.debit
        balance.credit += entry.credit
      }
    }

    this.transactions.set(txId, transaction)
    return transaction
  }

  /**
   * Registra um saque (payout) no ledger
   * Dinheiro sai da carteira do vendedor → Conta de saque
   */
  recordWithdrawal(params: {
    withdrawalId: string
    sellerId: string
    amount: number
    fee: number
  }): LedgerTransaction {
    const txId = `ledger_wd_${Date.now()}_${params.withdrawalId}`
    const now = new Date().toISOString()
    const netAmount = params.amount - params.fee

    const entries: LedgerEntry[] = [
      // Débito na carteira do vendedor
      {
        id: `${txId}_e0`,
        transactionId: txId,
        accountName: 'seller_wallet',
        accountType: 'asset',
        debit: 0,
        credit: params.amount,
        description: `Saque do vendedor (${params.withdrawalId})`,
        referenceType: 'withdrawal',
        referenceId: params.withdrawalId,
        createdAt: now,
      },
      // Crédito na conta de saque (valor líquido)
      {
        id: `${txId}_e1`,
        transactionId: txId,
        accountName: 'payout_account',
        accountType: 'asset',
        debit: netAmount,
        credit: 0,
        description: `Valor líquido do saque (${params.withdrawalId})`,
        referenceType: 'withdrawal',
        referenceId: params.withdrawalId,
        createdAt: now,
      },
    ]

    // Taxa de saque, se houver
    if (params.fee > 0) {
      entries.push({
        id: `${txId}_e2`,
        transactionId: txId,
        accountName: 'platform_revenue',
        accountType: 'revenue',
        debit: params.fee,
        credit: 0,
        description: `Taxa de saque (${params.withdrawalId})`,
        referenceType: 'withdrawal',
        referenceId: params.withdrawalId,
        createdAt: now,
      })
    }

    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0)
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0)

    const transaction: LedgerTransaction = {
      id: txId,
      description: `Saque ${params.withdrawalId} — R$${params.amount.toFixed(2)}`,
      entries,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      createdAt: now,
      metadata: { withdrawalId: params.withdrawalId, sellerId: params.sellerId },
    }

    // Atualizar saldos
    for (const entry of entries) {
      const balance = this.accountBalances.get(entry.accountName)
      if (balance) {
        balance.debit += entry.debit
        balance.credit += entry.credit
      }
    }

    this.transactions.set(txId, transaction)
    return transaction
  }

  /**
   * Registra um reembolso no ledger
   * Estorna a venda — dinheiro volta ao comprador
   */
  recordRefund(params: {
    refundId: string
    orderId: string
    amount: number
    sellerDeduction: number
    platformAbsorbs: number
  }): LedgerTransaction {
    const txId = `ledger_ref_${Date.now()}_${params.refundId}`
    const now = new Date().toISOString()

    const entries: LedgerEntry[] = [
      // Deduz do vendedor
      {
        id: `${txId}_e0`,
        transactionId: txId,
        accountName: 'seller_wallet',
        accountType: 'asset',
        debit: 0,
        credit: params.sellerDeduction,
        description: `Dedução do vendedor por reembolso (${params.orderId})`,
        referenceType: 'refund',
        referenceId: params.refundId,
        createdAt: now,
      },
      // Crédito na conta de reembolso
      {
        id: `${txId}_e1`,
        transactionId: txId,
        accountName: 'refund_payable',
        accountType: 'liability',
        debit: params.amount,
        credit: 0,
        description: `Reembolso a processar (${params.orderId})`,
        referenceType: 'refund',
        referenceId: params.refundId,
        createdAt: now,
      },
      // Crédito ao comprador
      {
        id: `${txId}_e2`,
        transactionId: txId,
        accountName: 'buyer_wallet',
        accountType: 'asset',
        debit: params.amount,
        credit: 0,
        description: `Crédito do reembolso ao comprador (${params.orderId})`,
        referenceType: 'refund',
        referenceId: params.refundId,
        createdAt: now,
      },
      // Plataforma absorve parte, se necessário
      {
        id: `${txId}_e3`,
        transactionId: txId,
        accountName: 'platform_expense',
        accountType: 'expense',
        debit: 0,
        credit: params.platformAbsorbs,
        description: `Custo absorvido pela plataforma (${params.orderId})`,
        referenceType: 'refund',
        referenceId: params.refundId,
        createdAt: now,
      },
    ]

    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0)
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0)

    const transaction: LedgerTransaction = {
      id: txId,
      description: `Reembolso do pedido ${params.orderId} — R$${params.amount.toFixed(2)}`,
      entries,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      createdAt: now,
      metadata: { refundId: params.refundId, orderId: params.orderId },
    }

    for (const entry of entries) {
      const balance = this.accountBalances.get(entry.accountName)
      if (balance) {
        balance.debit += entry.debit
        balance.credit += entry.credit
      }
    }

    this.transactions.set(txId, transaction)
    return transaction
  }

  /**
   * Obtém o saldo atual de uma conta
   * Saldo = Total Créditos - Total Débitos (para contas de ativo/receita)
   * Saldo = Total Débitos - Total Créditos (para contas de passivo/despesa)
   */
  getAccountBalance(accountName: LedgerAccountName): number {
    const balance = this.accountBalances.get(accountName)
    if (!balance) return 0

    const accountTypes: Record<LedgerAccountName, LedgerAccountType> = {
      seller_wallet: 'asset',
      buyer_wallet: 'asset',
      platform_revenue: 'revenue',
      platform_expense: 'expense',
      payment_processor: 'asset',
      affiliate_payable: 'liability',
      points_liability: 'liability',
      buyer_fee_revenue: 'revenue',
      seller_fee_revenue: 'revenue',
      gateway_expense: 'expense',
      hold_account: 'asset',
      payout_account: 'asset',
      refund_payable: 'liability',
      tax_payable: 'liability',
      insurance_reserve: 'asset',
    }

    const type = accountTypes[accountName]
    
    // Ativos e Receitas: saldo = débito - crédito
    if (type === 'asset' || type === 'revenue') {
      return balance.debit - balance.credit
    }
    
    // Passivos e Despesas: saldo = crédito - débito
    return balance.credit - balance.debit
  }

  /**
   * Retorna snapshot de todas as contas
   */
  getAllBalances(): BalanceSnapshot[] {
    const snapshots: BalanceSnapshot[] = []
    this.accountBalances.forEach((balance, accountName) => {
      snapshots.push({
        accountName,
        balance: this.getAccountBalance(accountName),
        totalDebit: balance.debit,
        totalCredit: balance.credit,
        snapshotAt: new Date().toISOString(),
      })
    })
    return snapshots
  }

  /**
   * Obtém uma transação pelo ID
   */
  getTransaction(transactionId: string): LedgerTransaction | undefined {
    return this.transactions.get(transactionId)
  }

  /**
   * Lista todas as transações
   */
  listTransactions(limit: number = 50): LedgerTransaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  /**
   * Valida integridade do ledger — todas as transações devem estar balanceadas
   */
  validate(): { valid: boolean; imbalancedTransactions: string[] } {
    const imbalanced: string[] = []
    this.transactions.forEach((tx) => {
      if (!tx.isBalanced) imbalanced.push(tx.id)
    })
    return { valid: imbalanced.length === 0, imbalancedTransactions: imbalanced }
  }
}

// ─── INSTÂNCIA SINGLETON ─────────────────────────────────────
export const ledgerEngine = new LedgerEngine()
