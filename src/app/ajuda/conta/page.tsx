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
            Conta
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Gerencie sua conta Kiyvo com facilidade
          </p>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como alterar meu e-mail?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Acesse Configurações → Conta → E-mail. Insira o novo e-mail e confirme via link de verificação. Por segurança, a alteração requer confirmação no e-mail atual.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como alterar minha senha?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Vá em Configurações → Segurança → Alterar senha. Digite a senha atual e a nova senha. Recomendamos senhas fortes com 12+ caracteres.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como ativar 2FA?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Em Configurações → Segurança → Autenticação em 2 passos, escaneie o QR code com app autenticador (Google Authenticator, Authy). Guarde os códigos de backup.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como excluir minha conta?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Acesse Configurações → Conta → Excluir conta. Você terá 30 dias para reativar. Após esse prazo, todos os dados são removidos permanentemente.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.4}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como alterar meu username?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Em Configurações → Perfil → Username, digite o novo nome. Disponibilidade verificada em tempo real. Alterações limitadas a 1 por mês.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
