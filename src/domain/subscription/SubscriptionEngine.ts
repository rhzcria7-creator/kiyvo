// ─────────────────────────────────────────────────────────────
// Subscription Engine v0.0.1 — Planos recorrentes via Stripe
// Basic, Pro, Plus, Enterprise com benefícios por nível
// ─────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'basic' | 'pro' | 'plus' | 'enterprise'
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing'

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan
  name: string
  price: number
  stripePriceId: string
  features: string[]
  sellerFeeDiscount: number // percentual de desconto na taxa
  kdPointsMultiplier: number // multiplicador de KD Points
  boostFreeHours: number // horas de boost grátis por mês
  priority: number
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripeSubscriptionId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt: string | null
  trialEnd: string | null
  metadata: Record<string, unknown>
}

const PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 0,
    stripePriceId: '',
    features: ['Taxa de marketplace padrão', 'KD Points 1x', 'Suporte email'],
    sellerFeeDiscount: 0,
    kdPointsMultiplier: 1,
    boostFreeHours: 0,
    priority: 1,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29.90,
    stripePriceId: 'price_pro_monthly',
    features: ['10% desconto na taxa', 'KD Points 2x', 'Suporte prioritário', '10h boost grátis/mês', 'Saque PIX 1 dia'],
    sellerFeeDiscount: 0.10,
    kdPointsMultiplier: 2,
    boostFreeHours: 10,
    priority: 2,
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 79.90,
    stripePriceId: 'price_plus_monthly',
    features: ['25% desconto na taxa', 'KD Points 3x', 'Suporte VIP 24h', '50h boost grátis/mês', 'Saque PIX instantâneo', 'Badge exclusivo'],
    sellerFeeDiscount: 0.25,
    kdPointsMultiplier: 3,
    boostFreeHours: 50,
    priority: 3,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299.90,
    stripePriceId: 'price_enterprise_monthly',
    features: ['50% desconto na taxa', 'KD Points 5x', 'Gerente de conta dedicado', '200h boost grátis/mês', 'Saque PIX instantâneo', 'Badge verificado', 'API Whitelabel', 'Onboarding personalizado'],
    sellerFeeDiscount: 0.50,
    kdPointsMultiplier: 5,
    boostFreeHours: 200,
    priority: 4,
  },
}

export class SubscriptionEngine {
  /**
   * Retorna configuração do plano
   */
  getPlan(plan: SubscriptionPlan): SubscriptionPlanConfig {
    return PLANS[plan]
  }

  /**
   * Retorna todos os planos
   */
  getAllPlans(): SubscriptionPlanConfig[] {
    return Object.values(PLANS).sort((a, b) => a.priority - b.priority)
  }

  /**
   * Calcula desconto na taxa baseado no plano
   */
  calculateFeeDiscount(plan: SubscriptionPlan, baseFee: number): { discountPercent: number; discountAmount: number; finalFee: number } {
    const config = PLANS[plan]
    const discountPercent = config.sellerFeeDiscount
    const discountAmount = Math.round(baseFee * discountPercent * 100) / 100
    const finalFee = Math.round((baseFee - discountAmount) * 100) / 100
    return { discountPercent, discountAmount, finalFee }
  }

  /**
   * Calcula multiplicador de KD Points
   */
  calculateKdMultiplier(plan: SubscriptionPlan): number {
    return PLANS[plan].kdPointsMultiplier
  }

  /**
   * Verifica se assinatura está ativa
   */
  isActive(status: SubscriptionStatus): boolean {
    return status === 'active' || status === 'trialing'
  }

  /**
   * Calcula dias restantes do período
   */
  daysRemaining(subscription: Subscription): number {
    const end = new Date(subscription.currentPeriodEnd)
    const now = new Date()
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  /**
   * Gera metadata para Stripe checkout
   */
  generateCheckoutMetadata(userId: string, plan: SubscriptionPlan): Record<string, string> {
    return {
      userId,
      plan,
      source: 'kiyvo_web',
    }
  }
}

export const subscriptionEngine = new SubscriptionEngine()
