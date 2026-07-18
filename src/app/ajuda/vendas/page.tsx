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
            <span className="text-4xl">💰</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Ajuda com Vendas
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como vender no KIYVO</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Crie sua conta, complete a verificação KYC e configure sua loja. Clique em "Anunciar" para criar um produto. Preencha título, descrição, preço, categoria e faça upload das imagens. Para produtos digitais, faça upload do arquivo no Cofre Digital — a entrega é automática após cada compra.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Taxas e comissões</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">A comissão do KIYVO varia conforme o plano: Prata (9,99%), Ouro (11,99%) e Diamante (12,99%). A comissão só é cobrada quando você vende. O plano Diamante inclui destaque nos resultados de busca e suporte prioritário. Você pode trocar de plano a qualquer momento.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Recebendo pagamentos</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Após o comprador confirmar o recebimento (ou após 7 dias sem contestação), o valor fica disponível para saque. Solicite saque via PIX — retirada Normal (grátis, até 2 dias úteis) ou Turbo (R$ 3,50, instantânea). O valor mínimo para saque é R$ 20,00.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
