'use client'

import { motion } from 'framer-motion'
import { Crown, Check, Calendar, CreditCard, Zap } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, GlowCard, NumberTicker, MorphingBlob } from '@/components/ui/AdvancedAnimations'
import { Button } from '@/components/ui/Button'

export default function AssinaturaPage() {
  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative">
        <FadeInOnScroll className="text-center mb-10">
          <Crown size={36} className="text-amber-500 mx-auto mb-3" />
          <h1 className="font-display font-extrabold text-3xl text-surface-900">Sua Assinatura</h1>
          <p className="text-surface-500 mt-2">Gerencie seu plano de vendedor</p>
        </FadeInOnScroll>

        {/* Current Plan */}
        <FadeInOnScroll className="mb-8">
          <div className="p-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <Crown size={200} />
            </div>
            <div className="relative">
              <span className="text-amber-200 text-sm font-semibold">PLANO ATUAL</span>
              <h2 className="font-display font-extrabold text-3xl mt-1">Prata</h2>
              <p className="text-amber-100 mt-2">Taxa de 9.99% por venda • Grátis</p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Vendas este mês', value: 47 },
                  { label: 'Faturamento', value: 2847 },
                  { label: 'PD Points ganhos', value: 342 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display font-extrabold text-xl"><NumberTicker value={stat.value} /></p>
                    <p className="text-amber-200 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Upgrade Options */}
        <FadeInOnScroll className="mb-8">
          <h3 className="font-display font-bold text-lg text-surface-900 mb-4">Faça Upgrade</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { plan: 'Ouro', fee: '11.99%', price: 'Grátis', features: ['Destaque na home', 'Badge Ouro', '1.5x PD Points'], color: 'border-amber-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]' },
              { plan: 'Diamante', fee: '12.99%', price: 'Grátis', features: ['Destaque máximo', 'Badge Diamante', '2x PD Points', 'Suporte prioritário', 'Relatórios avançados'], color: 'border-brand-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]' },
            ].map((p) => (
              <motion.div key={p.plan} whileHover={{ y: -4 }} className={`card-base p-6 border-2 ${p.color} transition-all cursor-pointer`}>
                <h4 className="font-display font-extrabold text-xl text-surface-900">{p.plan}</h4>
                <p className="text-surface-500 text-sm">Taxa de {p.fee} • {p.price}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-surface-600">
                      <Check size={14} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button size="sm" className="w-full mt-4">Escolher {p.plan}</Button>
              </motion.div>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Billing History */}
        <FadeInOnScroll>
          <h3 className="font-display font-bold text-lg text-surface-900 mb-4">Histórico de Cobranças</h3>
          <div className="card-base divide-y divide-surface-100">
            {[
              { date: '01/07/26', desc: 'Taxa do plano Prata — 47 vendas', amount: 'R$ 0,00', status: 'Sem cobrança' },
              { date: '01/06/26', desc: 'Taxa do plano Prata — 38 vendas', amount: 'R$ 0,00', status: 'Sem cobrança' },
              { date: '01/05/26', desc: 'Taxa do plano Prata — 52 vendas', amount: 'R$ 0,00', status: 'Sem cobrança' },
            ].map((item) => (
              <div key={item.date} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900">{item.desc}</p>
                  <p className="text-xs text-surface-400">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-surface-900">{item.amount}</p>
                  <p className="text-xs text-surface-400">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
