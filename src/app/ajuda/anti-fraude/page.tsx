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
            <span className="text-4xl">🛡️</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Proteção Anti-Fraude
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Sistema de Detecção de Fraude</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">O KIYVO utiliza um sistema multi-camadas de detecção de fraude que analisa cada transação em tempo real. Nosso algoritmo avalia mais de 20 sinais de risco, incluindo velocidade de compra, valor da transação, histórico de disputas, fingerprint do dispositivo e localização do IP. Transações com score de risco alto são automaticamente bloqueadas e enviadas para revisão manual.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Escrow — Seu Dinheiro Protegido</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Todo pagamento no KIYVO passa pelo sistema de Escrow: o dinheiro fica retido pela plataforma e só é liberado ao vendedor após o comprador confirmar o recebimento do produto. Se o produto não for entregue ou estiver diferente do anunciado, o comprador recebe reembolso integral. Esse sistema elimina o risco de golpe para o comprador.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Verificação de Identidade (KYC)</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Vendedores precisam completar a verificação KYC (Know Your Customer) antes de anunciar. Isso inclui documento de identidade com foto, comprovante de residência e selfie. A verificação é processada em até 24h e garante que todos os vendedores são reais e identificáveis.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Monitoramento 24/7</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Nossa equipe de segurança monitora a plataforma 24 horas por dia, 7 dias por semana. Atividades suspeitas como tentativas de phishing, contas falsas e padrões de golpe são detectadas e bloqueadas automaticamente. Em caso de incidente, nossa equipe responde em menos de 15 minutos.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.4}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que fazer se suspeitar de fraude?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Se você suspeitar de qualquer atividade fraudulenta: 1) Não finalize a compra; 2) Denuncie o anúncio usando o botão "Reportar"; 3) Entre em contato com nosso suporte pelo chat; 4) Se já comprou, abra uma disputa imediatamente. O KIYVO garante reembolso total em casos de fraude comprovada.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
