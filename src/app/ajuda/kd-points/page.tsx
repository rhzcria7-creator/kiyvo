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
            <span className="text-4xl">⭐</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            KD Points — Programa de Recompensas
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que são KD Points</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">KD Points são pontos de recompensa que você acumula a cada compra no KIYVO. Cada R$ 1,00 gasto equivale a 1 KD Point. Os pontos podem ser trocados por descontos em compras futuras, produtos exclusivos ou cashback. Quanto mais você compra, mais pontos ganha — e membros com planos superiores ganham pontos em dobro.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como acumular</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Compras: 1 KD Point por R$ 1 gasto. Avaliações: 10 KD Points por avaliação aprovada. Indicações: 50 KD Points quando seu indicado faz a primeira compra. Desafios: ganhe pontos extras em promoções sazonais. Login diário: 2 KD Points por dia de acesso consecutivo.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como usar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">No checkout, selecione "Usar KD Points" e escolha quantos pontos deseja aplicar. 100 KD Points = R$ 1,00 de desconto. Você pode combinar KD Points com cupons e promoções. Os pontos expiram em 12 meses sem uso — confira seu saldo em Minha Conta → KD Points.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
