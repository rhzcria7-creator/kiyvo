// ─────────────────────────────────────────────────────────────
// FeeEngine v1.0 — Motor de Taxas Configurável
// Toda taxa é configurável, nunca hardcoded no código
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

/** Tipo de produto digital — expandido para cobrir todo o marketplace */
export type ProductType =
  | 'digital_download'
  | 'software_license'
  | 'license_key'
  | 'source_code'
  | 'course'
  | 'ebook'
  | 'template'
  | 'asset_pack'
  | 'subscription'
  | 'digital_service'
  | 'api_access'
  | 'saas_access'
  | 'custom_delivery'
  | 'membership'
  | 'digital_bundle'

/** Tipo de licença disponível */
export type LicenseType = 'personal' | 'commercial' | 'extended_commercial' | 'enterprise' | 'custom'

/** Plano do vendedor — define taxas diferenciadas */
export type SellerPlan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

/** Nível do vendedor — baseado em volume e reputação */
export type SellerLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend'

/** Método de pagamento — cada um tem custo diferente */
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'crypto' | 'kd_points' | 'balance' | 'wallet'

/** Categoria de risco do produto */
export type RiskCategory = 'low' | 'medium' | 'high' | 'critical'

/** Regra individual de taxa */
export interface FeeRule {
  id: string
  name: string
  description: string
  /** Tipo da taxa: percentual ou fixo */
  type: 'percentage' | 'fixed'
  /** Valor da taxa (percentual como decimal: 0.07 = 7%) */
  value: number
  /** Valor mínimo da taxa (para percentual) */
  minValue?: number
  /** Valor máximo da taxa (para percentual) */
  maxValue?: number
  /** Condições para aplicar a regra */
  conditions?: FeeCondition[]
  /** Se a regra está ativa */
  isActive: boolean
  /** Ordem de avaliação (menor = mais prioritário) */
  priority: number
  /** Quem paga a taxa */
  payer: 'buyer' | 'seller' | 'platform'
  /** Para que a taxa é destinada */
  destination: 'platform' | 'payment_processor' | 'affiliate' | 'points' | 'insurance' | 'tax'
}

/** Condição para aplicar uma taxa */
export interface FeeCondition {
  field: 'seller_plan' | 'seller_level' | 'product_type' | 'category' | 'payment_method' | 'price_range' | 'risk_level' | 'country' | 'currency'
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
  value: string | number | string[] | number[]
}

/** Faixa de preço com taxas específicas */
export interface FeeTier {
  id: string
  minPrice: number
  maxPrice: number | null // null = sem limite
  buyerFeePercent: number
  sellerFeePercent: number
  platformCommissionPercent: number
}

/** Resultado completo do cálculo de taxas */
export interface FeeCalculation {
  /** Valor bruto do produto */
  grossAmount: number
  /** Taxa de serviço do comprador (ex: 0,7%) */
  buyerServiceFee: number
  /** Taxa de marketplace do vendedor (ex: 7%) */
  sellerMarketplaceFee: number
  /** Taxa do processador de pagamento (Stripe ~5% + R$0,50) */
  paymentProcessorFee: number
  /** Comissão do afiliado (0 se sem afiliado) */
  affiliateCommission: number
  /** Custo dos pontos de recompensa (1% convertido em KD Points) */
  rewardPointsCost: number
  /** Impostos (futuro) */
  tax: number
  /** Valor líquido que o vendedor recebe */
  netSellerAmount: number
  /** Receita bruta da plataforma (buyer fee + seller fee - points) */
  platformGrossRevenue: number
  /** Receita líquida da plataforma (após gateway) */
  platformNetRevenue: number
  /** Valor total que o comprador paga */
  totalBuyerPays: number
  /** Percentual total de taxas sobre o valor bruto */
  totalFeePercent: number
  /** Detalhamento de cada taxa aplicada */
  breakdown: FeeBreakdownItem[]
}

/** Item de detalhamento de taxa */
export interface FeeBreakdownItem {
  name: string
  description: string
  amount: number
  percent: number
  payer: 'buyer' | 'seller' | 'platform'
  destination: string
}

/** Parâmetros para cálculo de taxas */
export interface FeeCalculationParams {
  price: number
  sellerPlan: SellerPlan
  sellerLevel?: SellerLevel
  productType?: ProductType
  category?: string
  paymentMethod: PaymentMethod
  hasAffiliate?: boolean
  affiliateRate?: number
  country?: string
  currency?: string
  riskLevel?: RiskCategory
  couponDiscount?: number
}

// ─── CONFIGURAÇÃO PADRÃO DE TAXAS ───────────────────────────
// Estes são os defaults — podem ser sobrescritos pelo banco (fee_rules)

const DEFAULT_TIERS: FeeTier[] = [
  { id: 'tier_1', minPrice: 0, maxPrice: 30, buyerFeePercent: 0.007, sellerFeePercent: 0.07, platformCommissionPercent: 0.077 },
  { id: 'tier_2', minPrice: 30, maxPrice: 100, buyerFeePercent: 0.007, sellerFeePercent: 0.07, platformCommissionPercent: 0.077 },
  { id: 'tier_3', minPrice: 100, maxPrice: 500, buyerFeePercent: 0.007, sellerFeePercent: 0.06, platformCommissionPercent: 0.067 },
  { id: 'tier_4', minPrice: 500, maxPrice: 1000, buyerFeePercent: 0.005, sellerFeePercent: 0.05, platformCommissionPercent: 0.055 },
  { id: 'tier_5', minPrice: 1000, maxPrice: null, buyerFeePercent: 0.004, sellerFeePercent: 0.04, platformCommissionPercent: 0.044 },
]

/** Taxas do processador de pagamento por método */
const PAYMENT_PROCESSOR_FEES: Record<PaymentMethod, { percent: number; fixed: number }> = {
  pix: { percent: 0.0099, fixed: 0 },         // ~0,99% sem fixo
  credit_card: { percent: 0.0499, fixed: 0.50 }, // ~4,99% + R$0,50
  debit_card: { percent: 0.0299, fixed: 0.30 },  // ~2,99% + R$0,30
  boleto: { percent: 0.0199, fixed: 3.00 },      // ~1,99% + R$3,00
  crypto: { percent: 0.01, fixed: 0 },           // ~1% (estimativa)
  kd_points: { percent: 0, fixed: 0 },           // Sem taxa (interno)
  balance: { percent: 0, fixed: 0 },             // Sem taxa (interno)
  wallet: { percent: 0, fixed: 0 },              // Sem taxa (interno)
}

/** Desconto no seller fee por plano */
const PLAN_FEE_DISCOUNTS: Record<SellerPlan, number> = {
  free: 0,        // Sem desconto — taxa cheia
  starter: 0.10,  // 10% de desconto na taxa do vendedor
  pro: 0.25,      // 25% de desconto
  business: 0.40, // 40% de desconto
  enterprise: 0.50, // 50% de desconto
}

/** Desconto no seller fee por nível */
const LEVEL_FEE_DISCOUNTS: Record<SellerLevel, number> = {
  bronze: 0,
  silver: 0.05,
  gold: 0.10,
  platinum: 0.15,
  diamond: 0.20,
  master: 0.25,
  legend: 0.30,
}

/** Taxa de afiliado padrão */
const DEFAULT_AFFILIATE_RATE = 0.05 // 5%

/** Percentual de cashback em pontos (1% do valor = 1 PD Point por real) */
const POINTS_CASHBACK_RATE = 0.01 // 1%

// ─── FEE ENGINE ──────────────────────────────────────────────

/**
 * FeeEngine — Motor de Cálculo de Taxas
 * 
 * Princípios:
 * 1. NUNCA hardcoded — tudo configurável via fee_rules no banco
 * 2. Transparência total — comprador e vendedor veem cada taxa
 * 3. Nenhum cálculo gera prejuízo inesperado
 * 4. Suporte a múltiplos planos, níveis, categorias e métodos de pagamento
 */
export class FeeEngine {
  private tiers: FeeTier[]
  private customRules: FeeRule[]

  constructor(tiers?: FeeTier[], customRules?: FeeRule[]) {
    // Carrega tiers customizados ou usa defaults
    this.tiers = tiers && tiers.length > 0 ? tiers : DEFAULT_TIERS
    this.customRules = customRules || []
  }

  /**
   * Calcula todas as taxas para uma transação
   * Retorna o detalhamento completo — cada centavo é rastreável
   */
  calculate(params: FeeCalculationParams): FeeCalculation {
    const {
      price,
      sellerPlan,
      sellerLevel = 'bronze',
      paymentMethod,
      hasAffiliate = false,
      affiliateRate = DEFAULT_AFFILIATE_RATE,
      riskLevel = 'low',
      couponDiscount = 0,
    } = params

    // 1. Encontrar a faixa de preço aplicável
    const tier = this.findTier(price)

    // 2. Taxa de serviço do comprador (buyer fee — ex: 0,7%)
    const buyerServiceFee = this.roundCurrency(price * tier.buyerFeePercent)

    // 3. Taxa de marketplace do vendedor (seller fee — ex: 7%)
    let sellerFeePercent = tier.sellerFeePercent
    
    // Aplicar desconto do plano
    const planDiscount = PLAN_FEE_DISCOUNTS[sellerPlan] || 0
    sellerFeePercent *= (1 - planDiscount)
    
    // Aplicar desconto do nível
    const levelDiscount = LEVEL_FEE_DISCOUNTS[sellerLevel] || 0
    sellerFeePercent *= (1 - levelDiscount)
    
    // Ajuste por risco
    if (riskLevel === 'high') sellerFeePercent *= 1.2
    if (riskLevel === 'critical') sellerFeePercent *= 1.5

    const sellerMarketplaceFee = this.roundCurrency(price * sellerFeePercent)

    // 4. Taxa do processador de pagamento
    const processorConfig = PAYMENT_PROCESSOR_FEES[paymentMethod]
    const paymentProcessorFee = this.roundCurrency(
      price * processorConfig.percent + processorConfig.fixed
    )

    // 5. Comissão de afiliado
    const affiliateCommission = hasAffiliate
      ? this.roundCurrency(price * affiliateRate)
      : 0

    // 6. Custo de pontos de recompensa (1% do valor → cashback para comprador)
    const rewardPointsCost = this.roundCurrency(price * POINTS_CASHBACK_RATE)

    // 7. Impostos (placeholder — futuro)
    const tax = 0

    // 8. Cálculos finais
    const totalDeductions = sellerMarketplaceFee + paymentProcessorFee + affiliateCommission + rewardPointsCost + tax
    const netSellerAmount = this.roundCurrency(price - totalDeductions)
    
    // Garantir que vendedor nunca receba negativo
    const safeNetSeller = Math.max(0, netSellerAmount)

    // Receita da plataforma = buyer fee + seller fee - points cost
    const platformGrossRevenue = this.roundCurrency(buyerServiceFee + sellerMarketplaceFee - rewardPointsCost)
    
    // Receita líquida = receita bruta - custo do gateway (plataforma absorve)
    const platformNetRevenue = this.roundCurrency(platformGrossRevenue - paymentProcessorFee)

    // Total que comprador paga = preço + buyer fee
    const totalBuyerPays = this.roundCurrency(price + buyerServiceFee)

    // Percentual total
    const totalFeePercent = price > 0
      ? this.roundPercent((buyerServiceFee + sellerMarketplaceFee) / price)
      : 0

    // Breakdown detalhado
    const breakdown: FeeBreakdownItem[] = [
      {
        name: 'Taxa de Serviço do Comprador',
        description: 'Contribuição para manutenção e segurança da plataforma',
        amount: buyerServiceFee,
        percent: tier.buyerFeePercent * 100,
        payer: 'buyer',
        destination: 'platform',
      },
      {
        name: 'Taxa de Marketplace',
        description: `Taxa do vendedor (${(sellerFeePercent * 100).toFixed(1)}%)${planDiscount > 0 ? ` — ${(planDiscount * 100).toFixed(0)}% off plano ${sellerPlan}` : ''}${levelDiscount > 0 ? ` + ${(levelDiscount * 100).toFixed(0)}% off nível ${sellerLevel}` : ''}`,
        amount: sellerMarketplaceFee,
        percent: sellerFeePercent * 100,
        payer: 'seller',
        destination: 'platform',
      },
      {
        name: 'Taxa do Gateway de Pagamento',
        description: `Processamento via ${paymentMethod} (${(processorConfig.percent * 100).toFixed(2)}%${processorConfig.fixed > 0 ? ` + R$${processorConfig.fixed.toFixed(2)}` : ''})`,
        amount: paymentProcessorFee,
        percent: price > 0 ? (paymentProcessorFee / price) * 100 : 0,
        payer: 'seller',
        destination: 'payment_processor',
      },
    ]

    if (hasAffiliate) {
      breakdown.push({
        name: 'Comissão de Afiliado',
        description: `Comissão de ${(affiliateRate * 100).toFixed(1)}% para o afiliado que indicou`,
        amount: affiliateCommission,
        percent: affiliateRate * 100,
        payer: 'seller',
        destination: 'affiliate',
      })
    }

    breakdown.push({
      name: 'Cashback em KD Points',
      description: `${POINTS_CASHBACK_RATE * 100}% do valor convertido em pontos de recompensa`,
      amount: rewardPointsCost,
      percent: POINTS_CASHBACK_RATE * 100,
      payer: 'platform',
      destination: 'points',
    })

    if (tax > 0) {
      breakdown.push({
        name: 'Impostos',
        description: 'Retenção de impostos conforme regulamentação',
        amount: tax,
        percent: 0,
        payer: 'seller',
        destination: 'tax',
      })
    }

    return {
      grossAmount: price,
      buyerServiceFee,
      sellerMarketplaceFee,
      paymentProcessorFee,
      affiliateCommission,
      rewardPointsCost,
      tax,
      netSellerAmount: safeNetSeller,
      platformGrossRevenue: Math.max(0, platformGrossRevenue),
      platformNetRevenue: Math.max(0, platformNetRevenue),
      totalBuyerPays,
      totalFeePercent,
      breakdown,
    }
  }

  /**
   * Simula taxas para um preço — usado no /fees/calculator
   * Retorna cálculo para múltiplos métodos de pagamento
   */
  simulate(price: number, sellerPlan: SellerPlan = 'free'): Record<PaymentMethod, FeeCalculation> {
    const methods: PaymentMethod[] = ['pix', 'credit_card', 'debit_card', 'boleto']
    const result: Partial<Record<PaymentMethod, FeeCalculation>> = {}

    for (const method of methods) {
      result[method] = this.calculate({
        price,
        sellerPlan,
        paymentMethod: method,
      })
    }

    return result as Record<PaymentMethod, FeeCalculation>
  }

  /**
   * Calcula o preço sugerido para o vendedor receber um valor específico
   * Ex: "Quero receber R$50, qual devo cobrar?"
   */
  reverseCalculate(
    desiredNetAmount: number,
    sellerPlan: SellerPlan,
    paymentMethod: PaymentMethod,
    hasAffiliate: boolean = false
  ): { suggestedPrice: number; calculation: FeeCalculation } {
    // Estimativa inicial baseada no percentual médio de deduções
    const tier = this.findTier(desiredNetAmount)
    let sellerFeePercent = tier.sellerFeePercent * (1 - (PLAN_FEE_DISCOUNTS[sellerPlan] || 0))
    const processorConfig = PAYMENT_PROCESSOR_FEES[paymentMethod]
    const affiliatePercent = hasAffiliate ? DEFAULT_AFFILIATE_RATE : 0
    const totalDeductionPercent = sellerFeePercent + processorConfig.percent + affiliatePercent + POINTS_CASHBACK_RATE

    // Preço estimado = líquido / (1 - percentual total de deduções) + fixo do gateway
    let estimatedPrice = (desiredNetAmount + processorConfig.fixed) / (1 - totalDeductionPercent)
    
    // Refinar com cálculo real (iteração para precisão)
    let calculation = this.calculate({
      price: estimatedPrice,
      sellerPlan,
      paymentMethod,
      hasAffiliate,
    })

    // Ajustar se necessário (máximo 5 iterações para convergir)
    for (let i = 0; i < 5; i++) {
      const diff = desiredNetAmount - calculation.netSellerAmount
      if (Math.abs(diff) < 0.01) break
      estimatedPrice += diff
      calculation = this.calculate({
        price: estimatedPrice,
        sellerPlan,
        paymentMethod,
        hasAffiliate,
      })
    }

    return { suggestedPrice: this.roundCurrency(estimatedPrice), calculation }
  }

  /** Encontra a faixa de preço aplicável */
  private findTier(price: number): FeeTier {
    const tier = this.tiers.find(
      t => price >= t.minPrice && (t.maxPrice === null || price < t.maxPrice)
    )
    // Fallback para a última faixa (valores altos)
    return tier || this.tiers[this.tiers.length - 1]
  }

  /** Arredonda valor monetário para 2 casas decimais */
  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100
  }

  /** Arredonda percentual para 2 casas decimais */
  private roundPercent(value: number): number {
    return Math.round(value * 10000) / 10000
  }
}

// ─── INSTÂNCIA SINGLETON ─────────────────────────────────────
// Em produção, carregar fee_rules do banco e passar no construtor
export const feeEngine = new FeeEngine()

// ─── FUNÇÕES HELPER ──────────────────────────────────────────

/** Formata valor como moeda BRL */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Calcula KD Points ganhos em uma compra (1 point por real gasto) */
export function calculatePDPoints(price: number): number {
  return Math.floor(price) // 1 point por real
}

/** Verifica se o preço mínimo é respeitado */
export function validateMinimumPrice(price: number, productType: ProductType): { valid: boolean; minPrice: number } {
  const minimumPrices: Record<ProductType, number> = {
    digital_download: 1.00,
    software_license: 5.00,
    license_key: 5.00,
    source_code: 10.00,
    course: 5.00,
    ebook: 1.00,
    template: 1.00,
    asset_pack: 1.00,
    subscription: 5.00,
    digital_service: 10.00,
    api_access: 5.00,
    saas_access: 10.00,
    custom_delivery: 5.00,
    membership: 5.00,
    digital_bundle: 5.00,
  }
  const minPrice = minimumPrices[productType] || 1.00
  return { valid: price >= minPrice, minPrice }
}
