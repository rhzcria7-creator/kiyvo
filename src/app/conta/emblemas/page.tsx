// ─────────────────────────────────────────────────────────────
// /conta/emblemas — Meus Emblemas (Badges)
//
// Mostra todos os emblemas do usuário, com descrição, desconto
// que cada um oferece e progresso para o próximo tier.
// Design: cards de gradiente, no tema unificado Apple+Netflix+3D.
// ─────────────────────────────────────────────────────────────

'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { ProfileBadge } from '@/components/ui/ProfileBadge'
import { BADGES, BadgeDef, getBuyerBadgeDiscount } from '@/lib/badges'
import { Lock, CheckCircle2, Percent, Gift } from 'lucide-react'

// TEMP: simulando badges do usuário até integrar com Supabase
// Em produção: buscar de /api/v1/me → profile.badges
const DEMO_BADGES: string[] = ['verified', 'first_purchase', 'bronze_buyer', 'plan_pro']

export default function MeusEmblemasPage() {
  const userBadgeSet = new Set(DEMO_BADGES)
  const currentDiscount = getBuyerBadgeDiscount(DEMO_BADGES)

  const teamBadges = BADGES.filter((b) => b.category === 'team')
  const buyerBadges = BADGES.filter((b) => b.category === 'buyer').sort((a, b) => b.priority - a.priority)
  const sellerBadges = BADGES.filter((b) => b.category === 'seller').sort((a, b) => b.priority - a.priority)
  const achBadges = BADGES.filter((b) => b.category === 'achievement').sort((a, b) => b.priority - a.priority)

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-2">Conta</p>
            <h1 className="font-display font-black text-3xl lg:text-4xl text-[#0F172A] dark:text-white tracking-tight">
              Meus Emblemas
            </h1>
            <p className="text-[#64748B] dark:text-white/60 mt-2">
              Emblemas representam sua reputação, conquistas e benefícios na KIYVO.
              Compradores ganham descontos progressivos; vendedores ganham credibilidade e taxas reduzidas.
            </p>
          </motion.div>

          {/* Destaque: desconto atual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-8 text-white relative overflow-hidden shadow-[0_30px_80px_-30px_rgba(37,99,235,0.55)]"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
                <Percent size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-white/70">Seu desconto ativo</p>
                <p className="font-display font-black text-4xl lg:text-5xl mt-1">{currentDiscount}% OFF</p>
                <p className="text-white/80 text-sm mt-1">
                  Aplicado automaticamente em TODAS as compras, além do cashback de KD Points do seu plano.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {DEMO_BADGES.map((id) => (
                  <ProfileBadge key={id} badgeId={id} size="md" />
                ))}
              </div>
            </div>
          </motion.div>

          <BadgeSection
            title="Emblemas de Comprador"
            subtitle="Desbloqueie descontos de 2% a 7% em todas as compras. Quem mais compra, mais economiza."
            icon={<Gift size={20} />}
            badges={buyerBadges}
            owned={userBadgeSet}
          />

          <BadgeSection
            title="Emblemas de Vendedor"
            subtitle="Transmitem credibilidade e reduzem a taxa de venda da plataforma em até 10%."
            icon={<CheckCircle2 size={20} />}
            badges={sellerBadges}
            owned={userBadgeSet}
          />

          <BadgeSection
            title="Conquistas"
            subtitle="Marcos que você atingiu na plataforma."
            icon={<Gift size={20} />}
            badges={achBadges}
            owned={userBadgeSet}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <h2 className="font-display font-black text-sm text-[#64748B] dark:text-white/50 uppercase tracking-widest mb-3">
              Equipe KIYVO
            </h2>
            <p className="text-xs text-[#94A3B8] dark:text-white/40 mb-4">
              Estes emblemas são exclusivos de membros da equipe oficial.
            </p>
            <div className="flex flex-wrap gap-2">
              {teamBadges.map((b) => (
                <ProfileBadge key={b.id} badgeId={b.id} size="md" showLabel />
              ))}
            </div>
          </motion.div>

          <p className="mt-10 text-xs text-[#94A3B8] dark:text-white/40 text-center">
            Emblemas são atualizados automaticamente conforme sua atividade na plataforma.
            Compras, vendas, avaliações e indicações contam pontos.
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

function BadgeSection({
  title, subtitle, icon, badges, owned,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  badges: BadgeDef[]
  owned: Set<string>
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-brand-600">{icon}</span>
        <h2 className="font-display font-black text-xl lg:text-2xl text-[#0F172A] dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-[#64748B] dark:text-white/60 mb-5 max-w-2xl">{subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b, i) => {
          const isOwned = owned.has(b.id)
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -3 }}
              className={`relative rounded-2xl p-5 border transition ${
                isOwned
                  ? 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.15)]'
                  : 'bg-[#F8FAFC] dark:bg-white/[0.03] border-black/5 dark:border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${b.colorFrom} ${b.colorTo} text-white shadow-md ${!isOwned ? 'grayscale opacity-40' : ''}`}>
                  {isOwned ? <b.icon size={22} strokeWidth={2.5} /> : <Lock size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-display font-black text-sm ${isOwned ? 'text-[#0F172A] dark:text-white' : 'text-[#94A3B8] dark:text-white/40'}`}>
                      {b.name}
                    </h3>
                    {isOwned && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isOwned ? 'text-[#64748B] dark:text-white/60' : 'text-[#94A3B8] dark:text-white/30'}`}>
                    {b.description}
                  </p>
                  {b.buyerDiscountPct && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                      <Percent size={10} /> {b.buyerDiscountPct}% de desconto
                    </p>
                  )}
                  {b.sellerFeeDiscountPct && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Percent size={10} /> -{b.sellerFeeDiscountPct}% na taxa de venda
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
