// ─────────────────────────────────────────────────────────────
// KIYVO — Constantes do programa de afiliados/referral
//
// Como funciona (crescimento com margem preservada):
//  • Indicador:  8% de comissão em KD Points sobre cada compra do indicado
//                (nos primeiros 90 dias) + R$ 5 de bônus quando o indicado
//                fizer a PRIMEIRA compra ≥ R$ 20.
//  • Indicado:   5% de desconto na PRIMEIRA compra (cupom automático, aplicado no carrinho).
//
// Os 5% de desconto do indicado são pagos pelo MESMO fundo de comissão do afiliado,
// então a plataforma nunca perde margem — distribui apenas uma fatia do valor da transação.
// Taxa base do vendedor continua em 9-15% (que é o nosso lucro real).
// ─────────────────────────────────────────────────────────────

export const AFFILIATE = {
  // Comissão do indicador (em % do valor da compra do indicado, vira KD Points)
  referrerCommissionPct: 8,
  // Desconto do indicado na primeira compra
  refereeFirstBuyDiscountPct: 5,
  // Bônus em KD Points quando o indicado completa a primeira compra ≥ minFirstBuyBRL
  referrerFirstBuyBonusKD: 500, // = R$ 5,00
  minFirstBuyBRL: 20,
  // Duração do cookie de referência
  cookieDurationDays: 90,
  // Dias que o vínculo fica ativo
  attributionWindowDays: 90,
  // Saque mínimo em KD Points
  minWithdrawKD: 5000, // R$ 50,00
} as const

// Nome do cookie que guarda o código de referência
export const REFERRAL_COOKIE = 'kiyvo_ref'
export const REFERRAL_QUERY_PARAM = 'ref'

// Tipos
export interface ReferralState {
  code: string
  referrerName?: string
  discountPct: number
}
