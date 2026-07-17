'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Button } from '@/components/ui/Button'
import { FeeEngine, formatBRL, type FeeCalculation, type SellerPlan, type PaymentMethod } from '@/domain/fees/FeeEngine'
import { Calculator, Info, ChevronDown, ChevronUp, ArrowRight, DollarSign, Users, Store, CreditCard, Zap } from 'lucide-react'

const feeEngine = new FeeEngine()

const pricePresets = [5, 10, 29.90, 50, 100, 500, 1000, 5000]
const sellerPlans: { value: SellerPlan; label: string; desc: string }[] = [
  { value: 'free', label: 'Grátis', desc: 'Sem desconto na taxa' },
  { value: 'starter', label: 'Starter', desc: '10% off na taxa' },
  { value: 'pro', label: 'Pro', desc: '25% off na taxa' },
  { value: 'business', label: 'Business', desc: '40% off na taxa' },
  { value: 'enterprise', label: 'Enterprise', desc: '50% off na taxa' },
]

const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'credit_card', label: 'Cartão', icon: '💳' },
  { value: 'debit_card', label: 'Débito', icon: '💳' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
]

export default function FeesCalculatorPage() {
  const [price, setPrice] = useState(29.90)
  const [sellerPlan, setSellerPlan] = useState<SellerPlan>('free')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [hasAffiliate, setHasAffiliate] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const calculation: FeeCalculation = useMemo(() => {
    return feeEngine.calculate({
      price,
      sellerPlan,
      paymentMethod,
      hasAffiliate,
    })
  }, [price, sellerPlan, paymentMethod, hasAffiliate])

  const allMethodsCalc = useMemo(() => {
    const results: { method: PaymentMethod; calc: FeeCalculation }[] = []
    for (const method of paymentMethods) {
      results.push({
        method: method.value,
        calc: feeEngine.calculate({ price, sellerPlan, paymentMethod: method.value, hasAffiliate }),
      })
    }
    return results
  }, [price, sellerPlan, hasAffiliate])

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Header */}
        <FadeInOnScroll>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/40 rounded-full mb-4">
              <Calculator size={14} className="text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300 font-display">Simulador de Taxas</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white">
              Simulador de Taxas <span className="gradient-text">Kiyvo</span>
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-lg mx-auto">
              Entenda exatamente quanto cada parte recebe. Transparência total — sem surpresas.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Controls */}
          <FadeInOnScroll>
            <div className="card-base p-6 space-y-6">
              {/* Price */}
              <div>
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 block font-display">
                  Preço do Produto (R$)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                  min={1}
                  max={50000}
                  step={0.01}
                  className="input-base text-2xl font-display font-bold"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPrice(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                        Math.abs(price - preset) < 0.01
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-50 dark:hover:bg-brand-950/50'
                      }`}
                    >
                      R$ {preset.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seller Plan */}
              <div>
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 block font-display">
                  Plano do Vendedor
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {sellerPlans.map((plan) => (
                    <button
                      key={plan.value}
                      onClick={() => setSellerPlan(plan.value)}
                      className={`p-3 rounded-xl text-left transition-all border-2 ${
                        sellerPlan === plan.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                          : 'border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-sm text-surface-900 dark:text-white">{plan.label}</span>
                        <span className="text-xs text-surface-500 dark:text-surface-400">{plan.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 block font-display">
                  Método de Pagamento
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-3 rounded-xl text-center transition-all border-2 ${
                        paymentMethod === method.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                          : 'border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800'
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 mt-1">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Affiliate Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">Com afiliado</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">5% de comissão para o afiliado</p>
                </div>
                <button
                  onClick={() => setHasAffiliate(!hasAffiliate)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    hasAffiliate ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      hasAffiliate ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Right — Results */}
          <FadeInOnScroll delay={0.1}>
            <div className="space-y-4">
              {/* Main Result Card */}
              <div className="card-base p-6">
                <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Resumo Financeiro</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                      <Users size={14} /> Comprador paga
                    </span>
                    <span className="font-display font-extrabold text-lg text-brand-600 dark:text-brand-400">
                      {formatBRL(calculation.totalBuyerPays)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                      <Store size={14} /> Vendedor recebe
                    </span>
                    <span className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                      {formatBRL(calculation.netSellerAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                      <DollarSign size={14} /> Plataforma recebe
                    </span>
                    <span className="font-display font-bold text-sm text-surface-700 dark:text-surface-300">
                      {formatBRL(calculation.platformGrossRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                      <CreditCard size={14} /> Gateway
                    </span>
                    <span className="font-display font-bold text-sm text-surface-500 dark:text-surface-400">
                      {formatBRL(calculation.paymentProcessorFee)}
                    </span>
                  </div>
                  {hasAffiliate && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                        <Zap size={14} /> Afiliado
                      </span>
                      <span className="font-display font-bold text-sm text-purple-600 dark:text-purple-400">
                        {formatBRL(calculation.affiliateCommission)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-surface-400">Percentual total de taxas</span>
                    <span className="font-display font-bold text-xs text-surface-600 dark:text-surface-400">
                      {(calculation.totalFeePercent * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Toggle */}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full card-base p-4 flex items-center justify-between hover:shadow-card-hover dark:hover:shadow-dark-glow transition-shadow"
              >
                <span className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <Info size={16} className="text-brand-600 dark:text-brand-400" />
                  Detalhamento completo
                </span>
                {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="card-base p-5 space-y-2">
                      {calculation.breakdown.map((item, i) => (
                        <div key={i} className="flex justify-between items-start py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-surface-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-surface-400 mt-0.5">{item.description}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-sm font-bold text-surface-900 dark:text-white">{formatBRL(item.amount)}</p>
                            <p className="text-xs text-surface-400">{item.percent.toFixed(2)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comparison by Payment Method */}
              <div className="card-base p-6">
                <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white mb-4">
                  Comparação por método de pagamento
                </h3>
                <div className="space-y-3">
                  {allMethodsCalc.map(({ method, calc }) => {
                    const methodLabel = paymentMethods.find(m => m.value === method)?.label || method
                    const methodIcon = paymentMethods.find(m => m.value === method)?.icon || '💰'
                    return (
                      <div
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          paymentMethod === method
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                            : 'border-transparent hover:border-surface-200 dark:hover:border-surface-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{methodIcon}</span>
                            <span className="text-sm font-semibold text-surface-900 dark:text-white">{methodLabel}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              Vendedor: {formatBRL(calc.netSellerAmount)}
                            </p>
                            <p className="text-xs text-surface-400">
                              Gateway: {formatBRL(calc.paymentProcessorFee)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>

        {/* Price Table */}
        <FadeInOnScroll className="mt-12">
          <div className="card-base overflow-hidden">
            <div className="p-5 border-b border-surface-100 dark:border-surface-800">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">
                Tabela de Taxas por Faixa de Preço
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Plano {sellerPlans.find(p => p.value === sellerPlan)?.label} • {paymentMethods.find(m => m.value === paymentMethod)?.label}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-800/50">
                    <th className="px-4 py-3 text-left font-display font-semibold text-surface-600 dark:text-surface-400">Preço</th>
                    <th className="px-4 py-3 text-right font-display font-semibold text-surface-600 dark:text-surface-400">Comprador</th>
                    <th className="px-4 py-3 text-right font-display font-semibold text-surface-600 dark:text-surface-400">Vendedor</th>
                    <th className="px-4 py-3 text-right font-display font-semibold text-surface-600 dark:text-surface-400">Plataforma</th>
                    <th className="px-4 py-3 text-right font-display font-semibold text-surface-600 dark:text-surface-400">Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {pricePresets.map((preset) => {
                    const calc = feeEngine.calculate({
                      price: preset,
                      sellerPlan,
                      paymentMethod,
                      hasAffiliate,
                    })
                    return (
                      <tr
                        key={preset}
                        className={`hover:bg-surface-50 dark:hover:bg-surface-800/30 cursor-pointer transition-colors ${
                          Math.abs(price - preset) < 0.01 ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''
                        }`}
                        onClick={() => setPrice(preset)}
                      >
                        <td className="px-4 py-3 font-display font-bold text-surface-900 dark:text-white">
                          {formatBRL(preset)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-brand-600 dark:text-brand-400">
                          {formatBRL(calc.totalBuyerPays)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatBRL(calc.netSellerAmount)}
                        </td>
                        <td className="px-4 py-3 text-right text-surface-600 dark:text-surface-400">
                          {formatBRL(calc.platformGrossRevenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-surface-500 dark:text-surface-500">
                          {formatBRL(calc.paymentProcessorFee)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
