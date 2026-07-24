// ─────────────────────────────────────────────────────────────
// KIYVO — Tutorial: Como Vender
// Guia completo para vendedores digitais
// ─────────────────────────────────────────────────────────────

'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, ScaleInOnScroll } from '@/components/animations'
import { Package, Shield, Upload, CreditCard, TrendingUp, ArrowRight, CheckCircle, Lock, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

const sellSteps = [
  { icon: Shield, title: 'Verifique sua identidade (KYC)', desc: 'Processo rápido: CPF, documento com foto, selfie e comprovante de residência. Seus dados são criptografados com AES-256.' },
  { icon: Package, title: 'Crie seu anúncio', desc: 'Título claro, descrição detalhada, imagens de qualidade. Quanto mais completo, mais vendas.' },
  { icon: Upload, title: 'Upload no Cofre Digital', desc: 'Seus arquivos ficam criptografados com AES-256-GCM. Impossível copiar antes da venda. Entrega automática e instantânea.' },
  { icon: CreditCard, title: 'Receba com segurança', desc: 'Comprador paga → dinheiro vai para Escrow → ele confirma recebimento → você recebe. Sem risco de chargeback.' },
  { icon: TrendingUp, title: 'Escale suas vendas', desc: 'Suba de nível: Bronze → Prata → Ouro → Diamante. Mais vendas = mais visibilidade = mais dinheiro.' },
]

const plans = [
  { name: 'Prata', fee: '9,99%', color: 'from-surface-400 to-surface-500', features: ['Anúncio padrão', 'Suporte por ticket', 'Retirada em 2 dias'] },
  { name: 'Ouro', fee: '11,99%', color: 'from-amber-400 to-amber-600', popular: true, features: ['Tudo do Prata', 'Destaque na busca', 'Badge Ouro', 'Mais KD Points'] },
  { name: 'Diamante', fee: '12,99%', color: 'from-brand-400 to-brand-600', features: ['Tudo do Ouro', 'Destaque máximo', 'Badge Diamante', 'Suporte prioritário', 'Relatórios avançados'] },
]

const antiCopy = [
  'Arquivos criptografados com AES-256-GCM no Cofre Digital',
  'Descriptografia só ocorre após confirmação de pagamento',
  'Download tokens com expiração — impossível compartilhar link',
  'Marca d\'água digital invisível em cada entrega',
  'Detecção de compartilhamento por fingerprint do comprador',
  'Rate limiting rigoroso para evitar downloads em massa',
]

export default function TutorialVenderPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30"
          >
            <TrendingUp size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Como Vender no Kiyvo
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Transforme seus produtos digitais em renda — cadastro grátis, entrega automática, zero risco
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-16">
          {sellSteps.map((step, i) => (
            <FadeInOnScroll key={step.title}>
              <div className="flex items-start gap-5 card-base p-6 hover:shadow-card-hover transition-shadow">
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center`}>
                    <step.icon size={22} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Anti-Cópia */}
        <FadeInOnScroll className="mb-16">
          <div className="card-base p-8 bg-gradient-to-br from-surface-900 to-surface-800 text-white border-0">
            <h2 className="font-display font-extrabold text-2xl mb-6 flex items-center gap-3">
              <Lock size={24} className="text-brand-400" />
              Proteção Anti-Cópia — Seus Produtos Seguros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {antiCopy.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-brand-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-surface-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Planos */}
        <FadeInOnScroll className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6 text-center">Planos de Vendedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <ScaleInOnScroll key={plan.name}>
                <div className={`card-base p-6 text-center relative ${plan.popular ? 'ring-2 ring-brand-500 scale-[1.02]' : ''}`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full">Mais Popular</span>
                  )}
                  <div className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Crown size={24} className="text-white" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">{plan.name}</h3>
                  <p className="font-display font-extrabold text-3xl text-brand-600 dark:text-brand-400 mt-2">{plan.fee}</p>
                  <p className="text-xs text-surface-400 mt-1">por venda</p>
                  <div className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                        <CheckCircle size={14} className="text-emerald-500" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </ScaleInOnScroll>
            ))}
          </div>
        </FadeInOnScroll>

        {/* CTA */}
        <FadeInOnScroll className="text-center">
          <Link href="/vender" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            <Zap size={20} /> Começar a Vender
          </Link>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
