// ─────────────────────────────────────────────────────────────
// Risk Score v0.0.1 — Score de risco 0-100 para transações
// Combina múltiplos fatores: IP, dispositivo, email, pagamento, histórico
// ─────────────────────────────────────────────────────────────

import type { IPInfo } from './ipIntelligence'
import type { DeviceFingerprintResult } from './deviceFingerprint'

export interface RiskFactors {
  ipRisk: number       // 0-30
  deviceRisk: number   // 0-20
  emailRisk: number    // 0-15
  paymentRisk: number  // 0-15
  behaviorRisk: number // 0-10
  historyRisk: number  // 0-10
}

export interface RiskAssessment {
  score: number        // 0-100 (0=seguro, 100=crítico)
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  factors: RiskFactors
  details: string[]
  recommendations: RiskRecommendation[]
  requiresManualReview: boolean
}

export type RiskRecommendation =
  | 'allow'
  | 'allow_with_captcha'
  | 'require_2fa'
  | 'require_email_verification'
  | 'require_phone_verification'
  | 'manual_review'
  | 'block'

const WEIGHTS = {
  ipRisk: 0.30,
  deviceRisk: 0.20,
  emailRisk: 0.15,
  paymentRisk: 0.15,
  behaviorRisk: 0.10,
  historyRisk: 0.10,
}

/**
 * Avalia risco completo de uma transação
 */
export function assessTransactionRisk(params: {
  ipInfo?: IPInfo
  deviceFingerprint?: DeviceFingerprintResult
  email?: string
  isNewUser?: boolean
  isNewPaymentMethod?: boolean
  amount?: number
  velocity?: {
    recentOrders: number
    recentFailedPayments: number
    recentLoginAttempts: number
  }
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'boleto'
  buyerReputation?: number
}): RiskAssessment {
  const factors: RiskFactors = {
    ipRisk: 0,
    deviceRisk: 0,
    emailRisk: 0,
    paymentRisk: 0,
    behaviorRisk: 0,
    historyRisk: 0,
  }

  const details: string[] = []
  const recommendations: Set<RiskRecommendation> = new Set()

  // 1. IP Risk (0-30)
  if (params.ipInfo) {
    const { isTor, isVPN, isProxy, isDatacenter, riskScore } = params.ipInfo
    if (isTor) {
      factors.ipRisk = 30
      details.push('IP é Tor exit node')
    } else if (isVPN && isDatacenter) {
      factors.ipRisk = 20
      details.push('IP de datacenter/VPN')
    } else if (isProxy) {
      factors.ipRisk = 15
      details.push('IP de proxy detectado')
    } else {
      factors.ipRisk = Math.min(riskScore, 30)
    }
  }

  // 2. Device Risk (0-20)
  if (params.deviceFingerprint) {
    if (params.deviceFingerprint.confidence < 0.3) {
      factors.deviceRisk = 10
      details.push('Fingerprint do dispositivo com baixa confiança')
    }
  } else {
    factors.deviceRisk = 15
    details.push('Dispositivo não identificado (possível bot)')
  }

  // 3. Email Risk (0-15)
  if (params.email) {
    if (params.isNewUser) {
      factors.emailRisk += 5
      details.push('Usuário novo')
    }
  }

  // 4. Payment Risk (0-15)
  if (params.isNewPaymentMethod) {
    factors.paymentRisk += 8
    details.push('Novo método de pagamento')
  }

  if (params.paymentMethod === 'credit_card') {
    factors.paymentRisk += 3
  }

  // 5. Behavior Risk (0-10)
  if (params.velocity) {
    if (params.velocity.recentOrders > 5) {
      factors.behaviorRisk += 4
      details.push('Muitos pedidos recentes')
    }
    if (params.velocity.recentFailedPayments > 3) {
      factors.behaviorRisk += 4
      details.push('Muitas falhas de pagamento recentes')
      recommendations.add('require_2fa')
    }
    if (params.velocity.recentLoginAttempts > 10) {
      factors.behaviorRisk += 2
      details.push('Muitas tentativas de login')
      recommendations.add('allow_with_captcha')
    }
  }

  // 6. History Risk (0-10)
  if (params.buyerReputation !== undefined) {
    if (params.buyerReputation < 50) {
      factors.historyRisk = 8
      details.push('Comprador com baixa reputação')
      recommendations.add('manual_review')
    }
  }

  // Calcular score total
  const score = Math.round(
    factors.ipRisk * WEIGHTS.ipRisk / 0.30 +
    factors.deviceRisk * WEIGHTS.deviceRisk / 0.20 +
    factors.emailRisk * WEIGHTS.emailRisk / 0.15 +
    factors.paymentRisk * WEIGHTS.paymentRisk / 0.15 +
    factors.behaviorRisk * WEIGHTS.behaviorRisk / 0.10 +
    factors.historyRisk * WEIGHTS.historyRisk / 0.10
  )

  // Determinar nível
  const level = scoreToLevel(score)

  // Recomendações automáticas
  if (score >= 70) recommendations.add('block')
  else if (score >= 50) recommendations.add('manual_review')
  else if (score >= 30) recommendations.add('require_2fa')
  else if (score >= 15) recommendations.add('allow_with_captcha')
  else recommendations.add('allow')

  return {
    score,
    level,
    factors,
    details,
    recommendations: Array.from(recommendations),
    requiresManualReview: score >= 50,
  }
}

function scoreToLevel(score: number): RiskAssessment['level'] {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  if (score >= 20) return 'low'
  return 'safe'
}
