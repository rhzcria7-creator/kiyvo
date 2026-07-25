// ─────────────────────────────────────────────────────────────
// Blacklist Engine v0.0.1 — Blacklist de usuários, IPs, emails
// Bloqueio automático baseado em regras + manual admin
// ─────────────────────────────────────────────────────────────

export type BlacklistTarget = 'user_id' | 'ip' | 'email' | 'device_fingerprint' | 'cpf' | 'card_bin'
export type BlacklistReason =
  | 'chargeback' | 'fraud' | 'spam' | 'abuse' | 'scam'
  | 'tos_violation' | 'chargeback_fraud' | 'multi_account'
  | 'suspicious_activity' | 'manual_ban'

export interface BlacklistEntry {
  id: string
  target: BlacklistTarget
  value: string
  reason: BlacklistReason
  description: string
  evidenceUrls: string[]
  blockedById: string
  blockedAt: string
  expiresAt: string | null  // null = permanente
  isActive: boolean
  unblockedAt: string | null
  unblockReason: string | null
}

export interface BlacklistRule {
  id: string
  name: string
  description: string
  condition: {
    field: string
    operator: 'eq' | 'contains' | 'regex' | 'gt' | 'lt'
    value: string | number
  }
  action: 'block' | 'flag' | 'review'
  durationHours: number
  isActive: boolean
}

const AUTOMATIC_RULES: BlacklistRule[] = [
  {
    id: 'rule_chargeback_3',
    name: '3+ Chargebacks',
    description: 'Bloqueia após 3 chargebacks em 30 dias',
    condition: { field: 'chargeback_count', operator: 'gt', value: 3 },
    action: 'block',
    durationHours: 720, // 30 dias
    isActive: true,
  },
  {
    id: 'rule_dispute_5',
    name: '5+ Disputas',
    description: 'Bloqueia após 5 disputas abertas',
    condition: { field: 'dispute_count', operator: 'gt', value: 5 },
    action: 'block',
    durationHours: 168, // 7 dias
    isActive: true,
  },
  {
    id: 'rule_multi_account',
    name: 'Múltiplas contas mesmo IP',
    description: '3+ contas no mesmo IP em 1 hora',
    condition: { field: 'accounts_per_ip', operator: 'gt', value: 3 },
    action: 'flag',
    durationHours: 24,
    isActive: true,
  },
  {
    id: 'rule_device_switching',
    name: 'Troca de dispositivo suspeita',
    description: '+5 fingerprints diferentes em 1 hora',
    condition: { field: 'device_switches', operator: 'gt', value: 5 },
    action: 'review',
    durationHours: 0,
    isActive: true,
  },
  {
    id: 'rule_new_account_high_value',
    name: 'Conta nova compra alto valor',
    description: 'Conta < 24h tentando comprar > R$ 500',
    condition: { field: 'account_age_hours', operator: 'lt', value: 24 },
    action: 'review',
    durationHours: 0,
    isActive: true,
  },
]

export class BlacklistEngine {
  /**
   * Cria entrada na blacklist
   */
  block(params: {
    target: BlacklistTarget
    value: string
    reason: BlacklistReason
    description?: string
    blockedById: string
    evidenceUrls?: string[]
    expiresInHours?: number
  }): BlacklistEntry {
    return {
      id: `bl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      target: params.target,
      value: params.value,
      reason: params.reason,
      description: params.description || `Bloqueado por ${params.reason}`,
      evidenceUrls: params.evidenceUrls || [],
      blockedById: params.blockedById,
      blockedAt: new Date().toISOString(),
      expiresAt: params.expiresInHours
        ? new Date(Date.now() + params.expiresInHours * 60 * 60 * 1000).toISOString()
        : null,
      isActive: true,
      unblockedAt: null,
      unblockReason: null,
    }
  }

  /**
   * Desbloqueia entrada
   */
  unblock(entry: BlacklistEntry, reason: string, adminId: string): BlacklistEntry {
    return {
      ...entry,
      isActive: false,
      unblockedAt: new Date().toISOString(),
      unblockReason: reason,
    }
  }

  /**
   * Verifica se algo está na blacklist
   */
  isBlocked(value: string, entries: BlacklistEntry[]): { blocked: boolean; entry?: BlacklistEntry } {
    const now = new Date()
    for (const entry of entries) {
      if (!entry.isActive) continue
      if (entry.value !== value) continue
      if (entry.expiresAt && new Date(entry.expiresAt) < now) {
        entry.isActive = false
        continue
      }
      return { blocked: true, entry }
    }
    return { blocked: false }
  }

  /**
   * Avalia regras automáticas e retorna ações
   */
  evaluateRules(context: Record<string, number | string>): Array<{
    rule: BlacklistRule
    triggered: boolean
    value: string | number
  }> {
    const results: Array<{ rule: BlacklistRule; triggered: boolean; value: string | number }> = []

    for (const rule of AUTOMATIC_RULES) {
      if (!rule.isActive) continue

      const contextValue = context[rule.condition.field]
      if (contextValue === undefined) continue

      let triggered = false
      switch (rule.condition.operator) {
        case 'eq':
          triggered = contextValue === rule.condition.value
          break
        case 'gt':
          triggered = Number(contextValue) > Number(rule.condition.value)
          break
        case 'lt':
          triggered = Number(contextValue) < Number(rule.condition.value)
          break
        case 'contains':
          triggered = String(contextValue).includes(String(rule.condition.value))
          break
      }

      results.push({ rule, triggered, value: contextValue })
    }

    return results
  }

  /**
   * Retorna regras automáticas
   */
  getAutomaticRules(): BlacklistRule[] {
    return AUTOMATIC_RULES
  }
}

export const blacklistEngine = new BlacklistEngine()
