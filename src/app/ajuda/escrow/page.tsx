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
            <span className="text-4xl">🔒</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Sistema de Escrow
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que é Escrow?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Escrow é um sistema de custódia onde o KIYVO retém o pagamento do comprador até que o produto seja entregue e confirmado. Isso elimina o risco de golpe: o comprador só paga quando tem certeza de que recebeu, e o vendedor só recebe quando a entrega é comprovada. É o mesmo sistema usado por plataformas como eBay e AliExpress.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como funciona</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">1) Comprador faz o pagamento → dinheiro vai para conta custódia do KIYVO. 2) Vendedor é notificado e entrega o produto. 3) Comprador confirma recebimento → dinheiro é liberado para o vendedor. 4) Se houver problema, o comprador abre disputa → KIYVO intermedeia e decide. O período padrão de auto-confirmação é de 7 dias.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Proteção ao comprador</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Se o produto não for entregue, estiver diferente do anunciado ou não funcionar, o comprador recebe reembolso integral. O dinheiro nunca vai direto para o vendedor — sempre passa pelo escrow. Chargebacks no cartão também são protegidos pelo sistema.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
