// Planos & limites do ecossistema KIYVO Agents
import type { PlanDef, PlanLimits, UsageCounters } from './types'

export const AGENT_LIMITS = {
  adoptimizer: { free: 1, plus: 8, pro: 30, vendor_pro: 100, staff: 9999 },
  replymaster: { free: 3, plus: 20, pro: 80, vendor_pro: 300, staff: 9999 },
} as const

export const PLANS: Record<string, PlanDef> = {
  free: {
    id: 'free',
    nome: 'Grátis',
    preco: 0,
    cor: '#64748B',
    limites: {
      bannersPorDia: 2,
      copiesPorDia: 3,
      pricingPorDia: 2,
      hunterPorDia: 1,
      freelanceJobsAbertos: 1,
      freelanceBidsPorDia: 5,
      suportePrioritario: false,
      autoPublicarHunter: false,
    },
    beneficios: [
      '2 banners por dia',
      '3 copies por dia',
      '1 caça-produto por dia',
      '1 job de freela aberto',
      'Suporte comunitário',
    ],
  },
  plus: {
    id: 'plus',
    nome: 'Plus',
    preco: 19.9,
    cor: '#2563EB',
    limites: {
      bannersPorDia: 15,
      copiesPorDia: 25,
      pricingPorDia: 15,
      hunterPorDia: 8,
      freelanceJobsAbertos: 3,
      freelanceBidsPorDia: 20,
      suportePrioritario: false,
      autoPublicarHunter: false,
    },
    beneficios: [
      '15 banners/dia',
      '25 copies/dia',
      '8 caça-produtos/dia',
      '3 jobs abertos',
      '5% OFF em taxas de venda',
      'KD Points em dobro',
    ],
  },
  pro: {
    id: 'pro',
    nome: 'Pro',
    preco: 49.9,
    cor: '#8B5CF6',
    limites: {
      bannersPorDia: 60,
      copiesPorDia: 120,
      pricingPorDia: 60,
      hunterPorDia: 30,
      freelanceJobsAbertos: 10,
      freelanceBidsPorDia: 80,
      suportePrioritario: true,
      autoPublicarHunter: true,
    },
    beneficios: [
      '60 banners/dia',
      '120 copies/dia',
      '30 caça-produtos/dia (auto-publicação)',
      '10 jobs abertos',
      'Suporte prioritário',
      '15% OFF em taxas',
      'Acesso a afiliados premium',
      'Selo Pro no perfil',
    ],
  },
  vendor_pro: {
    id: 'vendor_pro',
    nome: 'Vendor Pro',
    preco: 99.9,
    cor: '#F59E0B',
    limites: {
      bannersPorDia: 200,
      copiesPorDia: 500,
      pricingPorDia: 200,
      hunterPorDia: 100,
      freelanceJobsAbertos: 50,
      freelanceBidsPorDia: 999,
      suportePrioritario: true,
      autoPublicarHunter: true,
    },
    beneficios: [
      'Banners ilimitados* (200/dia)',
      'Copywriting ilimitado*',
      'Hunter com publicação automática na Loja Oficial',
      '50 jobs abertos',
      'Suporte VIP 1h',
      'Taxa ZERO nos primeiros R$ 5k',
      'Boost grátis semanal',
      'Gerente de conta dedicado',
    ],
  },
  staff: {
    id: 'staff',
    nome: 'Equipe KIYVO',
    preco: 0,
    cor: '#EF4444',
    limites: {
      bannersPorDia: 99999,
      copiesPorDia: 99999,
      pricingPorDia: 99999,
      hunterPorDia: 99999,
      freelanceJobsAbertos: 99999,
      freelanceBidsPorDia: 99999,
      suportePrioritario: true,
      autoPublicarHunter: true,
    },
    beneficios: ['Acesso ilimitado — Equipe KIYVO'],
  },
}

// Suporte é sempre ilimitado para qualquer usuário (funciona no plano free)
export const SUPPORT_AGENT_UNLIMITED = true

export function getPlanForUser(user?: { plano?: keyof typeof PLANS; role?: string }): PlanDef {
  if (!user) return PLANS.free
  if (['admin', 'ceo', 'cto', 'coo', 'founder', 'moderator', 'support'].includes(user.role || '')) {
    return PLANS.staff
  }
  const planoKey = user.plano || 'free'
  return PLANS[planoKey] || PLANS.free
}

export function createEmptyUsage(): UsageCounters {
  return {
    bannersHoje: 0,
    copiesHoje: 0,
    pricingHoje: 0,
    hunterHoje: 0,
    bidsHoje: 0,
    jobsAbertos: 0,
    resetAt: todayKey(),
  }
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function resetIfNeeded(u: UsageCounters): UsageCounters {
  if (u.resetAt !== todayKey()) {
    return createEmptyUsage()
  }
  return u
}

export type LimitKey =
  | 'bannersPorDia'
  | 'copiesPorDia'
  | 'pricingPorDia'
  | 'hunterPorDia'
  | 'freelanceJobsAbertos'
  | 'freelanceBidsPorDia'

export function canUse(
  plan: PlanDef,
  usage: UsageCounters,
  key: LimitKey,
  extra: Partial<UsageCounters> = {}
): boolean {
  if (plan.id === 'staff') return true
  const limit = plan.limites[key]
  const fieldMap: Record<LimitKey, keyof UsageCounters> = {
    bannersPorDia: 'bannersHoje',
    copiesPorDia: 'copiesHoje',
    pricingPorDia: 'pricingHoje',
    hunterPorDia: 'hunterHoje',
    freelanceJobsAbertos: 'jobsAbertos',
    freelanceBidsPorDia: 'bidsHoje',
  }
  const current = Number(usage[fieldMap[key]] || 0) + Number(extra[fieldMap[key]] || 0)
  return current < limit
}

export function incrementUsage(usage: UsageCounters, key: LimitKey): UsageCounters {
  const fieldMap: Record<LimitKey, keyof UsageCounters> = {
    bannersPorDia: 'bannersHoje',
    copiesPorDia: 'copiesHoje',
    pricingPorDia: 'pricingHoje',
    hunterPorDia: 'hunterHoje',
    freelanceJobsAbertos: 'jobsAbertos',
    freelanceBidsPorDia: 'bidsHoje',
  }
  return { ...usage, [fieldMap[key]]: Number(usage[fieldMap[key]] || 0) + 1 }
}
