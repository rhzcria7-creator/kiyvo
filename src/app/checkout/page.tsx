'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/shared/PageTransition'
import { CreditCard, QrCode, Wallet, Coins, Shield, Check } from 'lucide-react'

const paymentMethods = [
  { id: 'pix', label: 'PIX', icon: QrCode, desc: 'Instantâneo', color: 'brand' },
  { id: 'card', label: 'Cartão de Crédito', icon: CreditCard, desc: 'Até 12x', color: 'brand' },
  { id: 'balance', label: 'Saldo Playdex', icon: Wallet, desc: 'R$ 0,00 disponível', color: 'surface' },
  { id: 'crypto', label: 'Criptomoeda', icon: Coins, desc: 'USDT, BTC, ETH', color: 'surface' },
]

export default function CheckoutPage() {
  const [selected, setSelected] = useState('pix')
  const [plan, setPlan] = useState<'basic' | 'plus' | 'premium'>('basic')

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product summary */}
            <div className="card-base p-5 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-surface-100 shrink-0 flex items-center justify-center text-2xl">🎮</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-surface-900 truncate">Conta Valorant – Diamante 1 + 40 Skins</h3>
                <p className="text-sm text-surface-500 mt-0.5">Vendido por PixelKing</p>
                <p className="font-display font-extrabold text-lg text-surface-900 mt-2">R$ 89,90</p>
              </div>
            </div>

            {/* Security plans */}
            <div>
              <h2 className="font-display font-bold text-surface-900 mb-3">Plano de Segurança</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'basic' as const, name: 'Básico', price: 'Grátis', desc: 'Garantia padrão' },
                  { id: 'plus' as const, name: 'Plus', price: '+R$ 4,90', desc: '+5 PD Points' },
                  { id: 'premium' as const, name: 'Premium', price: '+R$ 9,90', desc: '+15 PD Points + Seguro total' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      plan === p.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    }`}
                  >
                    <p className="font-display font-bold text-sm text-surface-900">{p.name}</p>
                    <p className="text-xs text-brand-600 font-semibold mt-0.5">{p.price}</p>
                    <p className="text-xs text-surface-400 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div>
              <h2 className="font-display font-bold text-surface-900 mb-3">Forma de Pagamento</h2>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelected(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selected === method.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    }`}
                  >
                    <method.icon size={22} className={selected === method.id ? 'text-brand-600' : 'text-surface-400'} />
                    <div className="text-left flex-1">
                      <p className="font-display font-semibold text-sm text-surface-900">{method.label}</p>
                      <p className="text-xs text-surface-400">{method.desc}</p>
                    </div>
                    {selected === method.id && <Check size={18} className="text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Card form (shown when card selected) */}
            {selected === 'card' && (
              <div className="card-base p-5 space-y-4">
                <Input label="Número do Cartão" placeholder="0000 0000 0000 0000" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Validade" placeholder="MM/AA" />
                  <Input label="CVV" placeholder="000" />
                </div>
                <Input label="Nome no Cartão" placeholder="Como está no cartão" />
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 card-base p-6">
              <h3 className="font-display font-bold text-surface-900 mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Produto</span>
                  <span className="text-surface-900 font-medium">R$ 89,90</span>
                </div>
                {plan !== 'basic' && (
                  <div className="flex justify-between">
                    <span className="text-surface-500">Plano {plan === 'plus' ? 'Plus' : 'Premium'}</span>
                    <span className="text-surface-900 font-medium">{plan === 'plus' ? 'R$ 4,90' : 'R$ 9,90'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-surface-500">Taxa de serviço</span>
                  <span className="text-surface-900 font-medium">R$ 2,50</span>
                </div>
                <div className="h-px bg-surface-200 my-2" />
                <div className="flex justify-between font-display font-bold text-base">
                  <span>Total</span>
                  <span className="text-brand-600">
                    R$ {plan === 'basic' ? '92,40' : plan === 'plus' ? '97,30' : '102,30'}
                  </span>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg" icon={<Shield size={18} />}>
                Pagar com {paymentMethods.find(m => m.id === selected)?.label}
              </Button>

              <p className="text-xs text-surface-400 text-center mt-3">
                🔒 Pagamento seguro e criptografado
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
