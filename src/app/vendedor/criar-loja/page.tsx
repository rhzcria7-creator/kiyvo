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
            <span className="text-4xl">🏪</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Criar sua Loja
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Primeiros passos</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Para criar sua loja, complete a verificação KYC (documento + selfie + comprovante). Após aprovação (até 24h), configure o nome da loja, logo, descrição e banner. Escolha o plano (Prata, Ouro ou Diamante) e configure os dados bancários para recebimento.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Personalização</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Adicione logo e banner da loja. Escreva uma descrição atrativa — ela aparece na página do vendedor. Configure horário de atendimento e tempo médio de resposta. Adicione redes sociais. Escolha um slug personalizado para sua URL (ex: kiyvo.com/v/sua-loja).</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
