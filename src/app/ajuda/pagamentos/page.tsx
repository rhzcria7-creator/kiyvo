'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { FileText } from 'lucide-react'

export default function Page() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FileText size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Pagamentos
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Formas de pagamento e regras
          </p>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Quais formas de pagamento são aceitas?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">PIX (instantâneo), cartão de crédito (Visa, Mastercard, Elo), boleto bancário, saldo Kiyvo e KD Points.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como funciona o Escrow?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">O pagamento fica retido pela Kiyvo. O vendedor só recebe após o comprador confirmar o recebimento. Prazo: 4-7 dias.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Posso combinar formas de pagamento?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Sim! Combine saldo Kiyvo + cartão, ou KD Points + PIX para completar o valor.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">PIX: como funciona?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Após confirmar o pedido, um QR Code é gerado. Escaneie com seu banco. Confirmação em segundos.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.4}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Reembolso: quanto tempo?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">PIX: até 1 dia útil. Cartão: até 2 faturas. Saldo Kiyvo: instantâneo.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
