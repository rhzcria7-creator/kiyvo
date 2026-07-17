'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Shield, Crown, Calendar, ShoppingBag, MessageSquare } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, NumberTicker, MorphingBlob, TiltCard, StaggerContainer, StaggerItem } from '@/components/ui/AdvancedAnimations'
import { Badge } from '@/components/ui/Badge'
import { mockProducts } from '@/data/mockProducts'
import { ProductCard } from '@/components/product/ProductCard'

const sellerInfo = {
  name: 'PixelKing',
  avatar: 'https://picsum.photos/seed/sk1/120/120',
  bio: 'Vendedor premium de contas e itens digitais. Mais de 2000 vendas realizadas com 99% de satisfação.',
  verified: true,
  plan: 'diamond' as const,
  rating: 4.9,
  totalSales: 2341,
  memberSince: '2022',
  responseTime: '< 1h',
  products: 15,
}

export default function VendedorPage() {
  const params = useParams()
  const sellerProducts = mockProducts.filter(p => p.seller.id === 's1')

  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        {/* Profile Header */}
        <FadeInOnScroll>
          <div className="card-base overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-brand-500 via-brand-600 to-purple-600" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <img src={sellerInfo.avatar} alt={sellerInfo.name} className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-extrabold text-2xl text-surface-900">{sellerInfo.name}</h1>
                    {sellerInfo.verified && <Badge variant="success">✓ Verificado</Badge>}
                    {sellerInfo.plan === 'diamond' && <Badge variant="brand"><Crown size={12} className="mr-1" /> Diamante</Badge>}
                  </div>
                  <p className="text-surface-500 text-sm mt-1 max-w-lg">{sellerInfo.bio}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 mt-6">
                {[
                  { icon: Star, label: 'Avaliação', value: sellerInfo.rating },
                  { icon: ShoppingBag, label: 'Vendas', value: sellerInfo.totalSales },
                  { icon: Calendar, label: 'Membro desde', value: sellerInfo.memberSince },
                  { icon: MessageSquare, label: 'Resposta', value: sellerInfo.responseTime },
                  { icon: Crown, label: 'Produtos', value: sellerInfo.products },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="text-center p-3 bg-surface-50 rounded-xl">
                    <stat.icon size={16} className="text-brand-600 mx-auto mb-1" />
                    <p className="font-display font-extrabold text-lg text-surface-900">{typeof stat.value === 'number' ? <NumberTicker value={stat.value} /> : stat.value}</p>
                    <p className="text-xs text-surface-400">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Products */}
        <FadeInOnScroll className="mt-8">
          <h2 className="font-display font-extrabold text-xl text-surface-900 mb-4">Produtos do Vendedor ({sellerProducts.length})</h2>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellerProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} index={0} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
