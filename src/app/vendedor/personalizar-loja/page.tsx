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
            <span className="text-4xl">🎨</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Personalizar sua Loja
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Elementos customizáveis</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Logo da loja (quadrado, 200x200px mínimo). Banner da loja (1200x300px). Nome da loja (único na plataforma). Descrição/bio (até 500 caracteres). Cor de destaque (personalize o tema da loja). Redes sociais (Instagram, Twitter, Discord). Slug personalizado (ex: kiyvo.com/v/minha-loja).</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Dicas de personalização</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Use logo profissional e em alta resolução. Banner deve comunicar o que você vende. Descrição curta e direta. Cor de destaque que combine com seu branding. Redes sociais ativas aumentam credibilidade. Slug fácil de lembrar e compartilhar.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
