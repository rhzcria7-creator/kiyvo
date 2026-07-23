// ─────────────────────────────────────────────────────────────
// KIYVO — Atribuição automática de badges
//
// Separa a lógica de:
//   1. Reconhecer contas de EQUIPE (por e-mail) → badge de staff
//   2. Conceder badges de COMPRADOR baseado em atividade
//   3. Conceder badges de VENDEDOR baseado em vendas/rating
//
// Tudo é idempotente e deve ser chamado ao login (sync de badges).
// ─────────────────────────────────────────────────────────────

import { getTeamMember, BADGES, getBadgeById } from '../badges'
import type { BadgeDef } from '../badges'

export interface UserStats {
  email: string
  totalPurchases?: number
  totalSpent?: number
  totalSales?: number
  sellerRating?: number
  disputesLost?: number
  kycApproved?: boolean
  phoneVerified?: boolean
  emailVerified?: boolean
  createdAt?: string
  sellerPlan?: 'silver' | 'gold' | 'diamond' | 'free' | 'basico' | 'pro' | 'plus' | string
  referralCount?: number
  reviewCount?: number
  activeStreakDays?: number
}

/**
 * Calcula o conjunto de badges que o usuário DEVE ter com base em stats.
 * Aditivo: não apaga badges manuais (ex: early_supporter).
 */
export function computeBadges(stats: UserStats, existingBadges: string[] = []): string[] {
  const badges = new Set(existingBadges)

  // ── 1. Staff por e-mail ────────────────────────────────
  const team = getTeamMember(stats.email)
  if (team) {
    badges.add(team.role)
  }

  // ── 2. Verificação ────────────────────────────────────
  if (stats.phoneVerified && stats.emailVerified) {
    badges.add('verified')
    if (stats.kycApproved) badges.add('verified_seller')
  }

  // ── 3. Comprador ──────────────────────────────────────
  const purchases = stats.totalPurchases ?? 0
  const spent = stats.totalSpent ?? 0

  if (purchases >= 1) badges.add('first_purchase')
  if (purchases >= 5 || spent >= 50) badges.add('bronze_buyer')
  if (purchases >= 15 || spent >= 200) badges.add('silver_buyer')
  if (purchases >= 30 || spent >= 500) badges.add('gold_buyer')
  if (purchases >= 75 || spent >= 1500) badges.add('platinum_buyer')
  if (purchases >= 150 || spent >= 3000) badges.add('diamond_buyer')

  // ── 4. Vendedor ───────────────────────────────────────
  const sales = stats.totalSales ?? 0
  const disputes = stats.disputesLost ?? 0
  const rating = stats.sellerRating ?? 0

  if (sales >= 10 && isNewAccount(stats.createdAt)) badges.add('rising_star')
  if (sales >= 25 && disputes === 0 && rating >= 4.5) badges.add('trusted')
  if (sales >= 100 && rating >= 4.7) badges.add('top_seller')

  // ── 5. Plano ──────────────────────────────────────────
  const plan = (stats.sellerPlan ?? '').toString().toLowerCase()
  if (plan === 'pro' || plan === 'diamond') badges.add('plan_pro')
  if (plan === 'plus') {
    badges.add('plan_plus')
    badges.add('plan_pro')
  }

  // ── 6. Outras conquistas ──────────────────────────────
  if ((stats.referralCount ?? 0) >= 10) badges.add('affiliate_pro')
  if ((stats.reviewCount ?? 0) >= 25) badges.add('top_reviewer')
  if ((stats.activeStreakDays ?? 0) >= 5) badges.add('fire_streak')
  if (isEarlySupporter(stats.createdAt)) badges.add('early_supporter')
  if (isVeteran(stats.createdAt)) badges.add('loyal')

  // Ordena por prioridade
  const list = Array.from(badges).filter((id) => getBadgeById(id))
  list.sort((a, b) => {
    const ba = getBadgeById(a) as BadgeDef
    const bb = getBadgeById(b) as BadgeDef
    return bb.priority - ba.priority
  })
  return list
}

function isNewAccount(createdAt?: string): boolean {
  if (!createdAt) return false
  const ageMs = Date.now() - new Date(createdAt).getTime()
  return ageMs > 0 && ageMs < 30 * 24 * 60 * 60 * 1000 // 30 dias
}

function isEarlySupporter(createdAt?: string): boolean {
  if (!createdAt) return false
  // Contas criadas antes do lançamento oficial da v7 (01/08/2025)
  return new Date(createdAt).getTime() < new Date('2025-08-01').getTime()
}

function isVeteran(createdAt?: string): boolean {
  if (!createdAt) return false
  const ageMs = Date.now() - new Date(createdAt).getTime()
  return ageMs >= 180 * 24 * 60 * 60 * 1000 // 6 meses
}

/**
 * Verifica se o e-mail é de equipe.
 * Exportado para uso no login/signup.
 */
export function getStaffRole(email: string): string | null {
  return getTeamMember(email)?.role ?? null
}
