'use client'

import { motion } from 'framer-motion'
import { Flame, Clock, Tag, ArrowRight } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { StaggerContainer, StaggerItem, FadeInOnScroll } from '@/components/animations'
import { getFeaturedProducts } from '@/data/mockProducts'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'

export default function OfertasPage() {
  const products = getFeaturedProducts()

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Flame size={24} className="text-red-500" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-3xl text-surface-900">Ofertas em Destaque</h1>
              <p className="text-surface-500 text-sm">Os melhores descontos em produtos digitais</p>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Countdown banner */}
        <FadeInOnScroll delay={0.1}>
          <div className="mt-8 p-6 bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock size={24} />
              <div>
                <p className="font-display font-bold">Ofertas por tempo limitado</p>
                <p className="text-brand-200 text-sm">Descontos de até 70% em produtos selecionados</p>
              </div>
            </div>
            <div className="flex gap-3">
              {['23h', '47m', '12s'].map((t, i) => (
                <div key={i} className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                  <p className="font-display font-extrabold text-xl">{t.slice(0, -1)}</p>
                  <p className="text-xs text-brand-200">{t.slice(-1)}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Products */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={0} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Coupon Section */}
        <FadeInOnScroll className="mt-12">
          <div className="card-base p-8 text-center">
            <Tag size={32} className="text-brand-600 mx-auto mb-3" />
            <h2 className="font-display font-extrabold text-xl text-surface-900">Cupons Disponíveis</h2>
            <p className="text-surface-500 text-sm mt-1 mb-6">Use estes cupons para obter descontos extras</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { code: 'WELCOME10', discount: '10%', desc: 'Primeira compra' },
                { code: 'DIGITAL20', discount: '20%', desc: 'Produtos digitais' },
                { code: 'PLAYDEX15', discount: '15%', desc: 'Qualquer produto' },
              ].map((coupon) => (
                <motion.div
                  key={coupon.code}
                  whileHover={{ scale: 1.03 }}
                  className="p-4 border-2 border-dashed border-brand-200 rounded-xl bg-brand-50/50"
                >
                  <p className="font-mono font-bold text-brand-700 text-lg">{coupon.code}</p>
                  <p className="text-brand-600 font-display font-bold">{coupon.discount} OFF</p>
                  <p className="text-xs text-surface-500 mt-1">{coupon.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
