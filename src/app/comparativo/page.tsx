'use client'

import { motion } from 'framer-motion'
import { Check, X, Crown, Star, Zap } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, GlowCard } from '@/components/ui/AdvancedAnimations'

const features = [
  { name: 'Anúncio na listagem', silver: true, gold: true, diamond: true },
  { name: 'Destaque na página principal', silver: false, gold: true, diamond: true },
  { name: 'Maior visibilidade na busca', silver: false, gold: true, diamond: true },
  { name: 'Badge de vendedor', silver: 'Prata', gold: 'Ouro', diamond: 'Diamante' },
  { name: 'KD Points por venda', silver: '1x', gold: '1.5x', diamond: '2x' },
  { name: 'Suporte prioritário', silver: false, gold: false, diamond: true },
  { name: 'Destaque máximo nas pesquisas', silver: false, gold: false, diamond: true },
  { name: 'Relatórios avançados', silver: false, gold: false, diamond: true },
  { name: 'Badge exclusiva Diamante', silver: false, gold: false, diamond: true },
  { name: 'Anúncios em vídeo', silver: false, gold: false, diamond: true },
  { name: 'Acesso antecipado a recursos', silver: false, gold: false, diamond: true },
]

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'string') return <span className="text-sm font-medium text-surface-700">{value}</span>
  return value ? <Check size={18} className="text-emerald-500 mx-auto" /> : <X size={18} className="text-surface-300 mx-auto" />
}

export default function ComparativoPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <FadeInOnScroll className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">Compare os Planos</h1>
          <p className="text-surface-500 mt-3 max-w-md mx-auto">Encontre o plano perfeito para o seu negócio digital</p>
        </FadeInOnScroll>

        {/* Top Cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { plan: 'Prata', icon: Star, fee: '9.99%', color: 'text-surface-400', bg: 'bg-surface-50', border: 'border-surface-200' },
            { plan: 'Ouro', icon: Crown, fee: '11.99%', color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-300', popular: true },
            { plan: 'Diamante', icon: Zap, fee: '12.99%', color: 'text-brand-600', bg: 'bg-brand-50/50', border: 'border-brand-300' },
          ].map((p, i) => (
            <FadeInOnScroll key={p.plan} delay={i * 0.1}>
              <GlowCard color={p.plan === 'Diamante' ? 'brand' : p.plan === 'Ouro' ? 'amber' : 'purple'} className={`p-6 text-center border-2 ${p.border} relative`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">POPULAR</span>
                )}
                <p.icon size={28} className={`${p.color} mx-auto mb-2`} />
                <h3 className="font-display font-extrabold text-xl text-surface-900">{p.plan}</h3>
                <p className="text-surface-500 text-sm">Taxa de {p.fee} por venda</p>
                <p className="font-display font-extrabold text-3xl text-surface-900 mt-3">Grátis</p>
              </GlowCard>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Comparison Table */}
        <FadeInOnScroll>
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-surface-700">Recurso</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-surface-400">Prata</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-amber-600">Ouro</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-brand-600">Diamante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {features.map((feat, i) => (
                  <motion.tr
                    key={feat.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-50/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-sm text-surface-700 font-medium">{feat.name}</td>
                    <td className="px-4 py-3.5 text-center"><CellValue value={feat.silver} /></td>
                    <td className="px-4 py-3.5 text-center bg-amber-50/20"><CellValue value={feat.gold} /></td>
                    <td className="px-4 py-3.5 text-center bg-brand-50/20"><CellValue value={feat.diamond} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
