'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { User, Shield, ShoppingBag, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const steps = [
  {
    icon: User,
    title: 'Bem-vindo à Kiyvo!',
    desc: 'O marketplace de tudo que é digital. Vamos configurar sua conta em 2 minutos.',
    action: { label: 'Completar perfil', href: '/perfil' },
  },
  {
    icon: Shield,
    title: 'Verifique sua identidade',
    desc: 'Para vender na Kiyvo, precisamos confirmar sua identidade. Processo rápido e seguro.',
    action: { label: 'Iniciar verificação', href: '/verificacao' },
  },
  {
    icon: ShoppingBag,
    title: 'Explore o catálogo',
    desc: 'Mais de 20 categorias de produtos digitais. Encontre exatamente o que procura.',
    action: { label: 'Ver categorias', href: '/categorias' },
  },
  {
    icon: CreditCard,
    title: 'Formas de pagamento',
    desc: 'PIX, cartão de crédito, boleto e mais. Tudo processado com segurança pela Stripe.',
    action: { label: 'Ver pagamentos', href: '/pagamentos' },
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const step = steps[current]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= current ? 'bg-brand-600' : 'bg-surface-200 dark:bg-surface-700'
              }`}
            />
          ))}
        </div>

        <div className="card-base p-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mx-auto mb-4">
                <step.icon size={32} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">{step.title}</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-sm mx-auto">{step.desc}</p>

              <div className="mt-6">
                <Link href={step.action.href}>
                  <Button size="lg" icon={<ArrowRight size={16} />} className="w-full">
                    {step.action.label}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 disabled:opacity-30 transition-colors"
            >
              <ArrowLeft size={14} /> Voltar
            </button>

            {current < steps.length - 1 ? (
              <button
                onClick={() => setCurrent(current + 1)}
                className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300"
              >
                Pular <ArrowRight size={14} />
              </button>
            ) : (
              <Link href="/dashboard" className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle size={14} /> Concluir
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-surface-400 mt-4">
          Passo {current + 1} de {steps.length}
        </p>
      </motion.div>
    </div>
  )
}
