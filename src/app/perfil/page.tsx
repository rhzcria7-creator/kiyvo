'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { motion } from 'framer-motion'
import { Star, Shield, Calendar, ShoppingBag, TrendingUp, Crown, Loader2, PackageOpen } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, AnimatedCounter } from '@/components/animations'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'

interface ProductData {
  id: string
  title: string
  slug: string
  price: number
  original_price: number | null
  image_url: string | null
  category_name: string
  seller_name: string
  delivery_type: string
  sales_count: number
  rating: number
}

export default function PerfilPage() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar produtos do vendedor autenticado
  useEffect(() => {
    async function fetchSellerProducts() {
      try {
        // Busca geral — no futuro filtrar por vendor_id
        const res = await fetch('/api/search?q=&limit=6')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
        }
      } catch {
        // Silencioso — perfil funciona sem produtos
      } finally {
        setLoading(false)
      }
    }
    fetchSellerProducts()
  }, [])

  const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-700" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Foto do perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-extrabold text-2xl text-brand-600">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl text-surface-900">{profile?.username || 'Usuário'}</h1>
                  {profile?.verification_status === 'verified' && (
                    <Badge variant="success">✓ Verificado</Badge>
                  )}
                  {profile?.seller_plan === 'diamond' && <Crown size={18} className="text-brand-600" />}
                </div>
                <p className="text-surface-500 text-sm">{profile?.bio || 'Membro da Kiyvo'}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-500">
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
                <div key={stat.label} className="text-center p-3 bg-surface-50 rounded-xl">
                  <stat.icon size={16} className="text-brand-600 mx-auto mb-1" />
                  <p className="font-display font-extrabold text-lg text-surface-900">
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
          <h2 className="font-display font-extrabold text-xl text-surface-900 mb-4">Produtos do Vendedor</h2>

          {loading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="animate-spin text-brand-600" />
              <p className="text-surface-500 text-sm">Carregando produtos...</p>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <PackageOpen size={32} className="text-surface-300" />
              <p className="text-surface-500 font-display font-bold">Nenhum produto publicado</p>
              <p className="text-surface-400 text-sm">Comece a vender na Kiyvo!</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => {
                const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href={`/p/${product.slug}`} className="card-base overflow-hidden group block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-surface-300">
                            <PackageOpen size={32} />
                          </div>
                        )}
                        {discount > 0 && <Badge variant="danger" className="absolute top-2 left-2">-{discount}%</Badge>}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-surface-400 mb-1">{product.category_name}</p>
                        <h3 className="font-display font-bold text-surface-900 text-sm line-clamp-2 group-hover:text-brand-600 transition-colors">{product.title}</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-display font-extrabold text-brand-600">{formatPrice(product.price)}</span>
                          {product.original_price && <span className="text-xs text-surface-400 line-through">{formatPrice(product.original_price)}</span>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
