'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'

const plans = [
  {
    name: 'Prata',
    icon: Zap,
    price: 'Grátis',
    period: '',
    fee: '9.99%',
    color: 'border-surface-200 dark:border-surface-700',
    iconBg: 'bg-surface-100 dark:bg-surface-800',
    iconColor: 'text-surface-600 dark:text-surface-400',
    features: [
      'Até 10 anúncios ativos',
      'Taxa de 9.99% por venda',
      'Suporte por e-mail',
      'Dashboard básico',
      'KD Points em cada venda',
    ],
    cta: 'Começar grátis',
    href: '/cadastro',
  },
  {
    name: 'Ouro',
    icon: Star,
    price: 'R$ 29',
    period: '/mês',
    fee: '7.99%',
    color: 'border-brand-300 dark:border-brand-700 ring-2 ring-brand-500/20',
    iconBg: 'bg-brand-50 dark:bg-brand-950/50',
    iconColor: 'text-brand-600 dark:text-brand-400',
    popular: true,
    features: [
      'Até 50 anúncios ativos',
      'Taxa de 7.99% por venda',
      'Suporte prioritário',
      'Dashboard avançado',
      'KD Points 2x em cada venda',
      'Destaque nos resultados',
      'Relatórios de vendas',
    ],
    cta: 'Assinar Ouro',
    href: '/assinatura',
  },
  {
    name: 'Diamante',
    icon: Crown,
    price: 'R$ 79',
    period: '/mês',
    fee: '5.99%',
    color: 'border-purple-300 dark:border-purple-700',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    features: [
      'Anúncios ilimitados',
      'Taxa de 5.99% por venda',
      'Suporte 24/7 dedicado',
      'Dashboard premium',
      'KD Points 5x em cada venda',
      'Destaque premium',
      'Relatórios avançados + export',
      'Badge Diamante no perfil',
      'Acesso antecipado a recursos',
      'API access',
    ],
    cta: 'Assinar Diamante',
    href: '/assinatura',
  },
]

export default function PricingPage() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white">
            Planos para <span className="gradient-text">vendedores</span>
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 mt-4 max-w-xl mx-auto">
            Comece grátis e evolua conforme cresce. Sem surpresas, sem fidelidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative card-base p-6 lg:p-8 ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full">
                  Mais popular
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                <plan.icon size={24} className={plan.iconColor} />
              </div>

              <h2 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">{plan.name}</h2>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display font-extrabold text-4xl text-surface-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-surface-500 dark:text-surface-400 text-sm">{plan.period}</span>}
              </div>

              <p className="text-sm text-brand-600 dark:text-brand-400 font-semibold mt-2">
                Taxa de {plan.fee} por venda
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  size="lg"
                  variant={plan.popular ? 'primary' : 'secondary'}
                  icon={<ArrowRight size={16} />}
                  className="w-full mt-8"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Todos os planos incluem: pagamento seguro via Stripe, proteção ao vendedor e comprador, e suporte.
          </p>
          <Link href="/comparativo" className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline mt-1 inline-block">
            Ver tabela comparativa completa →
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  )
}
