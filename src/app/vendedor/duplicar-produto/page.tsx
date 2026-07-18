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
            <span className="text-4xl">📋</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Duplicar Produto
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Quando usar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">A duplicação é útil quando você tem produtos similares que diferem em poucos detalhes (ex: versões diferentes de uma licença, pacotes com quantidades diferentes). Em vez de criar cada anúncio do zero, duplique e ajuste apenas o que muda.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como duplicar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Na lista de produtos, clique nos três pontos → "Duplicar". O sistema cria uma cópia com status de rascunho. Edite título, preço, descrição, estoque e imagens. Revise tudo antes de publicar. Produtos duplicados herdam as imagens e tags do original.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
