// ─────────────────────────────────────────────────────────────
// Membership Engine v0.0.1 — Sistema de assinatura comunidade
// Planos, benefícios, conteúdo exclusivo, gamificação
// ─────────────────────────────────────────────────────────────

export type MembershipTier = 'free' | 'basic' | 'pro' | 'vip' | 'lifetime'
export type MembershipStatus = 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing'

export interface MembershipPlan {
  id: MembershipTier
  name: string
  priceMonthly: number
  priceYearly: number
  features: string[]
  badge: string
  color: string
  priority: number
  maxProducts: number
  commissionDiscount: number
  kdMultiplier: number
  boostHoursFree: number
}

export interface Membership {
  id: string
  userId: string
  tier: MembershipTier
  status: MembershipStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  stripeSubscriptionId: string | null
  cancelledAt: string | null
  trialEndsAt: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

const PLANS: Record<MembershipTier, MembershipPlan> = {
  free: {
    id: 'free', name: 'Gratuito', priceMonthly: 0, priceYearly: 0,
    features: ['Até 5 produtos', 'Taxa padrão 7%', 'Suporte email', 'KD Points 1x'],
    badge: '🔰', color: 'text-zinc-500', priority: 0,
    maxProducts: 5, commissionDiscount: 0, kdMultiplier: 1, boostHoursFree: 0,
  },
  basic: {
    id: 'basic', name: 'Basic', priceMonthly: 19.90, priceYearly: 199.90,
    features: ['Até 20 produtos', 'Taxa 6% (-14%)', 'Suporte chat', 'KD Points 2x', '5h boost/mês'],
    badge: '🥉', color: 'text-amber-600', priority: 1,
    maxProducts: 20, commissionDiscount: 0.14, kdMultiplier: 2, boostHoursFree: 5,
  },
  pro: {
    id: 'pro', name: 'Pro', priceMonthly: 49.90, priceYearly: 499.90,
    features: ['Produtos ilimitados', 'Taxa 4% (-43%)', 'Suporte prioritário', 'KD Points 3x', '20h boost/mês', 'Badge Verificado'],
    badge: '🥈', color: 'text-slate-400', priority: 2,
    maxProducts: 999, commissionDiscount: 0.43, kdMultiplier: 3, boostHoursFree: 20,
  },
  vip: {
    id: 'vip', name: 'VIP', priceMonthly: 149.90, priceYearly: 1499.90,
    features: ['Tudo do Pro', 'Taxa 2% (-71%)', 'Suporte VIP 24h', 'KD Points 5x', '100h boost/mês', 'Gerente de conta', 'Badge VIP dourado', 'Saque prioritário'],
    badge: '🥇', color: 'text-yellow-500', priority: 3,
    maxProducts: 9999, commissionDiscount: 0.71, kdMultiplier: 5, boostHoursFree: 100,
  },
  lifetime: {
    id: 'lifetime', name: 'Lifetime', priceMonthly: 0, priceYearly: 2999.90,
    features: ['Todos benefícios VIP', 'Taxa 1% (-86%)', 'KD Points 10x', 'Boost ilimitado', 'Badge Lendário', 'Acesso vitalício', '0% taxas em saques', 'Nome no Hall da Fama'],
    badge: '👑', color: 'text-amber-400', priority: 4,
    maxProducts: 99999, commissionDiscount: 0.86, kdMultiplier: 10, boostHoursFree: 9999,
  },
}

export class MembershipEngine {
  getPlan(tier: MembershipTier): MembershipPlan { return PLANS[tier] }
  getAllPlans(): MembershipPlan[] { return Object.values(PLANS).sort((a, b) => a.priority - b.priority) }

  getActivePlans(): MembershipPlan[] {
    return this.getAllPlans().filter(p => p.id !== 'free')
  }

  calculateYearlySavings(tier: MembershipTier): { monthly: number; yearly: number; savingPercent: number } {
    const plan = PLANS[tier]
    const monthly12 = plan.priceMonthly * 12
    const saving = monthly12 - plan.priceYearly
    const savingPercent = monthly12 > 0 ? Math.round((saving / monthly12) * 100) : 0
    return { monthly: plan.priceMonthly, yearly: plan.priceYearly, savingPercent }
  }

  canAddProduct(membership: Membership, currentProductCount: number): boolean {
    if (membership.status !== 'active' && membership.status !== 'trialing') return false
    const plan = PLANS[membership.tier]
    return currentProductCount < plan.maxProducts
  }

  calculateFee(plan: MembershipTier, baseFeePercent: number): number {
    const discount = PLANS[plan].commissionDiscount
    return Math.round(baseFeePercent * (1 - discount) * 10000) / 10000
  }

  getBadgeForTier(tier: MembershipTier): string {
    return PLANS[tier]?.badge || '🔰'
  }
}

export const membershipEngine = new MembershipEngine()
