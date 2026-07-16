'use client'

import { sellerPlans } from '@/data/mockFAQ'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { Check, Star } from 'lucide-react'

export default function TarifasPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">Tarifas e Prazos</h1>
          <p className="text-surface-500 mt-3 max-w-lg mx-auto">Escolha o plano ideal para o seu negócio. A taxa só é cobrada quando você vende.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellerPlans.map((plan) => (
            <div key={plan.id} className={`card-base p-6 relative ${plan.popular ? 'border-brand-500 ring-2 ring-brand-100' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="brand" className="shadow-sm"><Star size={12} className="mr-1" /> Mais Popular</Badge>
                </div>
              )}
              <h3 className="font-display font-bold text-xl text-surface-900">{plan.name}</h3>
              <p className="font-display font-extrabold text-3xl text-brand-600 mt-2">{plan.fee}%</p>
              <p className="text-xs text-surface-400 mb-4">taxa por venda • {plan.price}</p>
              <ul className="space-y-2.5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-surface-600">
                    <Check size={16} className="text-brand-500 shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full mt-6">Começar com {plan.name}</Button>
            </div>
          ))}
        </div>

        {/* Prazos */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-surface-900 mb-6">Prazos de Liberação</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left px-6 py-3 font-display font-semibold text-sm text-surface-700">Categoria</th>
                  <th className="text-right px-6 py-3 font-display font-semibold text-sm text-surface-700">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                <tr><td className="px-6 py-3 text-sm text-surface-600">Moedas virtuais, Gold, Itens</td><td className="px-6 py-3 text-sm text-surface-900 font-semibold text-right">4 dias</td></tr>
                <tr><td className="px-6 py-3 text-sm text-surface-600">Contas com e-mail não verificado</td><td className="px-6 py-3 text-sm text-surface-900 font-semibold text-right">4 dias</td></tr>
                <tr><td className="px-6 py-3 text-sm text-surface-600">Cursos, Guias, Ebooks</td><td className="px-6 py-3 text-sm text-surface-900 font-semibold text-right">4 dias</td></tr>
                <tr><td className="px-6 py-3 text-sm text-surface-600">Contas, Powerlevel, Serviços</td><td className="px-6 py-3 text-sm text-surface-900 font-semibold text-right">7 dias</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
