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
            <span className="text-4xl">📦</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Gerenciar Produtos
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Criar produto</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Clique em "Novo Produto". Preencha: título (até 200 caracteres), descrição (suporta HTML), preço, categoria, tipo de entrega (automática ou manual), tags. Adicione até 10 imagens. Para entrega automática, faça upload do arquivo digital no Cofre Digital.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Cofre Digital</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">O Cofre Digital armazena os arquivos digitais de forma segura e criptografada. Quando um comprador efetua o pagamento, o sistema entrega automaticamente o conteúdo. Cada item no cofre pode ser usado apenas uma vez — configure o estoque adequadamente.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
