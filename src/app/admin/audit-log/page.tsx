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
            <span className="text-4xl">📋</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Log de Auditoria
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que é o Log de Auditoria</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">O log de auditoria registra todas as ações realizadas na plataforma: logins, compras, vendas, alterações de configuração, bloqueios e desbloqueios. Cada entrada inclui timestamp, usuário, ação, recurso afetado e endereço IP. Os logs são imutáveis e retidos por 90 dias.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como usar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Filtre os logs por data, tipo de ação, usuário ou severidade. Logs críticos (chargebacks, fraudes, bloqueios) são marcados em vermelho. Use a busca para encontrar ações específicas. Exporte logs em CSV para análise externa. Logs de ações administrativas são sinalizados com badge "Admin".</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Severidades</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Info: ações normais (login, compra, venda). Warning: atividades suspeitas (múltiplas tentativas de login, alteração de dados sensíveis). Error: falhas do sistema. Critical: fraudes confirmadas, chargebacks, violações de segurança. Ajuste alertas automáticos para cada severidade em Configurações.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
