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
            Seguranca
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Proteção para compradores e vendedores
          </p>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">A Kiyvo é segura?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Sim. Criptografia TLS/SSL, 2FA, Escrow para pagamentos, verificação KYC e monitoramento anti-fraude 24/7.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que é verificação KYC?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Verificação de identidade com CPF, documento com foto e selfie. Vendedores verificados recebem badge de confiança.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como denunciar fraude?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Acesse Centro de Segurança → Denunciar, ou abra uma disputa no pedido. Denúncias anônimas são aceitas.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como evitar golpes?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Só compre de vendedores verificados. Nunca pague fora da plataforma. Confira avaliações antes de comprar.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.4}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Programa de Integridade</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Detecta comportamentos suspeitos como vendas duplicadas, preços irreais ou contas falsas. Infratores são banidos.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
