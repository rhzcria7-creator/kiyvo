'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'

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
            <span className="text-4xl">📊</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Comissões e Taxas
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Planos de vendedor</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Prata: comissão de 9,99% por venda. Ideal para quem está começando. Ouro: comissão de 11,99% + destaque nos resultados + badge dourado + suporte prioritário. Diamante: comissão de 12,99% + destaque premium + badge diamante + suporte VIP + KD Points em dobro para compradores. Troque de plano a qualquer momento.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Taxas adicionais</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Taxa de saque Turbo: R$ 3,50 por retirada instantânea. Taxa de chargeback: R$ 15,00 (se o comprador contestar no cartão). Sem taxas de listagem, mensalidade ou setup. Você só paga quando vende. O valor líquido já desconta a comissão — o que você vê é o que você recebe.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
