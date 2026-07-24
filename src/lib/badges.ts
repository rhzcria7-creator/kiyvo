// ─────────────────────────────────────────────────────────────
// KIYVO — Sistema de Emblemas (Badges)
//
// Badges de EQUIPE (staff) — apenas para contas oficiais KIYVO.
// Badges de COMPRADOR — dão desconto progressivo (2% a 7%) em cima do valor pago.
// Badges de VENDEDOR — aumentam credibilidade e reduzem taxas de venda.
// Badges de CONQUISTA — decorativos, aumentam engajamento.
//
// 100 KD Points = R$ 1,00. Desconto máximo por pedido 50% (limite global).
// ─────────────────────────────────────────────────────────────

import type { LucideIcon } from 'lucide-react'
import {
  Crown, Shield, Zap, Star, CheckCircle2, Flame, Gem, Rocket,
  Award, Sparkles, BadgeCheck, Sword, Cpu, Wrench, Headphones,
  TrendingUp, Heart, Medal, Trophy, Lock, Key,
} from 'lucide-react'

export type BadgeCategory = 'team' | 'buyer' | 'seller' | 'achievement'

export interface BadgeDef {
  id: string
  name: string
  description: string
  category: BadgeCategory
  // Para compradores: desconto EXTRA aplicado no checkout (soma com plano KD)
  buyerDiscountPct?: number
  // Para vendedores: desconto na taxa de venda da plataforma
  sellerFeeDiscountPct?: number
  // Estilo visual
  colorFrom: string
  colorTo: string
  ringColor: string
  textColor: string
  icon: LucideIcon
  iconLabel: string
  // Para cálculo automático de conquista
  autoAward?: {
    type: 'purchases' | 'sales' | 'reviews' | 'streak' | 'referrals' | 'spent' | 'verified'
    threshold: number
  }
  priority: number // ordem de exibição (maior = mais importante / primeiro)
}

// ─── BADGES OFICIAIS DA PLATAFORMA ──────────────────────────

export const BADGES: BadgeDef[] = [
  // ── EQUIPE / STAFF ────────────────────────────────────────
  {
    id: 'ceo',
    name: 'CEO',
    description: 'Fundador e CEO da KIYVO',
    category: 'team',
    colorFrom: 'from-amber-400',
    colorTo: 'to-orange-600',
    ringColor: 'ring-amber-300',
    textColor: 'text-amber-700',
    icon: Crown,
    iconLabel: '👑',
    priority: 1000,
  },
  {
    id: 'cto',
    name: 'CTO',
    description: 'Diretor de Tecnologia da KIYVO',
    category: 'team',
    colorFrom: 'from-violet-500',
    colorTo: 'to-indigo-700',
    ringColor: 'ring-violet-300',
    textColor: 'text-violet-700',
    icon: Cpu,
    iconLabel: 'CTO',
    priority: 990,
  },
  {
    id: 'coo',
    name: 'COO',
    description: 'Diretor de Operações da KIYVO',
    category: 'team',
    colorFrom: 'from-teal-500',
    colorTo: 'to-cyan-700',
    ringColor: 'ring-teal-300',
    textColor: 'text-teal-700',
    icon: Wrench,
    iconLabel: 'COO',
    priority: 980,
  },
  {
    id: 'founder',
    name: 'Fundador',
    description: 'Membro fundador da equipe KIYVO',
    category: 'team',
    colorFrom: 'from-yellow-400',
    colorTo: 'to-amber-600',
    ringColor: 'ring-yellow-300',
    textColor: 'text-yellow-700',
    icon: Key,
    iconLabel: '★',
    priority: 970,
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Equipe de administração da KIYVO',
    category: 'team',
    colorFrom: 'from-red-500',
    colorTo: 'to-rose-700',
    ringColor: 'ring-red-300',
    textColor: 'text-red-700',
    icon: Sword,
    iconLabel: '⚔',
    priority: 960,
  },
  {
    id: 'moderator',
    name: 'Moderador',
    description: 'Moderador da comunidade KIYVO',
    category: 'team',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-green-700',
    ringColor: 'ring-emerald-300',
    textColor: 'text-emerald-700',
    icon: Shield,
    iconLabel: '🛡',
    priority: 950,
  },
  {
    id: 'support',
    name: 'Suporte Oficial',
    description: 'Equipe de suporte KIYVO 24/7',
    category: 'team',
    colorFrom: 'from-sky-500',
    colorTo: 'to-blue-700',
    ringColor: 'ring-sky-300',
    textColor: 'text-sky-700',
    icon: Headphones,
    iconLabel: '🎧',
    priority: 940,
  },

  // ── VENDEDOR — credibilidade ─────────────────────────────
  {
    id: 'verified_seller',
    name: 'Vendedor Verificado',
    description: 'Identidade e dados validados pela KIYVO',
    category: 'seller',
    colorFrom: 'from-blue-500',
    colorTo: 'to-blue-700',
    ringColor: 'ring-blue-300',
    textColor: 'text-blue-700',
    icon: BadgeCheck,
    iconLabel: '✓',
    priority: 500,
    autoAward: { type: 'verified', threshold: 1 },
  },
  {
    id: 'top_seller',
    name: 'Top Vendedor',
    description: 'Mais de 100 vendas concluídas com nota ≥ 4.7',
    category: 'seller',
    colorFrom: 'from-fuchsia-500',
    colorTo: 'to-purple-700',
    ringColor: 'ring-fuchsia-300',
    textColor: 'text-fuchsia-700',
    icon: Trophy,
    iconLabel: '🏆',
    sellerFeeDiscountPct: 5,
    priority: 480,
    autoAward: { type: 'sales', threshold: 100 },
  },
  {
    id: 'trusted',
    name: 'Vendedor Confiável',
    description: 'Mais de 25 vendas e zero disputas perdidas',
    category: 'seller',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-emerald-700',
    ringColor: 'ring-emerald-300',
    textColor: 'text-emerald-700',
    icon: Shield,
    iconLabel: '🛡',
    sellerFeeDiscountPct: 2,
    priority: 460,
    autoAward: { type: 'sales', threshold: 25 },
  },
  {
    id: 'rising_star',
    name: 'Estrela em Ascensão',
    description: 'Novato com mais de 10 vendas no primeiro mês',
    category: 'seller',
    colorFrom: 'from-pink-500',
    colorTo: 'to-rose-600',
    ringColor: 'ring-pink-300',
    textColor: 'text-pink-700',
    icon: Rocket,
    iconLabel: '🚀',
    priority: 440,
    autoAward: { type: 'sales', threshold: 10 },
  },

  // ── COMPRADOR — descontos de 2% a 7% ────────────────────
  {
    id: 'bronze_buyer',
    name: 'Comprador Bronze',
    description: '5 compras ou mais — 2% de desconto extra',
    category: 'buyer',
    colorFrom: 'from-orange-400',
    colorTo: 'to-orange-600',
    ringColor: 'ring-orange-300',
    textColor: 'text-orange-700',
    icon: Medal,
    iconLabel: '🥉',
    buyerDiscountPct: 2,
    priority: 300,
    autoAward: { type: 'purchases', threshold: 5 },
  },
  {
    id: 'silver_buyer',
    name: 'Comprador Prata',
    description: '15 compras ou R$ 200 gastos — 3% de desconto',
    category: 'buyer',
    colorFrom: 'from-slate-400',
    colorTo: 'to-slate-600',
    ringColor: 'ring-slate-300',
    textColor: 'text-slate-700',
    icon: Medal,
    iconLabel: '🥈',
    buyerDiscountPct: 3,
    priority: 320,
    autoAward: { type: 'purchases', threshold: 15 },
  },
  {
    id: 'gold_buyer',
    name: 'Comprador Ouro',
    description: '30 compras ou R$ 500 gastos — 4% de desconto',
    category: 'buyer',
    colorFrom: 'from-yellow-400',
    colorTo: 'to-yellow-600',
    ringColor: 'ring-yellow-300',
    textColor: 'text-yellow-700',
    icon: Medal,
    iconLabel: '🥇',
    buyerDiscountPct: 4,
    priority: 340,
    autoAward: { type: 'purchases', threshold: 30 },
  },
  {
    id: 'platinum_buyer',
    name: 'Comprador Platina',
    description: '75 compras ou R$ 1.500 gastos — 5% de desconto',
    category: 'buyer',
    colorFrom: 'from-cyan-400',
    colorTo: 'to-blue-600',
    ringColor: 'ring-cyan-300',
    textColor: 'text-cyan-700',
    icon: Gem,
    iconLabel: '💎',
    buyerDiscountPct: 5,
    priority: 360,
    autoAward: { type: 'purchases', threshold: 75 },
  },
  {
    id: 'diamond_buyer',
    name: 'Comprador Diamante',
    description: '150 compras ou R$ 3.000 gastos — 7% de desconto',
    category: 'buyer',
    colorFrom: 'from-indigo-400',
    colorTo: 'to-violet-700',
    ringColor: 'ring-indigo-300',
    textColor: 'text-indigo-700',
    icon: Gem,
    iconLabel: '💎',
    buyerDiscountPct: 7,
    priority: 380,
    autoAward: { type: 'purchases', threshold: 150 },
  },

  // ── CONQUISTA ────────────────────────────────────────────
  {
    id: 'verified',
    name: 'Conta Verificada',
    description: 'E-mail e telefone confirmados',
    category: 'achievement',
    colorFrom: 'from-sky-500',
    colorTo: 'to-blue-600',
    ringColor: 'ring-sky-300',
    textColor: 'text-sky-700',
    icon: CheckCircle2,
    iconLabel: '✓',
    priority: 200,
    autoAward: { type: 'verified', threshold: 1 },
  },
  {
    id: 'first_purchase',
    name: 'Primeira Compra',
    description: 'Bem-vindo à KIYVO!',
    category: 'achievement',
    colorFrom: 'from-green-400',
    colorTo: 'to-emerald-600',
    ringColor: 'ring-green-300',
    textColor: 'text-green-700',
    icon: Sparkles,
    iconLabel: '✨',
    priority: 190,
    autoAward: { type: 'purchases', threshold: 1 },
  },
  {
    id: 'fire_streak',
    name: 'Em Chamas',
    description: '5 compras em 7 dias consecutivos',
    category: 'achievement',
    colorFrom: 'from-orange-500',
    colorTo: 'to-red-600',
    ringColor: 'ring-orange-300',
    textColor: 'text-orange-700',
    icon: Flame,
    iconLabel: '🔥',
    priority: 180,
    autoAward: { type: 'streak', threshold: 5 },
  },
  {
    id: 'top_reviewer',
    name: 'Avaliador Top',
    description: '25 avaliações úteis feitas',
    category: 'achievement',
    colorFrom: 'from-pink-400',
    colorTo: 'to-fuchsia-600',
    ringColor: 'ring-pink-300',
    textColor: 'text-pink-700',
    icon: Star,
    iconLabel: '⭐',
    priority: 170,
    autoAward: { type: 'reviews', threshold: 25 },
  },
  {
    id: 'affiliate_pro',
    name: 'Afiliado Pro',
    description: '10 amigos cadastrados pelo seu link',
    category: 'achievement',
    colorFrom: 'from-purple-500',
    colorTo: 'to-pink-600',
    ringColor: 'ring-purple-300',
    textColor: 'text-purple-700',
    icon: TrendingUp,
    iconLabel: '📈',
    priority: 160,
    autoAward: { type: 'referrals', threshold: 10 },
  },
  {
    id: 'early_supporter',
    name: 'Apoiador Inicial',
    description: 'Usuário desde os primeiros dias da KIYVO v6/v7',
    category: 'achievement',
    colorFrom: 'from-yellow-400',
    colorTo: 'to-amber-500',
    ringColor: 'ring-yellow-300',
    textColor: 'text-amber-700',
    icon: Award,
    iconLabel: '🏅',
    priority: 150,
  },
  {
    id: 'loyal',
    name: 'Cliente Leal',
    description: 'Conta com mais de 6 meses de cadastro ativo',
    category: 'achievement',
    colorFrom: 'from-rose-400',
    colorTo: 'to-pink-600',
    ringColor: 'ring-rose-300',
    textColor: 'text-rose-700',
    icon: Heart,
    iconLabel: '❤',
    priority: 140,
  },
  {
    id: 'plan_pro',
    name: 'Assinante Pro',
    description: 'Assinante do plano Pro ativo',
    category: 'achievement',
    colorFrom: 'from-brand-500',
    colorTo: 'to-brand-700',
    ringColor: 'ring-brand-300',
    textColor: 'text-brand-700',
    icon: Zap,
    iconLabel: '⚡',
    priority: 250,
  },
  {
    id: 'plan_plus',
    name: 'Assinante Plus',
    description: 'Assinante do plano Plus ativo',
    category: 'achievement',
    colorFrom: 'from-slate-800',
    colorTo: 'to-black',
    ringColor: 'ring-slate-500',
    textColor: 'text-slate-800',
    icon: Crown,
    iconLabel: '👑',
    priority: 260,
  },
]

// ── CONTAS OFICIAIS DA EQUIPE (seed) ───────────────────────
// E-mails reservados para contas de staff.
// A role é atribuída automaticamente ao fazer login/sing-up com esses e-mails.

export interface TeamMember {
  email: string
  role: 'ceo' | 'cto' | 'coo' | 'founder' | 'admin' | 'moderator' | 'support'
  name: string
  title: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { email: 'ceo@kiyvo.com.br',    role: 'ceo',        name: 'CEO KIYVO',        title: 'Fundador & CEO' },
  { email: 'root@kiyvo.com.br',   role: 'ceo',        name: 'KIYVO Root',       title: 'Fundador & CEO' },
  { email: 'cto@kiyvo.com.br',    role: 'cto',        name: 'CTO KIYVO',        title: 'Diretor de Tecnologia' },
  { email: 'coo@kiyvo.com.br',    role: 'coo',        name: 'COO KIYVO',        title: 'Diretor de Operações' },
  { email: 'founder@kiyvo.com.br',role: 'founder',    name: 'Fundador KIYVO',   title: 'Equipe Fundadora' },
  { email: 'admin@kiyvo.com.br',  role: 'admin',      name: 'Admin KIYVO',      title: 'Administração' },
  { email: 'mod@kiyvo.com.br',    role: 'moderator',  name: 'Moderador KIYVO',  title: 'Moderação' },
  { email: 'suporte@kiyvo.com.br',role: 'support',    name: 'Suporte KIYVO',    title: 'Atendimento 24/7' },
]

export function getTeamMember(email: string): TeamMember | null {
  const normalized = email.trim().toLowerCase()
  return TEAM_MEMBERS.find((m) => m.email === normalized) ?? null
}

// ── HELPERS PARA CÁLCULO DE DESCONTO ──────────────────────

/**
 * Desconto máximo de badges de comprador (se tiver vários, pega o MAIOR,
 * pois badges de tier substituem os anteriores, não acumulam entre si).
 */
export function getBuyerBadgeDiscount(badgeIds: string[]): number {
  let maxPct = 0
  for (const id of badgeIds) {
    const def = BADGES.find((b) => b.id === id)
    if (def?.category === 'buyer' && def.buyerDiscountPct && def.buyerDiscountPct > maxPct) {
      maxPct = def.buyerDiscountPct
    }
  }
  return maxPct
}

/**
 * Desconto na taxa de venda do vendedor (acumulável até -10%).
 */
export function getSellerFeeDiscount(badgeIds: string[]): number {
  let pct = 0
  for (const id of badgeIds) {
    const def = BADGES.find((b) => b.id === id)
    if (def?.category === 'seller' && def.sellerFeeDiscountPct) pct += def.sellerFeeDiscountPct
  }
  return Math.min(pct, 10)
}

export function getBadgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id)
}

export function hasBadge(badgeIds: string[] | undefined, id: string): boolean {
  return !!badgeIds?.includes(id)
}

/**
 * Ordena badges por prioridade decrescente, separando staff primeiro.
 */
export function sortBadges(badgeIds: string[]): BadgeDef[] {
  return badgeIds
    .map((id) => getBadgeById(id))
    .filter((b): b is BadgeDef => !!b)
    .sort((a, b) => b.priority - a.priority)
}
