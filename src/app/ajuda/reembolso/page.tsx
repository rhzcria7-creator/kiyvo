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
            <span className="text-4xl">↩️</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Política de Reembolso
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Quando tenho direito a reembolso</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Você tem direito a reembolso integral quando: o produto não foi entregue; o produto está diferente do anunciado; a chave/licença não funciona; houve cobrança indevida; o vendedor não responde em 48h. O KIYVO garante reembolso em todos esses casos — sem burocracia.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como solicitar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">1) Acesse Minha Conta → Compras. 2) Encontre o pedido e clique "Abrir Disputa". 3) Selecione o motivo e descreva o problema. 4) Anexe evidências (prints, vídeos). 5) Aguarde a mediação. Se a disputa for favorável, o reembolso é processado em até 5 dias úteis no método de pagamento original.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Tipos de reembolso</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Reembolso integral: 100% do valor pago volta para o método original (PIX, cartão). Crédito KIYVO: recebe o valor em saldo da carteira (processamento mais rápido). KD Points: recebe pontos equivalentes como cortesia. Em caso de fraude comprovada, o reembolso é processado em até 24h.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
