// v0.0.1 — Agregador server-side de risco para ações financeiras.
import { z } from 'zod'
import { clientAntiFraudCheck } from './clientAntiFraud'
import { getIpRisk } from './ipIntelligence'
import { riskScoreSkill } from '@/skills/riskScore.skill'

export const antiFraudInputSchema = z.object({ email: z.string().email(), cpf: z.string().min(11).max(18), cardNumber: z.string().min(13).max(25).optional(), accountAgeDays: z.number().nonnegative(), disputeCount: z.number().int().nonnegative(), failedPayments: z.number().int().nonnegative(), isNewDevice: z.boolean(), ip: z.string().min(3).max(64) })
export type ServerAntiFraudInput = z.infer<typeof antiFraudInputSchema>
export interface ServerAntiFraudResult { blocked: boolean; score: number; reasons: string[]; requiresStepUp: boolean }

export async function evaluateServerAntiFraud(raw: unknown): Promise<ServerAntiFraudResult> {
  const input = antiFraudInputSchema.parse(raw)
  const local = clientAntiFraudCheck({ email: input.email, cpf: input.cpf, cardNumber: input.cardNumber })
  if (local.blocked) return { blocked: true, score: local.riskScore, reasons: local.warnings, requiresStepUp: false }
  const ipRisk = await getIpRisk(input.ip)
  const risk = await riskScoreSkill.run({ accountAgeDays: input.accountAgeDays, disputeCount: input.disputeCount, isNewDevice: input.isNewDevice, failedPayments: input.failedPayments, ipRisk: ipRisk.riskScore })
  const reasons = [...local.warnings, ...risk.reasons]
  if (ipRisk.isProxy || ipRisk.isVpn || ipRisk.isTor) reasons.push('Rede de anonimização ou proxy detectada')
  return { blocked: risk.level === 'blocked', score: risk.score, reasons, requiresStepUp: risk.level === 'high' || risk.level === 'medium' }
}
