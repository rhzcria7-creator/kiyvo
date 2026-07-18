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
            Vendas
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Comece a vender na Kiyvo
          </p>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como me tornar vendedor?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Crie sua conta, complete a verificação KYC e ative o perfil de vendedor em Configurações → Vendedor.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Quais são as taxas?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Prata: 9,99%. Ouro: 11,99% com destaque. Diamante: 12,99% com máximo destaque e benefícios exclusivos.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como anunciar um produto?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Clique "Anunciar", preencha título, descrição, preço, categoria e imagens. Revisão em até 6h.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como receber pagamentos?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Pagamentos ficam em Escrow até confirmação do comprador. Após liberação, solicite saque via PIX.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.4}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que é o Cofre Digital?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Armazena chaves de licença, credenciais e links de download de forma segura. Entrega automática ao comprador.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
