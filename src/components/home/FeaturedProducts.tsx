// ─────────────────────────────────────────────────────────────
// FeaturedProducts — Produtos em destaque do Supabase
// Busca os produtos mais vendidos em tempo real, zero mock
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCardAPI } from '@/components/product/ProductCardAPI'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface FeaturedProduct {
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

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products?featured=true&limit=6')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
        }
      } catch {
        // Erro silencioso — componente mostra estado vazio
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <section className="py-16 lg:py-20 bg-surface-50 dark:bg-surface-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
              Em Destaque
            </h2>
            <p className="mt-1 text-surface-500 dark:text-surface-400 text-sm">Os melhores anúncios selecionados pra você</p>
          </div>
          <Link
            href="/categorias"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors font-display"
          >
            Ver mais <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card-base overflow-hidden"
              >
                <div className="aspect-[4/3] bg-surface-200 dark:bg-surface-800 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-1/3" />
                  <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-3/4" />
                  <div className="h-6 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-1/3" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product, i) => (
              <ProductCardAPI
                key={product.id}
                id={product.id}
                title={product.title}
                slug={product.slug}
                price={product.base_price}
                original_price={product.original_price}
                image_url={product.image}
                category_name={product.category}
                category_slug={product.categorySlug}
                seller_name={product.seller?.name}
                seller_verified={product.seller?.verified}
                delivery_type={product.deliveryType}
                sales_count={product.sales}
                rating={product.rating}
                index={i}
              />
            ))}
          </div>
        ) : (
          // Estado vazio — sem produtos ainda
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-sm mx-auto"
            >
              <p className="text-4xl mb-4">🚀</p>
              <p className="font-display font-bold text-surface-900 dark:text-white text-lg">Em breve!</p>
              <p className="text-surface-500 dark:text-surface-400 text-sm mt-2">
                Os melhores produtos digitais estão chegando. Fique ligado!
              </p>
              <Link href="/anunciar" className="btn-primary inline-block mt-4 text-sm">
                Seja o primeiro a anunciar
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
