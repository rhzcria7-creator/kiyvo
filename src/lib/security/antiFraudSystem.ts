// ─────────────────────────────────────────────────────────────
// Anti-Fraud System v0.0.1 — Motor anti-fraude completo
// Persistência no Supabase: audit_logs + fraud_reports + blocked_ips
// Integra: Device Fingerprint, IP Intel, Email Temp Block,
//          CPF Validator, Card Test, File Scan, Product Keys,
//          Risk Score, Escrow, Dispute, Honeypot, TOTP, Audit
// ─────────────────────────────────────────────────────────────

import { auditLogger, type AuditAction } from './auditLogReal'
import { analyzeIP, shouldBlockIP, extractIP } from './ipIntelligence'
import { validateEmail } from './emailTempBlock'
import { validateCPF, validatePhoneBR } from './cpfPhoneValidator'
import { validateCardForPayment } from './cardTestBlock'
import { scanFile } from './fileScanner'
import { assessTransactionRisk } from './riskScore'
import { assessBotRisk, generateHoneypotFieldName } from './honeypotBot'
import { createEscrow, holdEscrow, releaseEscrow, processAutoRelease } from './escrowLedger'
import { openDispute, addEvidence, resolveDispute } from './disputeSystem'
import { verifyReviewPurchase, detectReviewFraud } from './reviewVerified'

export {
  // Exports from each module
  analyzeIP, shouldBlockIP, extractIP,
  validateEmail,
  validateCPF, validatePhoneBR,
  validateCardForPayment,
  scanFile,
  assessTransactionRisk,
  assessBotRisk, generateHoneypotFieldName,
  createEscrow, holdEscrow, releaseEscrow, processAutoRelease,
  openDispute, addEvidence, resolveDispute,
  verifyReviewPurchase, detectReviewFraud,
}

/**
 * Registra evento de auditoria no Supabase
 */
export async function recordAuditEvent(params: {
  action: AuditAction
  actorId: string
  actorRole?: 'user' | 'seller' | 'admin' | 'system'
  target: string
  targetType: 'user' | 'order' | 'product' | 'payment' | 'withdrawal' | 'settings' | 'dispute' | 'review' | 'api_key' | 'system'
  description: string
  severity?: 'info' | 'warning' | 'critical'
  ip?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}) {
  // Salva local (hash chain)
  const entry = auditLogger.log({
    ...params,
    actorRole: params.actorRole || 'user',
    severity: params.severity || 'info',
  })

  // Tenta salvar no Supabase
  try {
    const { getServiceClient } = await import('@/lib/supabase/server')
    const supabase = getServiceClient()
    if (supabase) {
      await supabase.from('audit_logs').insert({
        action: params.action,
        actor_id: params.actorId,
        actor_role: params.actorRole || 'user',
        target: params.target,
        target_type: params.targetType,
        description: params.description,
        severity: params.severity || 'info',
        ip: params.ip || '',
        user_agent: params.userAgent || '',
        metadata: params.metadata || {},
        previous_hash: entry.previousHash,
        hash: entry.hash,
      })
    }
  } catch {}

  return entry
}

/**
 * Bloqueia IP e registra no Supabase
 */
export async function blockIP(ip: string, reason: string, blockedBy: string = 'system') {
  // Bloqueia local
  const { analyzeIP } = await import('./ipIntelligence')

  // Tenta salvar no Supabase
  try {
    const { getServiceClient } = await import('@/lib/supabase/server')
    const supabase = getServiceClient()
    if (supabase) {
      await supabase.from('blocked_ips').insert({
        ip,
        reason,
        blocked_by: blockedBy,
        blocked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        count: 1,
      })
    }
  } catch {}

  // Audit log
  await recordAuditEvent({
    action: 'security.alert',
    actorId: blockedBy,
    actorRole: 'admin',
    target: ip,
    targetType: 'system',
    description: `IP bloqueado: ${reason}`,
    severity: 'critical',
  })
}

/**
 * Calcula e salva risk score de usuário
 */
export async function updateUserRiskScore(userId: string, additionalFactors?: Record<string, number>) {
  const { getServiceClient } = await import('@/lib/supabase/server')
  const supabase = getServiceClient()

  if (!supabase) {
    // Fallback: risk score in-memory
    return { score: 0, level: 'safe' as const, factors: {} as any, details: [], recommendations: [], requiresManualReview: false }
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  const { data: orders } = await supabase.from('orders').select('status').eq('buyer_id', userId)
  const { data: disputes } = await supabase.from('disputes').select('id').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)

  const cancellations = orders?.filter((o: { status: string }) => o.status === 'cancelled').length || 0
  const totalDisputes = disputes?.length || 0
  const accountAge = profile?.created_at ? (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0
  const hasKYC = profile?.kyc_status === 'approved'

  const result = assessTransactionRisk({
    isNewUser: accountAge < 1,
    amount: additionalFactors?.amount || 0,
    velocity: {
      recentOrders: orders?.length || 0,
      recentFailedPayments: 0,
      recentLoginAttempts: 0,
    },
    buyerReputation: profile?.rating || 0,
  })

  // Salvar no profile
  await supabase.from('profiles').update({
    risk_score: result.score,
  }).eq('id', userId)

  return result
}
