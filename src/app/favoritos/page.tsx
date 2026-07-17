// ─────────────────────────────────────────────────────────────
// Favoritos Page — Dados reais do Supabase
// Zero mock — busca favoritos reais do utilizador
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { StaggerContainer, StaggerItem } from '@/components/animations'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'

interface FavoriteProduct {
  id: string
  title: string
  slug: string
  base_price: number
  original_price: number | null
  image: string
  category: string
  categorySlug: string
  type: string
  deliveryType: string
  rating: number
  sales: number
  reviews: number
  seller: {
    id: string
    name: string
    avatar: string
    rating: number
    sales: number
    verified: boolean
    memberSince: string
  }
}

export default function FavoritosPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) { setLoading(false); return }
      try {
        const res = await fetch('/api/v1/favorites')
        if (res.ok) {
          const data = await res.json()
          // Formatar para ProductCard
          const formatted = (data.favorites || []).map((f: Record<string, unknown>) => {
            const product = (f.products || {}) as Record<string, unknown>
            const vendor = (product.vendors || {}) as Record<string, unknown>
            const images = (product.product_images || []) as Record<string, unknown>[]
            const primaryImage = images.find((img: Record<string, unknown>) => img.is_primary) || images[0]

            return {
              id: f.product_id || product.id,
              title: product.title || '',
              slug: product.slug || '',
              base_price: Number(product.base_price) || 0,
              original_price: product.original_price ? Number(product.original_price) : null,
              image: primaryImage?.image_url || '',
              category: (product.categories as Record<string, unknown>)?.name as string || '',
              categorySlug: (product.categories as Record<string, unknown>)?.slug as string || '',
              type: product.product_type as string || '',
              deliveryType: product.delivery_type as string || 'auto',
              rating: Number(product.rating) || 0,
              sales: Number(product.sales_count) || 0,
              reviews: Number(product.review_count) || 0,
              seller: {
                id: vendor.id as string || '',
                name: vendor.store_name as string || '',
                avatar: vendor.logo_url as string || '',
                rating: Number(vendor.rating_avg) || 0,
                sales: Number(vendor.total_sales) || 0,
                verified: vendor.is_verified as boolean || false,
                memberSince: '',
              },
            }
          })
          setFavorites(formatted)
        }
      } catch {
        // Erro silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [user])

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white flex items-center gap-3">
            <Heart size={28} className="text-red-500" /> Meus Favoritos
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            {loading ? 'Carregando...' : `${favorites.length} produto${favorites.length !== 1 ? 's' : ''} salvo${favorites.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-base overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-surface-200 dark:bg-surface-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded w-1/3" />
                  <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded w-3/4" />
                  <div className="h-6 bg-surface-200 dark:bg-surface-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {favorites.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product as never} index={0} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-20">
            <Heart size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 dark:text-surface-500 text-lg">Nenhum favorito ainda</p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">Clique no ❤️ em produtos para salvar aqui</p>
            <Link href="/categorias" className="btn-primary mt-4 inline-block">Explorar Produtos</Link>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
