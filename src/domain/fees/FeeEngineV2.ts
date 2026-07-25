// ─────────────────────────────────────────────────────────────
// FeeEngineV2 v0.0.1 — Motor de Taxas Sem Teto + Zero Fee 5K+
// Marketplace-style fee engine com níveis Bronze→Legend (G2G-like)
// Zero taxa para vendas acima de R$5.000 (desconto progressivo)
// ─────────────────────────────────────────────────────────────

export type SellerLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend'

export interface FeeV2Params {
  price: number
  sellerLevel: SellerLevel
  isFirstSale?: boolean
  hasCoupon?: boolean
  isFlashSale?: boolean
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'crypto' | 'kd_points' | 'balance'
  hasAffiliate?: boolean
  affiliateRate?: number
}

export interface FeeV2Result {
  grossAmount: number
  sellerFeePercent: number
  sellerFeeAmount: number
  paymentFeePercent: number
  paymentFeeAmount: number
  affiliateCommission: number
  totalDeductions: number
  netAmount: number
  buyerServiceFee: number
  totalBuyerPays: number
  levelDiscount: number
  volumeDiscount: number
  breakdown: FeeV2Item[]
  level: SellerLevel
  nextLevel: SellerLevel | null
  progressToNextLevel: number // 0-100
}

export interface FeeV2Item {
  name: string
  amount: number
  percent: number
  type: 'fee' | 'discount' | 'tax' | 'commission'
}

// Seller level thresholds (total sales volume)
const LEVEL_THRESHOLDS: Record<SellerLevel, number> = {
  bronze: 0,
  silver: 1000,    // R$ 1k
  gold: 5000,       // R$ 5k
  platinum: 25000,  // R$ 25k
  diamond: 100000,  // R$ 100k
  master: 500000,   // R$ 500k
  legend: 2000000,  // R$ 2M
}

// Base seller fee by level (G2G-like: starts at 7%, goes down to 1%)
const LEVEL_FEES: Record<SellerLevel, number> = {
  bronze: 0.07,    // 7%
  silver: 0.065,   // 6.5%
  gold: 0.06,      // 6%
  platinum: 0.05,  // 5%
  diamond: 0.04,   // 4%
  master: 0.025,   // 2.5%
  legend: 0.01,    // 1%
}

// Zero fee threshold: vendas acima de R$5k têm taxa zero
const ZERO_FEE_THRESHOLD = 5000

// Payment processing fees
const PAYMENT_FEES: Record<string, { percent: number; fixed: number }> = {
  pix: { percent: 0.0099, fixed: 0 },
  credit_card: { percent: 0.0499, fixed: 0.50 },
  debit_card: { percent: 0.0299, fixed: 0.30 },
  boleto: { percent: 0.0199, fixed: 3.00 },
  crypto: { percent: 0.01, fixed: 0 },
  kd_points: { percent: 0, fixed: 0 },
  balance: { percent: 0, fixed: 0 },
}

const BUYER_SERVICE_FEE_PERCENT = 0.007 // 0.7%
const FIRST_SALE_DISCOUNT = 0.5 // 50% off na taxa na primeira venda
const VOLUME_DISCOUNT_THRESHOLD = 1000 // R$ 1k no mês
const VOLUME_DISCOUNT_PERCENT = 0.1 // 10% off adicional

export class FeeEngineV2 {
  /**
   * Calcula taxas completas para uma transação
   */
  calculate(params: FeeV2Params): FeeV2Result {
    const { price, sellerLevel, isFirstSale, hasAffiliate, affiliateRate, paymentMethod } = params
    const breakdown: FeeV2Item[] = []

    // 1. Seller fee base por nível
    let sellerFeePercent = LEVEL_FEES[sellerLevel]
    let levelDiscount = 0

    // Zero fee para vendas >= R$5k
    if (price >= ZERO_FEE_THRESHOLD) {
      sellerFeePercent = 0
      levelDiscount = LEVEL_FEES[sellerLevel]
      breakdown.push({
        name: 'Taxa Zero (Venda ≥ R$ 5.000)',
        amount: 0,
        percent: 0,
        type: 'discount',
      })
    } else {
      // Desconto por nível
      const baseFee = LEVEL_FEES.bronze
      levelDiscount = baseFee - sellerFeePercent
      
      breakdown.push({
        name: `Taxa de Marketplace (Nível ${sellerLevel})`,
        amount: 0,
        percent: sellerFeePercent * 100,
        type: 'fee',
      })
    }

    // First sale discount
    let firstSaleDiscountAmount = 0
    if (isFirstSale) {
      firstSaleDiscountAmount = price * sellerFeePercent * FIRST_SALE_DISCOUNT
      sellerFeePercent *= (1 - FIRST_SALE_DISCOUNT)
      breakdown.push({
        name: 'Desconto Primeira Venda',
        amount: firstSaleDiscountAmount,
        percent: FIRST_SALE_DISCOUNT * 100,
        type: 'discount',
      })
    }

    // Volume discount (monthly)
    let volumeDiscount = 0
    if (price >= VOLUME_DISCOUNT_THRESHOLD) {
      volumeDiscount = price * sellerFeePercent * VOLUME_DISCOUNT_PERCENT
      sellerFeePercent *= (1 - VOLUME_DISCOUNT_PERCENT)
      breakdown.push({
        name: 'Desconto por Volume',
        amount: volumeDiscount,
        percent: VOLUME_DISCOUNT_PERCENT * 100,
        type: 'discount',
      })
    }

    const sellerFeeAmount = roundCurrency(price * sellerFeePercent)

    // 2. Payment processing fee
    const paymentFee = PAYMENT_FEES[paymentMethod] || PAYMENT_FEES.credit_card
    const paymentFeeAmount = roundCurrency(price * paymentFee.percent + paymentFee.fixed)
    
    breakdown.push({
      name: `Taxa de Pagamento (${paymentMethod})`,
      amount: paymentFeeAmount,
      percent: paymentFee.percent * 100,
      type: 'fee',
    })

    // 3. Affiliate commission
    const affiliateCommission = hasAffiliate
      ? roundCurrency(price * (affiliateRate || 0.05))
      : 0

    if (affiliateCommission > 0) {
      breakdown.push({
        name: 'Comissão de Afiliado',
        amount: affiliateCommission,
        percent: (affiliateRate || 0.05) * 100,
        type: 'commission',
      })
    }

    // 4. Buyer service fee
    const buyerServiceFee = roundCurrency(price * BUYER_SERVICE_FEE_PERCENT)
    
    // 5. Totals
    const totalDeductions = roundCurrency(sellerFeeAmount + paymentFeeAmount + affiliateCommission)
    const netAmount = roundCurrency(Math.max(0, price - totalDeductions))
    const totalBuyerPays = roundCurrency(price + buyerServiceFee)

    // 6. Level progress
    const nextLevel = getNextLevel(sellerLevel)
    const progressToNextLevel = nextLevel
      ? calculateLevelProgress(params.price || 0, sellerLevel)
      : 100

    return {
      grossAmount: price,
      sellerFeePercent: roundPercent(sellerFeePercent),
      sellerFeeAmount,
      paymentFeePercent: paymentFee.percent,
      paymentFeeAmount,
      affiliateCommission,
      totalDeductions,
      netAmount,
      buyerServiceFee,
      totalBuyerPays,
      levelDiscount: roundCurrency(levelDiscount * price),
      volumeDiscount: volumeDiscount > 0 ? volumeDiscount : roundCurrency(volumeDiscount),
      breakdown,
      level: sellerLevel,
      nextLevel,
      progressToNextLevel,
    }
  }

  /**
   * Simula taxas para todos os métodos de pagamento
   */
  simulate(price: number, sellerLevel: SellerLevel = 'bronze'): Record<string, FeeV2Result> {
    const methods = ['pix', 'credit_card', 'debit_card', 'boleto']
    const results: Record<string, FeeV2Result> = {}
    for (const method of methods) {
      results[method] = this.calculate({
        price,
        sellerLevel,
        paymentMethod: method as FeeV2Params['paymentMethod'],
      })
    }
    return results
  }

  /**
   * Calcula preço sugerido para receber valor líquido desejado
   */
  reverseCalculate(
    desiredNet: number,
    sellerLevel: SellerLevel = 'bronze',
    paymentMethod: FeeV2Params['paymentMethod'] = 'pix'
  ): { suggestedPrice: number; result: FeeV2Result } {
    let estimatedPrice = desiredNet * 1.1
    let result = this.calculate({ price: estimatedPrice, sellerLevel, paymentMethod })

    for (let i = 0; i < 10; i++) {
      const diff = desiredNet - result.netAmount
      if (Math.abs(diff) < 0.01) break
      estimatedPrice += diff
      result = this.calculate({ price: Math.max(0.01, estimatedPrice), sellerLevel, paymentMethod })
    }

    return { suggestedPrice: roundCurrency(estimatedPrice), result }
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function roundPercent(value: number): number {
  return Math.round(value * 10000) / 10000
}

function getNextLevel(current: SellerLevel): SellerLevel | null {
  const levels: SellerLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'legend']
  const index = levels.indexOf(current)
  return index < levels.length - 1 ? levels[index + 1] : null
}

function calculateLevelProgress(totalSales: number, currentLevel: SellerLevel): number {
  const levels: SellerLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'legend']
  const index = levels.indexOf(currentLevel)
  
  if (index >= levels.length - 1) return 100

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel]
  const nextThreshold = LEVEL_THRESHOLDS[levels[index + 1]]
  const range = nextThreshold - currentThreshold
  const progress = totalSales - currentThreshold

  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)))
}

// Singleton
export const feeEngineV2 = new FeeEngineV2()
