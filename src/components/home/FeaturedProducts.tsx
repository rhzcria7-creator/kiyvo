'use client'

import Link from 'next/link'
import { getFeaturedProducts } from '@/data/mockProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ArrowRight } from 'lucide-react'

export function FeaturedProducts() {
  const products = getFeaturedProducts()

  return (
    <section className="py-16 lg:py-20 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900">
              Em Destaque
            </h2>
            <p className="mt-1 text-surface-500 text-sm">Os melhores anúncios selecionados pra você</p>
          </div>
          <Link
            href="/categorias"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors font-display"
          >
            Ver mais <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
