'use client'

import { PageTransition } from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/Button'
import { Star, ShoppingBag, Gift, Clock, ArrowRight } from 'lucide-react'

export default function RecompensasPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-amber-500" />
          </div>
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">Programa de Recompensas</h1>
          <p className="text-surface-500 mt-3 max-w-lg mx-auto">Ganhe PD Points em cada compra e venda. Acumule e troque por produtos na plataforma.</p>
        </div>

        {/* Balance */}
        <div className="card-base p-8 text-center mb-8 bg-gradient-to-br from-brand-50 to-brand-100/50 border-brand-200">
          <p className="text-sm text-brand-700 font-display font-semibold mb-1">Seu Saldo de PD Points</p>
          <p className="font-display font-extrabold text-5xl text-brand-600">2.340</p>
          <p className="text-sm text-brand-500 mt-1">≈ R$ 30,39 disponíveis</p>
        </div>

        {/* How to earn */}
        <h2 className="font-display font-bold text-xl text-surface-900 mb-4">Como Ganhar PD Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: ShoppingBag, title: 'Fazendo Compras', desc: 'R$ 1 gasto = 1 PD Point. Planos Plus e Premium dão mais pontos.', color: 'brand' },
            { icon: Star, title: 'Vendendo com Plano MAX', desc: 'Ganhe 50% dos pontos da venda ao receber avaliação positiva.', color: 'amber' },
            { icon: Gift, title: 'Cupons e Promoções', desc: 'Fique de olho em cupons e eventos no nosso Discord.', color: 'emerald' },
            { icon: Clock, title: 'Importante', desc: 'Os PD Points expiram em 6 meses. Utilize antes do vencimento!', color: 'red' },
          ].map((item) => (
            <div key={item.title} className="card-base p-5 flex gap-4">
              <div className={`w-10 h-10 rounded-xl bg-${item.color === 'brand' ? 'brand' : item.color}-50 flex items-center justify-center shrink-0`}>
                <item.icon size={20} className={`text-${item.color === 'brand' ? 'brand' : item.color}-600`} />
              </div>
              <div>
                <h3 className="font-display font-bold text-surface-900 text-sm">{item.title}</h3>
                <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cotação */}
        <div className="card-base p-6 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-surface-900">Cotação Atual</h3>
            <p className="text-surface-500 text-sm">77 PD Points = R$ 1,00 • Mínimo de resgate: 300 PD Points</p>
          </div>
          <Button>Usar PD Points</Button>
        </div>
      </div>
    </PageTransition>
  )
}
