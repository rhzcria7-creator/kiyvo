'use client'

import { motion } from 'framer-motion'
import { CreditCard, DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, NumberTicker, MorphingBlob } from '@/components/ui/AdvancedAnimations'

export default function AdminStripePage() {
  const isConnected = false // Will be true when Stripe keys are set

  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl text-surface-900 flex items-center gap-2">
            <CreditCard size={24} className="text-brand-600" /> Stripe Dashboard
          </h1>
          <p className="text-surface-500 text-sm mt-1">Gerencie pagamentos e transações Stripe</p>
        </motion.div>

        {/* Connection Status */}
        <FadeInOnScroll className="mt-8">
          <div className={`card-base p-6 ${isConnected ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
            <div className="flex items-center gap-4">
              {isConnected ? (
                <CheckCircle size={32} className="text-emerald-500" />
              ) : (
                <AlertCircle size={32} className="text-amber-500" />
              )}
              <div>
                <h3 className="font-display font-bold text-lg text-surface-900">
                  {isConnected ? 'Stripe Conectado' : 'Stripe Não Configurado'}
                </h3>
                <p className="text-sm text-surface-500 mt-1">
                  {isConnected
                    ? 'Sua conta Stripe está conectada e processando pagamentos.'
                    : 'Configure suas credenciais Stripe para começar a receber pagamentos reais.'}
                </p>
              </div>
            </div>

            {!isConnected && (
              <div className="mt-4 p-4 bg-white rounded-xl">
                <h4 className="font-display font-bold text-sm text-surface-900 mb-3">Como configurar:</h4>
                <ol className="space-y-2 text-sm text-surface-600">
                  <li className="flex items-start gap-2"><span className="font-bold text-brand-600">1.</span> Crie uma conta em <strong>stripe.com</strong></li>
                  <li className="flex items-start gap-2"><span className="font-bold text-brand-600">2.</span> No Dashboard, copie a <strong>Publishable Key</strong> e a <strong>Secret Key</strong></li>
                  <li className="flex items-start gap-2"><span className="font-bold text-brand-600">3.</span> Adicione as variáveis na Vercel:</li>
                </ol>
                <div className="mt-3 bg-surface-900 rounded-xl p-4 font-mono text-sm">
                  <p className="text-surface-400">{'# .env ou Vercel Environment Variables'}</p>
                  <p className="text-emerald-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...</p>
                  <p className="text-emerald-400">STRIPE_SECRET_KEY=sk_live_...</p>
                  <p className="text-amber-400">STRIPE_WEBHOOK_SECRET=whsec_...</p>
                </div>
                <p className="text-xs text-surface-400 mt-3">
                  💡 Em modo de teste, use as chaves <code>pk_test_</code> e <code>sk_test_</code>
                </p>
              </div>
            )}
          </div>
        </FadeInOnScroll>

        {/* Stripe Stats (mock for demo) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Volume total', value: 84520, prefix: 'R$ ', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Transações', value: 456, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
            { label: 'Taxa de aprovação', value: 98, suffix: '%', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Chargebacks', value: 3, icon: TrendingUp, color: 'bg-red-50 text-red-600' },
          ].map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.05}>
              <div className="card-base p-5">
                <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-2`}><stat.icon size={16} /></div>
                <p className="font-display font-extrabold text-2xl text-surface-900">
                  {stat.prefix || ''}<NumberTicker value={stat.value} />{stat.suffix || ''}
                </p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Payment Methods Accepted */}
        <FadeInOnScroll className="mt-8">
          <div className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Métodos de Pagamento Aceitos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Cartão de Crédito', icon: '💳', desc: 'Visa, Mastercard, Elo, Amex' },
                { name: 'PIX', icon: '⚡', desc: 'Instantâneo via Stripe' },
                { name: 'Boleto', icon: '📄', desc: '1-3 dias úteis' },
                { name: 'Cartão de Débito', icon: '🏦', desc: 'Débito à vista' },
              ].map((pm) => (
                <div key={pm.name} className="p-4 bg-surface-50 rounded-xl text-center">
                  <span className="text-2xl">{pm.icon}</span>
                  <p className="text-sm font-semibold text-surface-900 mt-1">{pm.name}</p>
                  <p className="text-xs text-surface-400">{pm.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
