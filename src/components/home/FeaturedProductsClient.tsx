'use client'

// ─────────────────────────────────────────────────────────────
// FeaturedProductsClient — Renderiza grid de produtos em destaque
// Recebe dados via props do server component
// ─────────────────────────────────────────────────────────────

import Link from 'next/link'
import { ProductCardAPI } from '@/components/product/ProductCardAPI'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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

export function FeaturedProductsClient({ products }: { products: FeaturedProduct[] }) {
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

        {products.length > 0 ? (
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
                seller_name={product.seller.name}
                seller_verified={product.seller.verified}
                delivery_type={product.deliveryType}
                sales_count={product.sales}
                rating={product.rating}
                index={i}
              />
            ))}
          </div>
        ) : (
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
              <Link href="/vender" className="btn-primary inline-block mt-4 text-sm">
                Seja o primeiro a anunciar
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
