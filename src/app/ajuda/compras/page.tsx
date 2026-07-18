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
            Compras
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Tudo sobre compras na Kiyvo
          </p>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como comprar um produto?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Navegue pelo marketplace, encontre o produto e clique "Comprar Agora". Escolha a forma de pagamento, confirme e aguarde a entrega.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O pagamento é seguro?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Sim. Utilizamos Escrow: seu dinheiro fica retido pela Kiyvo e só é liberado ao vendedor após você confirmar o recebimento.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">E se eu não receber o produto?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Abra uma disputa em até 7 dias após a compra. Nossa equipe analisará e, se procedente, você receberá reembolso integral.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Posso cancelar uma compra?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Sim, enquanto o produto não foi entregue. Após a entrega, abra uma disputa caso haja problemas.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.4}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Quanto tempo leva a entrega?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Produtos com entrega automática: segundos. Produtos manuais: até 24h, dependendo do vendedor.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
