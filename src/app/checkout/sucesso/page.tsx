'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Package, MessageSquare, Star } from 'lucide-react'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, MorphingBlob, useConfetti } from '@/components/ui/AdvancedAnimations'
import { useEffect } from 'react'

export default function CheckoutSucessoPage() {
  const { fire, ConfettiComponent } = useConfetti()

  useEffect(() => { fire() }, [fire])

  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      {ConfettiComponent}
      <div className="min-h-[70vh] flex items-center justify-center relative">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />
          </motion.div>

          <FadeInOnScroll delay={0.3}>
            <h1 className="font-display font-extrabold text-3xl text-surface-900">Pagamento Confirmado!</h1>
            <p className="text-surface-500 mt-3 text-lg">Seu pedido foi processado com sucesso. O produto será entregue em instantes.</p>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.5}>
            <div className="card-base p-6 mt-8 text-left">
              <h3 className="font-display font-bold text-sm text-surface-500 uppercase mb-3">Detalhes do pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-surface-500">Pedido</span><span className="font-mono font-semibold text-surface-900">PD-2607-089</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Status</span><span className="text-emerald-600 font-semibold">✓ Pago</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Entrega</span><span className="text-surface-900">Automática</span></div>
              </div>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.7}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary py-3 px-6 flex items-center gap-2">
                  <Package size={18} /> Ver Meus Pedidos
                </motion.button>
              </Link>
              <Link href="/chat">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-secondary py-3 px-6 flex items-center gap-2">
                  <MessageSquare size={18} /> Chat com Vendedor
                </motion.button>
              </Link>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.9}>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 font-semibold flex items-center gap-2 justify-center">
                <Star size={16} className="text-amber-500" /> Ganhe PD Points com esta compra!
              </p>
              <p className="text-xs text-amber-600 mt-1">Você ganhou <strong>34 PD Points</strong> que podem ser trocados por descontos</p>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </PageTransition>
  )
}
