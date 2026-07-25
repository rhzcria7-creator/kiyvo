// v0.0.1 — Reputação explicável de vendedor, sem manipulação por volume isolado.
export type SellerLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'top_rated'
export interface SellerReputationInput { completedOrders: number; fulfillmentRate: number; disputeRate: number; responseMinutes?: number; verified: boolean }
export interface SellerReputation { score: number; level: SellerLevel; color: 'red' | 'yellow' | 'green'; reasons: string[] }
export function calculateSellerReputation(input: SellerReputationInput): SellerReputation {
  const reasons: string[] = []; let score = 0
  score += Math.min(30, Math.floor(Math.max(0, input.completedOrders) / 10) * 3)
  score += Math.round(Math.min(100, Math.max(0, input.fulfillmentRate)) * 0.4)
  score -= Math.round(Math.min(100, Math.max(0, input.disputeRate)) * 0.5)
  if (input.responseMinutes !== undefined && input.responseMinutes <= 60) { score += 10; reasons.push('Resposta média abaixo de uma hora') }
  if (input.verified) { score += 10; reasons.push('Identidade verificada') }
  score = Math.max(0, Math.min(100, score))
  const level: SellerLevel = score >= 90 && input.completedOrders >= 100 ? 'top_rated' : score >= 75 ? 'diamond' : score >= 60 ? 'platinum' : score >= 45 ? 'gold' : score >= 25 ? 'silver' : 'bronze'
  const color = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red'
  if (input.disputeRate > 5) reasons.push('Taxa de disputa acima do ideal')
  return { score, level, color, reasons }
}
