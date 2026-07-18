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
            <span className="text-4xl">🎟️</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Gerenciar Cupons
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Criar cupom</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Clique em "Novo Cupom". Defina o código (ex: KIYVO10), tipo de desconto (percentual ou fixo), valor, validade, uso máximo e restrições de categoria. Cupons podem ser de uso único ou múltiplo. Defina valor mínimo de compra para ativação.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Tipos de cupom</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Percentual: desconto de X% no valor total. Fixo: desconto de R$ X no valor total. Frete grátis: isenta taxa de entrega. KD Points: bonifica X pontos na compra. Combo: combina desconto + pontos. Cada tipo tem regras específicas de aplicação e validação.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Monitoramento</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Acompanhe uso em tempo real: total de usos, usos restantes, receita gerada, ticket médio. Identifique cupons mais populares e taxas de conversão. Desative cupons com uso abusivo ou que não geram conversão. Exporte relatórios em CSV.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
