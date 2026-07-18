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
            <span className="text-4xl">🔍</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            SEO para Anúncios
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Otimize seus anúncios para buscas</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Título: use palavras-chave relevantes no início. Ex: "Minecraft Java Edition — Key Original" ao invés de "Vendo key MC". Descrição: inclua termos de busca naturalmente. Tags: adicione todas as tags relevantes. Categoria: escolha a mais específica. Imagens: nomeie os arquivos com palavras-chave (ex: minecraft-java-key.jpg).</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Dicas avançadas</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Use sinônimos e variações de termos na descrição. Responda perguntas com palavras-chave. Mantenha anúncios atualizados — algoritmo favorece conteúdo recente. Peça avaliações — anúncios com mais reviews aparecem primeiro. Use o plano Diamante para destaque nos resultados.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
