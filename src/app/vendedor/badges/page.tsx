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
            <span className="text-4xl">🏅</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Badges e Certificações
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Badges disponíveis</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">🥈 Prata: vendedor verificado com mais de 10 vendas. 🥇 Ouro: mais de 100 vendas e avaliação ≥ 4.5. 💎 Diamante: mais de 500 vendas e avaliação ≥ 4.7. ✅ Verificado: identidade confirmada via KYC. ⚡ Entrega Rápida: 95%+ entregas em menos de 1h. 🛡️ Confiável: zero disputas nos últimos 90 dias.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como conquistar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Badges são conquistados automaticamente baseado em métricas. Foque em: entregas rápidas (mantenha estoque no Cofre Digital), boa comunicação (responda em menos de 1h), descrições precisas (evite disputas) e volume de vendas. Badges aumentam a confiança do comprador e melhoram o posicionamento nos resultados.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
