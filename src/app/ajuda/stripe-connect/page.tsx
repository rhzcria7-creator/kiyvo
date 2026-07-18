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
            <span className="text-4xl">🏦</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Stripe Connect — Recebimentos
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que é Stripe Connect</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">O Stripe Connect é a infraestrutura de pagamentos do KIYVO. Ele permite que vendedores recebam pagamentos de forma segura e automatizada. Quando um comprador paga, o Stripe processa a transação, retém a comissão do KIYVO e direciona o valor líquido para a conta do vendedor. Tudo em conformidade com regulações financeiras brasileiras.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como configurar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">1) Acesse Minha Conta → Vendedor → Configurações Financeiras. 2) Clique em "Configurar Stripe Connect". 3) Você será redirecionado ao onboarding do Stripe. 4) Preencha dados pessoais e bancários. 5) Aguarde a verificação (até 48h). Após aprovado, os recebimentos são automáticos.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Recebimentos</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Após a liberação do escrow, o valor líquido é transferido automaticamente para sua conta bancária via PIX em até 2 dias úteis. Você pode acompanhar todas as transferências no dashboard do Stripe. O Stripe emite relatórios fiscais para declaração de imposto de renda.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
