'use client'

import { motion } from 'framer-motion'
import { Check, Crown, Star, Zap, ArrowRight } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { StaggerContainer, StaggerItem, FadeInOnScroll } from '@/components/animations'
import { sellerPlans } from '@/data/mockFAQ'

const planIcons: Record<string, React.ReactNode> = {
  silver: <Star size={24} className="text-surface-400" />,
  gold: <Crown size={24} className="text-amber-500" />,
  diamond: <Zap size={24} className="text-brand-600" />,
}

const planColors: Record<string, string> = {
  silver: 'border-surface-300',
  gold: 'border-amber-400 ring-2 ring-amber-100',
  diamond: 'border-brand-400 ring-2 ring-brand-100',
}

export default function PlanosPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <FadeInOnScroll className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">
            Planos para Vendedores
          </h1>
          <p className="text-surface-500 mt-3 max-w-lg mx-auto">
            Escolha o plano que combina com o seu negócio. Todos são grátis — a taxa só é cobrada quando você vende.
          </p>
        </FadeInOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellerPlans.map((plan) => (
            <StaggerItem key={plan.id}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`card-base p-8 border-2 ${planColors[plan.id]} h-full flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full font-display">MAIS POPULAR</span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-3">
                    {planIcons[plan.id]}
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-surface-900">{plan.name}</h3>
                  <p className="text-surface-500 text-sm">Taxa de {plan.fee}% por venda</p>
                  <p className="font-display font-extrabold text-3xl text-surface-900 mt-3">
                    {plan.price}
                  </p>
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-surface-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full mt-6 py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                    plan.popular
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                  }`}
                >
                  Escolher {plan.name} <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* FAQ section */}
        <FadeInOnScroll className="mt-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 text-center mb-8">Perguntas Frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { q: 'Posso trocar de plano depois?', a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento.' },
              { q: 'A taxa é cobrada mesmo se não vender?', a: 'Não. A taxa só é descontada quando uma venda é concluída.' },
              { q: 'Qual a diferença entre Prata e Diamante?', a: 'O plano Diamante dá máximo destaque nos resultados, badge exclusiva, suporte prioritário e mais PD Points.' },
              { q: 'Posso testar o plano Ouro?', a: 'Sim, todos os planos são grátis. A taxa só incide sobre vendas efetivadas.' },
            ].map((item) => (
              <div key={item.q} className="card-base p-5">
                <h3 className="font-display font-bold text-sm text-surface-900">{item.q}</h3>
                <p className="text-sm text-surface-500 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
