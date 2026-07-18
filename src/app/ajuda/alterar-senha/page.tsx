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
            <span className="text-4xl">🔑</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Alterar Senha
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como alterar sua senha</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Para alterar sua senha, acesse Minha Conta → Segurança → Alterar Senha. Digite sua senha atual e a nova senha. A nova senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números. Recomendamos usar um gerenciador de senhas para criar senhas fortes e únicas.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Esqueceu a senha?</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Se esqueceu sua senha, clique em "Esqueceu a senha?" na tela de login. Enviaremos um link de redefinição para seu email cadastrado. O link é válido por 1 hora. Se não receber o email, verifique a pasta de spam ou lixo eletrônico.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Segurança da senha</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Nunca compartilhe sua senha com ninguém. O KIYVO nunca pedirá sua senha por email, chat ou telefone. Use uma senha diferente da que usa em outros sites. Ative a autenticação de dois fatores (2FA) para proteção extra — mesmo que alguém descubra sua senha, não conseguirá acessar sem o código do 2FA.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
