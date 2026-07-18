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
            <span className="text-4xl">💰</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Primeira Venda no KIYVO
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como fazer sua primeira venda</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">1) Complete a verificação KYC (documento + selfie + comprovante). 2) Configure sua loja com nome, logo e descrição. 3) Crie seu primeiro anúncio com título, preço e imagens. 4) Para produtos digitais, faça upload no Cofre Digital. 5) Compartilhe o link do anúncio nas redes sociais. 6) Quando vender, o dinheiro fica em escrow por 7 dias e depois é liberado para saque.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Dicas para vender mais</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Use fotos de alta qualidade e título descritivo com palavras-chave. Preço competitivo: pesquise anúncios similares. Responda perguntas rapidamente — vendedores que respondem em menos de 1h vendem 3x mais. Mantenha o estoque atualizado. Peça avaliações aos compradores — boas reviews aumentam a confiança.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
