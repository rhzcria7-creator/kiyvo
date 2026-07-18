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
            <span className="text-4xl">⚡</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Entrega Automática (Cofre Digital)
          </h1>
        </motion.div>

        <div className="space-y-4">
          <FadeInOnScroll delay={0}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Como funciona</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">A entrega automática é o recurso mais poderoso do KIYVO para vendedores digitais. Você faz upload do arquivo (chave, licença, PDF, ZIP, etc.) no Cofre Digital. Quando um comprador efetua o pagamento, o sistema entrega o conteúdo automaticamente em segundos — sem intervenção manual.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Configurar</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Ao criar um produto, selecione "Entrega Automática". Faça upload do arquivo no Cofre Digital (até 500MB). Configure a quantidade em estoque. Cada venda consome um item do estoque. Quando o estoque chegar a zero, o anúncio fica automaticamente indisponível. Recarregue o estoque a qualquer momento.</p>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="card-base p-6">
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-2">Tipos de arquivo suportados</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">Chaves de ativação (texto), PDFs, arquivos ZIP/RAR, imagens, documentos Office, executáveis. Cada item no cofre pode ser um arquivo único ou um código de ativação. O conteúdo é armazenado criptografado e entregue via signed URL temporária (24h de acesso).</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
