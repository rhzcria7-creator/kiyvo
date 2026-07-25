// v0.0.1 — Skill determinística de score explicável para decisões de risco.
import { z } from 'zod'
import type { Skill } from './contracts'

const inputSchema = z.object({ accountAgeDays: z.number().nonnegative(), disputeCount: z.number().int().nonnegative(), isNewDevice: z.boolean(), ipRisk: z.number().min(0).max(100), failedPayments: z.number().int().nonnegative() })
type Input = z.infer<typeof inputSchema>
export interface RiskScoreResult { score: number; level: 'low' | 'medium' | 'high' | 'blocked'; reasons: string[] }

export const riskScoreSkill: Skill<Input, RiskScoreResult> = {
  name: 'risk-score', description: 'Produz score explicável sem tomar decisão irreversível sozinho.', inputSchema,
  run: (input) => {
    const reasons: string[] = []
    let score = Math.round(input.ipRisk * 0.45)
    if (input.accountAgeDays < 2) { score += 18; reasons.push('Conta criada há menos de dois dias') }
    if (input.isNewDevice) { score += 12; reasons.push('Novo dispositivo') }
    if (input.disputeCount > 0) { score += Math.min(20, input.disputeCount * 8); reasons.push('Histórico de disputa') }
    if (input.failedPayments > 0) { score += Math.min(25, input.failedPayments * 5); reasons.push('Falhas recentes de pagamento') }
    score = Math.min(100, score)
    const level: RiskScoreResult['level'] = score >= 85 ? 'blocked' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
    return { score, level, reasons }
  },
}
