'use client'

import { PageTransition } from '@/components/shared/PageTransition'
import { Search, Shield, CheckCircle, Zap } from 'lucide-react'

const steps = [
  { icon: Search, step: '01', title: 'Encontre o Produto', desc: 'Navegue pelo catálogo ou use a busca para encontrar jogos, software, cursos, templates, gift cards e muito mais.' },
  { icon: Shield, step: '02', title: 'Compra Segura', desc: 'A Kiyvo intermedia o pagamento, garantindo que seu dinheiro só chega ao vendedor após a entrega confirmada.' },
  { icon: CheckCircle, step: '03', title: 'Receba o Produto', desc: 'O vendedor entrega via chat ou automaticamente. Confirme o recebimento e avalie a experiência.' },
]

export default function ComoFuncionaPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white">Como Funciona</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-lg mx-auto">Comprar e vender ativos digitais nunca foi tão simples e seguro. Veja como em 3 passos.</p>
        </div>

        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={s.step} className="flex gap-6 items-start">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center relative">
                  <s.icon size={24} className="text-brand-600 dark:text-brand-400" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center font-display">{s.step}</span>
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-surface-900 dark:text-white">{s.title}</h3>
                <p className="text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-surface-900 rounded-3xl text-center">
          <h2 className="font-display font-extrabold text-2xl text-white mb-3">Pronto para começar?</h2>
          <p className="text-surface-400 mb-6 max-w-md mx-auto">Junte-se a mais de 1 milhão de usuários que já negociam com segurança na Kiyvo.</p>
          <div className="flex justify-center gap-3">
            <a href="/categorias" className="btn-primary">Explorar Catálogo</a>
            <a href="/anunciar" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-surface-900 text-surface-900 dark:text-white font-display font-semibold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-800 transition-colors">Comece a Vender</a>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
