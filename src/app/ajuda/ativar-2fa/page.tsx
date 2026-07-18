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
            <span className="text-4xl">🔐</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Ativar Autenticação de Dois Fatores
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">O que é 2FA?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">A autenticação de dois fatores (2FA) adiciona uma camada extra de segurança à sua conta. Além da senha, você precisa de um código gerado pelo seu celular. Mesmo que alguém descubra sua senha, não conseguirá acessar sua conta sem o código 2FA.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como ativar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">1) Acesse Minha Conta → Segurança → 2FA; 2) Clique em "Ativar 2FA"; 3) Escaneie o QR Code com seu app autenticador (Google Authenticator, Authy, etc.); 4) Digite o código de 6 dígitos para confirmar; 5) Salve seus códigos de backup em local seguro.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Códigos de backup</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Ao ativar o 2FA, você receberá 10 códigos de backup. Guarde-os em local seguro — cada código pode ser usado apenas uma vez. Se perder o acesso ao seu app autenticador, use um código de backup para entrar. Quando restarem 3 ou menos códigos, gere novos em Minha Conta → Segurança.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.30000000000000004}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">E se perder o acesso?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Se perdeu o acesso ao app autenticador E aos códigos de backup, entre em contato com nosso suporte. Precisaremos verificar sua identidade com documento com foto para desativar o 2FA e permitir que você reconfigure. Esse processo leva até 48h por segurança.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
