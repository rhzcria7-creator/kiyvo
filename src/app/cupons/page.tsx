'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Copy, Check, Clock, Gift, Percent } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard, GlowCard } from '@/components/ui/AdvancedAnimations'
import { AnimatedGift } from '@/components/svgs/AnimatedSVGs2'
import toast from 'react-hot-toast'

const coupons = [
  { code: 'WELCOME10', discount: '10%', type: 'percentage', desc: 'Desconto na primeira compra', minOrder: 0, validUntil: '31/08/26', maxUses: 1000, usedCount: 456, category: 'Todos' },
  { code: 'DIGITAL20', discount: '20%', type: 'percentage', desc: '20% off em produtos digitais', minOrder: 50, validUntil: '31/07/26', maxUses: 500, usedCount: 234, category: 'Digital' },
  { code: 'PLAYDEX15', discount: '15%', type: 'percentage', desc: '15% off em qualquer produto', minOrder: 30, validUntil: '15/08/26', maxUses: 2000, usedCount: 1234, category: 'Todos' },
  { code: 'SOFTWARE25', discount: '25%', type: 'percentage', desc: 'Super desconto em software e licenças', minOrder: 40, validUntil: '30/07/26', maxUses: 300, usedCount: 189, category: 'Software' },
  { code: 'CURSO10', discount: 'R$ 10', type: 'fixed', desc: 'R$ 10 de desconto em cursos', minOrder: 25, validUntil: '31/08/26', maxUses: 800, usedCount: 567, category: 'Cursos' },
  { code: 'DESIGN30', discount: '30%', type: 'percentage', desc: '30% off em templates e designs', minOrder: 20, validUntil: '20/07/26', maxUses: 200, usedCount: 178, category: 'Design' },
  { code: 'FIRST5', discount: 'R$ 5', type: 'fixed', desc: 'R$ 5 de desconto na primeira compra', minOrder: 0, validUntil: '31/12/26', maxUses: 5000, usedCount: 3456, category: 'Novos' },
  { code: 'VIP40', discount: '40%', type: 'percentage', desc: 'Desconto VIP exclusivo', minOrder: 100, validUntil: '25/07/26', maxUses: 50, usedCount: 42, category: 'VIP' },
]

export default function CuponsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success(`Cupom ${code} copiado!`)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <FadeInOnScroll className="text-center mb-12">
          <AnimatedGift className="w-16 h-16 mx-auto mb-3" />
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">Cupons de Desconto</h1>
          <p className="text-surface-500 mt-2 max-w-md mx-auto">Use cupons para economizar em suas compras digitais</p>
        </FadeInOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coupons.map((coupon) => {
            const isExpiring = new Date(coupon.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            const usesLeft = coupon.maxUses - coupon.usedCount
            const progress = (coupon.usedCount / coupon.maxUses) * 100

            return (
              <StaggerItem key={coupon.code}>
                <TiltCard>
                  <div className="card-base overflow-hidden">
                    <div className="flex">
                      {/* Left: Discount */}
                      <div className="w-28 bg-gradient-to-br from-brand-500 to-brand-700 flex flex-col items-center justify-center p-4 shrink-0 relative">
                        <div className="absolute right-0 top-4 bottom-4 w-3 border-l-2 border-dashed border-white/30" />
                        {coupon.type === 'percentage' ? <Percent size={20} className="text-white/70 mb-1" /> : <span className="text-white/70 text-xs mb-1">R$</span>}
                        <p className="font-display font-extrabold text-2xl text-white">{coupon.discount.replace('%', '').replace('R$ ', '')}</p>
                        {coupon.type === 'percentage' && <span className="text-white/80 text-xs font-bold">OFF</span>}
                      </div>

                      {/* Right: Details */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display font-bold text-surface-900">{coupon.desc}</h3>
                            <p className="text-xs text-surface-400 mt-0.5">
                              {coupon.minOrder > 0 ? `Mínimo R$ ${coupon.minOrder}` : 'Sem valor mínimo'} • {coupon.category}
                            </p>
                          </div>
                          {isExpiring && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              <Clock size={10} /> Acabando
                            </span>
                          )}
                        </div>

                        {/* Code */}
                        <div className="flex items-center gap-2 mt-3">
                          <code className="px-3 py-1.5 bg-surface-100 rounded-lg font-mono text-sm font-bold text-brand-700 tracking-wider">
                            {coupon.code}
                          </code>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyCode(coupon.code)}
                            className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                          >
                            {copied === coupon.code ? <Check size={16} /> : <Copy size={16} />}
                          </motion.button>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-surface-400 mb-1">
                            <span>{usesLeft} restantes</span>
                            <span>Válido até {coupon.validUntil}</span>
                          </div>
                          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-brand-500 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}
