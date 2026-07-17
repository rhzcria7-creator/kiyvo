'use client'

import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RotateCcw, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/ui/AdvancedAnimations'

export default function CheckoutCanceladoPage() {
  return (
    <PageTransition>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <XCircle size={80} className="text-red-400 mx-auto mb-6" />
          </motion.div>

          <FadeInOnScroll delay={0.3}>
            <h1 className="font-display font-extrabold text-3xl text-surface-900">Pagamento Cancelado</h1>
            <p className="text-surface-500 mt-3">O pagamento não foi concluído. Nenhum valor foi cobrado.</p>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.5}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/categorias">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary py-3 px-6 flex items-center gap-2">
                  <RotateCcw size={18} /> Tentar Novamente
                </motion.button>
              </Link>
              <Link href="/suporte">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-secondary py-3 px-6 flex items-center gap-2">
                  <MessageSquare size={18} /> Falar com Suporte
                </motion.button>
              </Link>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.7}>
            <p className="text-sm text-surface-400 mt-8">
              Problemas com o pagamento?{' '}
              <Link href="/suporte" className="text-brand-600 hover:underline font-medium">Contate nosso suporte</Link>
            </p>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
