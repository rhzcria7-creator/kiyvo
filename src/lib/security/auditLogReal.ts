// ─────────────────────────────────────────────────────────────
// Audit Log Real v0.0.1 — Sistema de auditoria imutável
// Toda ação crítica é logada: quem fez, o que fez, quando, de onde
// Logs são imutáveis (append-only) com hash chain
// ─────────────────────────────────────────────────────────────

import { createHash } from 'crypto'

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.update_profile'
  | 'user.delete'
  | 'user.ban'
  | 'user.unban'
  | 'user.2fa_enabled'
  | 'user.2fa_disabled'
  | 'user.password_change'
  | 'user.email_change'
  | 'user.kyc_submitted'
  | 'user.kyc_approved'
  | 'user.kyc_rejected'
  | 'order.created'
  | 'order.paid'
  | 'order.completed'
  | 'order.cancelled'
  | 'order.refunded'
  | 'order.dispute_opened'
  | 'order.dispute_resolved'
  | 'order.dispute_lost'
  | 'payment.processed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.approved'
  | 'product.rejected'
  | 'product.flagged'
  | 'withdrawal.requested'
  | 'withdrawal.approved'
  | 'withdrawal.rejected'
  | 'withdrawal.completed'
  | 'admin.action'
  | 'admin.ban'
  | 'admin.unban'
  | 'admin.delete_product'
  | 'admin.approve_product'
  | 'admin.reject_product'
  | 'settings.updated'
  | 'security.alert'
  | 'api.key_created'
  | 'api.key_revoked'
  | 'affiliate.commission_approved'
  | 'system.maintenance'
  | 'system.backup'
  | 'system.error'

export type AuditSeverity = 'info' | 'warning' | 'critical'

export interface AuditEntry {
  id: string
  timestamp: string
  actorId: string
  actorRole: 'user' | 'seller' | 'admin' | 'system'
  action: AuditAction
  target: string // O que foi afetado (ex: order_123, user_456)
  targetType: 'user' | 'order' | 'product' | 'payment' | 'withdrawal' | 'settings' | 'dispute' | 'review' | 'api_key' | 'system'
  description: string
  severity: AuditSeverity
  ip: string
  userAgent: string
  metadata: Record<string, unknown>
  previousHash: string // Hash da entrada anterior (chain)
  hash: string // Hash desta entrada
}

export class AuditLogger {
  private entries: AuditEntry[] = []
  private previousHash: string = '0'.repeat(64) // Genesis hash

  /**
   * Registra evento de auditoria
   */
  log(params: {
    actorId: string
    actorRole: AuditEntry['actorRole']
    action: AuditAction
    target: string
    targetType: AuditEntry['targetType']
    description: string
    severity?: AuditSeverity
    ip?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }): AuditEntry {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${randomHex(8)}`,
      timestamp: new Date().toISOString(),
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      target: params.target,
      targetType: params.targetType,
      description: params.description,
      severity: params.severity || 'info',
      ip: params.ip || '',
      userAgent: params.userAgent || '',
      metadata: params.metadata || {},
      previousHash: this.previousHash,
      hash: '', // Será calculado abaixo
    }

    // Calcular hash com chain
    const hashInput = this.previousHash + JSON.stringify({
      ...entry,
      hash: undefined,
    })
    entry.hash = createHash('sha256').update(hashInput).digest('hex')

    this.previousHash = entry.hash
    this.entries.push(entry)

    // Em produção, salvar no Supabase tabela audit_logs
    return entry
  }

  /**
   * Busca entradas de auditoria
   */
  query(params: {
    actorId?: string
    action?: AuditAction
    target?: string
    targetType?: AuditEntry['targetType']
    severity?: AuditSeverity
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): AuditEntry[] {
    let results = [...this.entries]

    if (params.actorId) results = results.filter(e => e.actorId === params.actorId)
    if (params.action) results = results.filter(e => e.action === params.action)
    if (params.target) results = results.filter(e => e.target === params.target)
    if (params.targetType) results = results.filter(e => e.targetType === params.targetType)
    if (params.severity) results = results.filter(e => e.severity === params.severity)
    if (params.startDate) results = results.filter(e => e.timestamp >= params.startDate!)
    if (params.endDate) results = results.filter(e => e.timestamp <= params.endDate!)

    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const limit = params.limit || 50
    const offset = params.offset || 0
    return results.slice(offset, offset + limit)
  }

  /**
   * Verifica integridade da chain de auditoria
   */
  verifyIntegrity(): { valid: boolean; firstBrokenIndex?: number } {
    let previousHash = '0'.repeat(64)

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]

      if (entry.previousHash !== previousHash) {
        return { valid: false, firstBrokenIndex: i }
      }

      const hashInput = previousHash + JSON.stringify({
        ...entry,
        hash: undefined,
      })
      const expectedHash = createHash('sha256').update(hashInput).digest('hex')

      if (entry.hash !== expectedHash) {
        return { valid: false, firstBrokenIndex: i }
      }

      previousHash = entry.hash
    }

    return { valid: true }
  }

  /**
   * Conta total de entradas
   */
  getTotalCount(): number {
    return this.entries.length
  }

  /**
   * Exporta tudo (para backup/auditoria externa)
   */
  exportAll(): AuditEntry[] {
    return [...this.entries]
  }
}

function randomHex(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

// Singleton
export const auditLogger = new AuditLogger()
