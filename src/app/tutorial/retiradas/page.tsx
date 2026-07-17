'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Banknote } from 'lucide-react'

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
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Banknote size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Como Retirar seu Dinheiro
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Saque seus ganhos via PIX. Retirada Normal grátis ou Turbo instantânea.
          </p>
        </motion.div>

        <FadeInOnScroll>
          <div className="card-base p-8 text-center">
            <p className="text-surface-500 dark:text-surface-400">
              Conteúdo em construção. Em breve disponível com dados reais do Supabase.
            </p>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
