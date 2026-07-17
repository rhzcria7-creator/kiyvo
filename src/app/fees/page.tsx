'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, ScaleInOnScroll } from '@/components/animations'
import { Button } from '@/components/ui/Button'
import { FeeEngine, formatBRL } from '@/domain/fees/FeeEngine'
import { Calculator, ArrowRight, Shield, Users, Store, CreditCard, Zap, CheckCircle, Info } from 'lucide-react'

const feeEngine = new FeeEngine()

const sellerPlans = [
  { name: 'Grátis', fee: '7%', discount: '0%', price: 'Grátis' },
  { name: 'Starter', fee: '6,3%', discount: '10% off', price: 'R$ 19,90/mês' },
  { name: 'Pro', fee: '5,25%', discount: '25% off', price: 'R$ 49,90/mês' },
  { name: 'Business', fee: '4,2%', discount: '40% off', price: 'R$ 99,90/mês' },
  { name: 'Enterprise', fee: '3,5%', discount: '50% off', price: 'Sob consulta' },
]

export default function FeesPage() {
  // Calcular exemplos
  const exampleCalc = feeEngine.calculate({ price: 29.90, sellerPlan: 'free', paymentMethod: 'pix' })
  const exampleCalcPro = feeEngine.calculate({ price: 29.90, sellerPlan: 'pro', paymentMethod: 'pix' })

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Hero */}
        <FadeInOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/40 rounded-full mb-4">
              <Shield size={14} className="text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300 font-display">Transparência Total</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl lg:text-5xl text-surface-900 dark:text-white leading-tight">
              Taxas justas,<br />
              <span className="gradient-text">zero surpresas</span>
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-4 max-w-xl mx-auto text-lg">
              Entenda cada centavo. Comprador e vendedor sempre sabem exatamente quanto pagam e recebem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/fees/calculator">
                <Button size="lg" icon={<Calculator size={18} />}>
                  Simular Taxas
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </div>
        </FadeInOnScroll>

        {/* How it works */}
        <FadeInOnScroll className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-8">
            Como funcionam as taxas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users size={24} className="text-brand-600 dark:text-brand-400" />,
                title: 'Comprador',
                desc: 'Paga o preço do produto + uma pequena taxa de serviço (0,7%). Total transparência no checkout.',
                example: `R$ 29,90 + R$ ${exampleCalc.buyerServiceFee.toFixed(2)} = R$ ${exampleCalc.totalBuyerPays.toFixed(2)}`,
              },
              {
                icon: <Store size={24} className="text-emerald-600 dark:text-emerald-400" />,
                title: 'Vendedor',
                desc: 'Recebe o valor líquido após a taxa de marketplace. Quanto mais vende, menor a taxa.',
                example: `R$ 29,90 - taxas = R$ ${exampleCalc.netSellerAmount.toFixed(2)}`,
              },
              {
                icon: <CreditCard size={24} className="text-purple-600 dark:text-purple-400" />,
                title: 'Gateway',
                desc: 'Taxa do processador de pagamento (Stripe). Varia por método: PIX é o mais barato.',
                example: `PIX: R$ ${feeEngine.calculate({ price: 29.90, sellerPlan: 'free', paymentMethod: 'pix' }).paymentProcessorFee.toFixed(2)} | Cartão: R$ ${feeEngine.calculate({ price: 29.90, sellerPlan: 'free', paymentMethod: 'credit_card' }).paymentProcessorFee.toFixed(2)}`,
              },
            ].map((item, i) => (
              <ScaleInOnScroll key={item.title} delay={i * 0.1}>
                <div className="card-base p-6 h-full">
                  <div className="w-12 h-12 bg-surface-50 dark:bg-surface-800 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{item.desc}</p>
                  <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-950/30 rounded-lg">
                    <p className="text-xs font-mono font-semibold text-brand-700 dark:text-brand-300">{item.example}</p>
                  </div>
                </div>
              </ScaleInOnScroll>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Breakdown Example */}
        <FadeInOnScroll className="mb-16">
          <div className="card-base p-6 lg:p-8">
            <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-6">
              Exemplo: Venda de R$ 29,90 via PIX
            </h3>
            <div className="space-y-3">
              {exampleCalc.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-surface-400">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      item.payer === 'buyer' ? 'text-blue-600 dark:text-blue-400' :
                      item.payer === 'seller' ? 'text-surface-600 dark:text-surface-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`}>
                      {formatBRL(item.amount)}
                    </p>
                    <p className="text-xs text-surface-400">{item.percent.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t-2 border-surface-200 dark:border-surface-700">
                <div>
                  <p className="font-display font-bold text-surface-900 dark:text-white">Vendedor recebe</p>
                  <p className="text-xs text-surface-400">Plano Grátis via PIX</p>
                </div>
                <p className="font-display font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                  {formatBRL(exampleCalc.netSellerAmount)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle size={14} /> Com plano Pro, o vendedor receberia {formatBRL(exampleCalcPro.netSellerAmount)} (+{formatBRL(exampleCalcPro.netSellerAmount - exampleCalc.netSellerAmount)})
              </p>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Seller Plans Comparison */}
        <FadeInOnScroll className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-8">
            Menos taxa, mais lucro
          </h2>
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-800/50">
                    <th className="px-4 py-3 text-left font-display font-semibold text-surface-600 dark:text-surface-400">Plano</th>
                    <th className="px-4 py-3 text-center font-display font-semibold text-surface-600 dark:text-surface-400">Taxa Vendedor</th>
                    <th className="px-4 py-3 text-center font-display font-semibold text-surface-600 dark:text-surface-400">Desconto</th>
                    <th className="px-4 py-3 text-center font-display font-semibold text-surface-600 dark:text-surface-400">Vendedor Recebe*</th>
                    <th className="px-4 py-3 text-right font-display font-semibold text-surface-600 dark:text-surface-400">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {sellerPlans.map((plan, i) => {
                    const planKey = ['free', 'starter', 'pro', 'business', 'enterprise'][i] as 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
                    const calc = feeEngine.calculate({ price: 29.90, sellerPlan: planKey, paymentMethod: 'pix' })
                    return (
                      <tr key={plan.name} className={planKey === 'pro' ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''}>
                        <td className="px-4 py-3 font-display font-bold text-surface-900 dark:text-white">
                          {plan.name}
                          {planKey === 'pro' && <span className="ml-2 text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">Popular</span>}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-surface-700 dark:text-surface-300">{plan.fee}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{plan.discount}</td>
                        <td className="px-4 py-3 text-center font-display font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(calc.netSellerAmount)}</td>
                        <td className="px-4 py-3 text-right text-surface-600 dark:text-surface-400">{plan.price}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 text-xs text-surface-400 text-center">
              * Exemplo: venda de R$ 29,90 via PIX
            </div>
          </div>
        </FadeInOnScroll>

        {/* CTA */}
        <FadeInOnScroll>
          <div className="text-center">
            <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-4">
              Simule suas taxas agora
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              Calcule exatamente quanto você vai receber em cada venda
            </p>
            <Link href="/fees/calculator">
              <Button size="lg" icon={<Calculator size={18} />}>
                Abrir Simulador
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
