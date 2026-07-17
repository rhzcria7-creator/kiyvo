'use client'

import { useAuth } from '@/lib/auth/context'
import { motion } from 'framer-motion'
import { Star, Shield, Calendar, ShoppingBag, TrendingUp, MapPin, Crown } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, AnimatedCounter } from '@/components/animations'
import { Badge } from '@/components/ui/Badge'
import { mockProducts } from '@/data/mockProducts'
import { ProductCard } from '@/components/product/ProductCard'

export default function PerfilPage() {
  const { profile } = useAuth()
  const sellerProducts = mockProducts.filter(p => p.seller.id === 's1')

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-700" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-surface-900 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-extrabold text-2xl text-brand-600 dark:text-brand-400">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">{profile?.username || 'Usuário'}</h1>
                  {profile?.verification_status === 'verified' && (
                    <Badge variant="success">✓ Verificado</Badge>
                  )}
                  {profile?.seller_plan === 'diamond' && <Crown size={18} className="text-brand-600 dark:text-brand-400" />}
                </div>
                <p className="text-surface-500 dark:text-surface-400 text-sm">{profile?.bio || 'Membro da Kiyvo'}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                <span className="flex items-center gap-1"><Calendar size={14} /> Desde {profile?.created_at?.slice(0, 4) || '2024'}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Vendas', value: profile?.total_sales || 0, icon: TrendingUp },
                { label: 'Compras', value: profile?.total_purchases || 0, icon: ShoppingBag },
                { label: 'Avaliação', value: profile?.rating || 0, icon: Star },
                { label: 'KD Points', value: profile?.kd_points || 0, icon: Crown },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                  <stat.icon size={16} className="text-brand-600 dark:text-brand-400 mx-auto mb-1" />
                  <p className="font-display font-extrabold text-lg text-surface-900 dark:text-white">
                    <AnimatedCounter target={stat.value} />
                  </p>
                  <p className="text-xs text-surface-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products */}
        <FadeInOnScroll className="mt-8">
          <h2 className="font-display font-extrabold text-xl text-surface-900 dark:text-white mb-4">Produtos do Vendedor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} index={0} />
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
