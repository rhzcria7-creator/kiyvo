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
            <span className="text-4xl">⚙️</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Configurações do Sistema
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Configurações gerais</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Nome da plataforma, URL, timezone, moeda padrão, idioma. Configure os dados de contato e links de redes sociais. Ajuste o período de escrow (padrão: 7 dias), taxa de comissão padrão e limites de saque.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Segurança</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Configure regras de rate limiting por endpoint. Ative/desative proteção anti-bot. Defina regras de bloqueio automático por IP. Configure CSP headers e CORS. Gerencie lista de IPs bloqueados e permitidos.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Notificações</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Configure templates de email para cada tipo de notificação. Ative/desative notificações push. Defina canais de alerta para eventos críticos (fraude, chargeback, sistema down). Configure integração com Slack ou Discord para alertas em tempo real.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
