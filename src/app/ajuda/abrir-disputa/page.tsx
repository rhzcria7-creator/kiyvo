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
            <span className="text-4xl">⚖️</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Abrir uma Disputa
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Quando abrir uma disputa</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Abra uma disputa quando: o produto não foi entregue; o produto está diferente do anunciado; a chave/licença não funciona; o vendedor não responde após 48h; ou houve cobrança indevida. Você tem até 7 dias após a compra para abrir disputa.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como abrir</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">1) Acesse Minha Conta → Compras; 2) Encontre o pedido e clique em "Abrir Disputa"; 3) Selecione o motivo e descreva o problema detalhadamente; 4) Anexe prints ou evidências; 5) Aguarde a resposta do vendedor (até 72h). Se não houver acordo, o KIYVO intervém e decide com base nas evidências.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Resolução e reembolso</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Se a disputa for favorável ao comprador, o reembolso é processado em até 5 dias úteis. O valor volta para o método de pagamento original (PIX, cartão). Em casos de fraude comprovada, o reembolso é imediato e o vendedor é penalizado. Disputas resolvidas a favor do vendedor encerram o escrow e liberam o pagamento.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
