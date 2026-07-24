'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { KDPointsCoin } from '@/components/svgs/DecorativeSVGs'
import {
  Coins, Gift, Sparkles, TrendingUp, Award,
  Star, Zap, ArrowRight, Shield, CheckCircle2, Crown, Rocket, Check
} from 'lucide-react'

// Regras do programa KD Points — MUITO acima do mercado (GGMAX/Gamemarket dão 1-2%)
const KD_EARN_RULES = [
  { icon: TrendingUp, title: '15% DE VOLTA sem plano', desc: 'Até quem não é assinante ganha 15% de cashback em KD Points em cada compra. Ninguém faz isso.' },
  { icon: Gift, title: 'Sem pegadinhas', desc: 'Pontos entram automaticamente após confirmação. Sem letrinhas miúdas.' },
  { icon: Award, title: 'Indicação premiada', desc: 'Convide amigos e ganhe pontos extras quando eles fizerem a primeira compra.' },
  { icon: Zap, title: 'Multiplicadores 2x, 3x, 5x', desc: 'Promoções-relâmpago multiplicam seus pontos em produtos selecionados.' },
]

const KD_REDEEM_OPTIONS = [
  { title: 'Desconto direto em compras', desc: 'Até 50% de desconto usando KD Points em qualquer produto da plataforma.', highlight: true },
  { title: 'Cupons exclusivos', desc: 'Troque pontos por cupons de categorias específicas com ainda mais desconto.' },
  { title: 'Upgrade de plano', desc: 'Use pontos para pagar parcialmente assinaturas Básico, Pro ou Plus.' },
  { title: 'Badges raras no perfil', desc: 'Desbloqueie selos exclusivos visíveis para todo o marketplace.' },
]

// Planos de fidelidade com cashback agressivo
const KD_PLAN_TIERS = [
  {
    name: 'Sem plano',
    price: 'Grátis',
    cashback: '15%',
    color: 'from-slate-400 to-slate-600',
    icon: Coins,
    perks: ['15% de cashback', 'Resgate padrão', 'Suporte pela comunidade'],
    cta: 'Começar a comprar',
    href: '/categorias',
    highlight: false,
  },
  {
    name: 'Básico',
    price: 'Preço acessível',
    cashback: '25%',
    color: 'from-sky-400 to-sky-600',
    icon: Star,
    perks: ['25% de cashback', 'Saques em até 24h', 'Suporte prioritário', 'Acesso antecipado a promoções'],
    cta: 'Assinar Básico',
    href: '/planos',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Mais popular',
    cashback: '35%',
    color: 'from-brand-400 to-brand-700',
    icon: Zap,
    perks: ['35% de cashback', 'Saques instantâneos PIX', 'Suporte 24h', 'Multiplicadores 2x', 'Taxas reduzidas'],
    cta: 'Assinar Pro',
    href: '/planos',
    highlight: true,
  },
  {
    name: 'Plus',
    price: 'Máximo benefício',
    cashback: '50%',
    color: 'from-amber-400 to-amber-600',
    icon: Crown,
    perks: ['50% DE CASHBACK — o MÁXIMO do mercado', 'Zero taxas de saque', 'Suporte VIP dedicado', 'Sorteios exclusivos', 'Acesso antecipado a lançamentos', 'Badge Plus no perfil'],
    cta: 'Assinar Plus',
    href: '/planos',
    highlight: false,
  },
] as const

export default function KDPointsPage() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-amber-400 to-brand-700 rounded-3xl shadow-2xl shadow-brand-500/30 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <KDPointsCoin size={56} />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-300" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-surface-900 dark:text-white mb-4"
          >
            <span className="gradient-text">KD Points</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto"
          >
            O programa de recompensas <strong className="text-brand-600 dark:text-brand-400">mais generoso do Brasil</strong>.
            Até <strong>50% de volta</strong> em KD Points — muito além dos 1-2% da concorrência.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/conta" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
              Ver meus pontos <ArrowRight size={18} />
            </Link>
            <Link href="/categorias" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3">
              Começar a ganhar
            </Link>
          </motion.div>
        </motion.div>

        {/* Comparativo mercado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-base p-6 sm:p-8 mb-16 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/30 dark:to-surface-900 border-brand-200 dark:border-brand-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-6 h-6 text-brand-600" />
            <h2 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">
              Por que KD Points é diferente?
            </h2>
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-4">
            GGMAX, Gamemarket e similares oferecem cashback de 1-2% em cupons inutilizáveis. Na Kiyvo,
            <strong className="text-brand-600 dark:text-brand-400"> até no plano grátis você ganha 15%</strong>,
            e os pontos valem de verdade — desconto direto em QUALQUER produto, sem limite de uso simultâneo.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <p className="text-xs text-surface-500">Mercado (média)</p>
              <p className="font-display font-extrabold text-xl text-surface-400 line-through">1-2%</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-950/50 ring-2 ring-brand-500/30">
              <p className="text-xs text-brand-600">KIYVO Grátis</p>
              <p className="font-display font-extrabold text-xl text-brand-600">15%</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/50 ring-2 ring-amber-500/30">
              <p className="text-xs text-amber-600">KIYVO Plus</p>
              <p className="font-display font-extrabold text-xl text-amber-600">50%</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {[
            { value: '100 pts', label: '= R$ 1,00', icon: Coins },
            { value: '50%', label: 'desconto máximo', icon: Award },
            { value: '50%', label: 'cashback máximo Plus', icon: Crown },
            { value: 'Nunca', label: 'expiram', icon: Shield },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-base p-5 text-center"
            >
              <stat.icon className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <p className="font-display font-extrabold text-xl text-surface-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Planos */}
        <FadeInOnScroll>
          <section className="mb-16">
            <h2 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2 text-center">
              Escolha seu plano
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-center mb-10 max-w-2xl mx-auto">
              Todo mundo começa grátis com 15% de cashback. Assine quando quiser turbinar seus ganhos.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {KD_PLAN_TIERS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative card-base p-6 flex flex-col ${
                    plan.highlight
                      ? 'border-brand-500 ring-2 ring-brand-500/30 scale-[1.02] shadow-xl z-10 bg-gradient-to-b from-brand-50/50 to-white dark:from-brand-950/30 dark:to-surface-900'
                      : ''
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-md`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{plan.price}</p>
                  <h3 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">{plan.name}</h3>
                  <div className="my-4">
                    <span className="font-display font-black text-4xl text-surface-900 dark:text-white">{plan.cashback}</span>
                    <span className="text-sm text-surface-500"> de volta</span>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.perks.map(perk => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={plan.highlight ? 'btn-primary w-full justify-center text-center' : 'btn-secondary w-full justify-center text-center'}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInOnScroll>

        {/* Como ganhar */}
        <FadeInOnScroll>
          <section className="mb-16">
            <h2 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2 text-center">
              Como ganhar KD Points
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-center mb-8">
              Simples: compre, acumule e resgate. Sem burocracia.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {KD_EARN_RULES.map((rule, i) => (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-base p-6 hover-lift"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                    <rule.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-2">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{rule.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInOnScroll>

        {/* Como usar */}
        <FadeInOnScroll>
          <section className="mb-16">
            <h2 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2 text-center">
              Como usar seus pontos
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-center mb-8">
              Desconto de verdade — não é cupom que não funciona.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {KD_REDEEM_OPTIONS.map((opt, i) => (
                <motion.div
                  key={opt.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-base p-6 ${
                    opt.highlight
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-gradient-to-br from-brand-50/50 to-white dark:from-brand-950/20 dark:to-surface-900'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${opt.highlight ? 'text-brand-600' : 'text-emerald-500'}`} />
                    <div>
                      <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">
                        {opt.title}
                        {opt.highlight && (
                          <span className="ml-2 text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full align-middle">
                            Mais usado
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400">{opt.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInOnScroll>

        {/* Dúvidas */}
        <FadeInOnScroll>
          <section className="card-base p-8 text-center bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/30 dark:to-surface-900">
            <Shield className="w-12 h-12 text-brand-500 mx-auto mb-3" />
            <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-2">
              Perguntas frequentes
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 max-w-lg mx-auto text-sm">
              Os KD Points <strong>nunca expiram</strong>, não têm custo e são creditados automaticamente
              após a confirmação da compra. Desconto direto no checkout, sem complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/ajuda" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
                Central de Ajuda
              </Link>
              <Link href="/suporte" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3">
                Falar com Suporte
              </Link>
            </div>
          </section>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
