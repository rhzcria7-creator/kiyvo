'use client'

import { PageTransition } from '@/components/shared/PageTransition'
import { QrCode, CreditCard, Wallet, Coins, FileText, Award } from 'lucide-react'

const methods = [
  { icon: QrCode, name: 'PIX', desc: 'Pagamento instantâneo. Confirmação em segundos.', speed: 'Instantâneo' },
  { icon: CreditCard, name: 'Cartão de Crédito', desc: 'Visa, Mastercard, Elo. Até 12x sem juros.', speed: '10 min a 1 dia útil' },
  { icon: Wallet, name: 'Saldo Playdex', desc: 'Use seu saldo disponível na plataforma.', speed: 'Instantâneo' },
  { icon: Award, name: 'PD Points', desc: 'Use seus pontos de recompensa. 77 pts = R$1.', speed: 'Instantâneo' },
  { icon: Coins, name: 'Criptomoeda', desc: 'USDT, BTC, ETH e mais via parceiro.', speed: 'Até 2 horas' },
  { icon: FileText, name: 'Boleto Bancário', desc: 'Pague em qualquer banco ou lotérica.', speed: '1 dia útil' },
]

export default function PagamentosPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 mb-3">Formas de Pagamento</h1>
        <p className="text-surface-500 mb-8">Escolha a forma que melhor se adapta a você. Todas as transações são protegidas e criptografadas.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methods.map((m) => (
            <div key={m.name} className="card-base p-5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <m.icon size={22} className="text-brand-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-surface-900">{m.name}</h3>
                <p className="text-sm text-surface-500 mt-0.5">{m.desc}</p>
                <p className="text-xs text-brand-600 font-semibold mt-1">⏱ {m.speed}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
