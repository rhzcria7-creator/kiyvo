'use client'

import { getProductsByCategory, mockProducts } from '@/data/mockProducts'
import { mockCategories, gameSubcategories } from '@/data/mockCategories'
import { ProductCard } from '@/components/product/ProductCard'
import { PageTransition } from '@/components/shared/PageTransition'
import { Badge } from '@/components/ui/Badge'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = mockCategories.find(c => c.slug === slug)
  const products = slug ? getProductsByCategory(slug) : mockProducts
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = products.filter(p => {
    if (priceMin && p.price < Number(priceMin)) return false
    if (priceMax && p.price > Number(priceMax)) return false
    return true
  })

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <a href="/" className="hover:text-brand-600">Início</a>
          <span>/</span>
          <a href="/categorias" className="hover:text-brand-600">Categorias</a>
          <span>/</span>
          <span className="text-surface-900 font-medium">{category?.name || slug}</span>
        </nav>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-surface-900">
              {category?.name || 'Categoria'}
            </h1>
            <p className="text-surface-500 text-sm mt-1">{filtered.length} anúncios encontrados</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-100 transition-all"
          >
            <SlidersHorizontal size={16} /> Filtros
          </button>
        </div>

        {/* Subcategory tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {gameSubcategories.map((sub) => (
            <button
              key={sub.name}
              className="shrink-0 px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all"
            >
              {sub.icon} {sub.name}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="card-base p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-surface-600 mb-1 block">Preço mín.</label>
              <input
                type="number"
                placeholder="R$ 0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="input-base w-32 text-sm py-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600 mb-1 block">Preço máx.</label>
              <input
                type="number"
                placeholder="R$ 999"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="input-base w-32 text-sm py-2"
              />
            </div>
            <button
              onClick={() => { setPriceMin(''); setPriceMax('') }}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-surface-400 text-lg">Nenhum anúncio encontrado nesta categoria.</p>
            <p className="text-surface-400 text-sm mt-2">Tente ajustar os filtros ou explore outras categorias.</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
