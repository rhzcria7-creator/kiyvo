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
            <span className="text-4xl">🤝</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Programa de Afiliados
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como funciona</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Afiliados recebem um link único (ex: kiyvo.com/?ref=CODIGO). Quando alguém compra através desse link, o afiliado ganha comissão de 5% sobre o valor da venda. A comissão fica pendente por 30 dias (período de disputa) e depois é liberada para saque.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Gerenciar afiliados</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Aprove ou rejeite candidaturas de afiliados. Defina comissões personalizadas por afiliado. Monitore conversões, cliques e receita gerada. Identifique afiliados com melhor performance. Bloqueie afiliados que violem as regras (spam, fraude de cliques).</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Relatórios</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Veja métricas agregadas: total de afiliados ativos, receita gerada, comissões pagas, taxa de conversão média. Filtre por período, categoria de produto ou afiliado específico. Compare performance entre afiliados. Exporte dados para análise.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
