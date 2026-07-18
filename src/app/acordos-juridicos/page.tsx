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
            Acordos Jurídicos
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Termos de Uso</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Os Termos de Uso regulam o acesso e uso da plataforma KIYVO. Ao criar uma conta, você concorda com os termos vigentes. Principais pontos: responsabilidade sobre conteúdos publicados, obrigatoriedade de informações verdadeiras no cadastro, proibição de atividades ilegais e respeito aos direitos autorais. Os termos podem ser atualizados com aviso prévio de 30 dias.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Política de Privacidade</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">A LGPD (Lei Geral de Proteção de Dados) é a base da nossa política de privacidade. Coletamos apenas dados necessários para operação da plataforma. Seus dados nunca são vendidos a terceiros. Você pode solicitar a qualquer momento: acesso aos seus dados, correção, exclusão ou portabilidade. Contate privacidade@kiyvo.com para exercer seus direitos.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Direitos autorais</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">O KIYVO respeita a propriedade intelectual. Vendedores declaram ter os direitos sobre os produtos digitais que anunciam. Denúncias de violação de direitos autorais são tratadas com prioridade. Se seu conteúdo foi copiado sem autorização, envie uma notificação DMCA para legal@kiyvo.com com: identificação do conteúdo, localização no KIYVO, e declaração de boa-fé.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
