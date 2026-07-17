'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, SkeletonGrid } from '@/components/ui/AdvancedAnimations'
import { mockProducts } from '@/data/mockProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { mockCategories } from '@/data/mockCategories'

export default function BuscarPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const types = ['account', 'key', 'license', 'course', 'ebook', 'template', 'subscription', 'giftcard', 'domain', 'api', 'service']
  const typeLabels: Record<string, string> = {
    account: 'Conta', key: 'Chave', license: 'Licença', course: 'Curso', ebook: 'E-book',
    template: 'Template', subscription: 'Assinatura', giftcard: 'Gift Card', domain: 'Domínio', api: 'API', service: 'Serviço',
  }

  const filtered = mockProducts.filter(p => {
    if (query && !p.title.toLowerCase().includes(query.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))) return false
    if (category && p.categorySlug !== category) return false
    if (type && p.type !== type) return false
    if (priceMin && p.price < Number(priceMin)) return false
    if (priceMax && p.price > Number(priceMax)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'rating') return b.rating - a.rating
    if (sort === 'sales') return b.sales - a.sales
    return 0
  })

  const clearFilters = () => { setCategory(''); setType(''); setPriceMin(''); setPriceMax(''); setSort('featured') }
  const hasFilters = category || type || priceMin || priceMax

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-2">Buscar Produtos</h1>
          <p className="text-surface-500 text-sm mb-6">Encontre qualquer produto digital</p>
        </FadeInOnScroll>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jogos, software, cursos, templates..."
              className="input-base pl-10 text-lg"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                <X size={18} />
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 rounded-xl border-2 font-medium flex items-center gap-2 transition-all ${
              showFilters || hasFilters ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filtros
          </motion.button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="card-base p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-surface-600 mb-1.5 block">Categoria</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base text-sm">
                      <option value="">Todas</option>
                      {mockCategories.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-600 mb-1.5 block">Tipo</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="input-base text-sm">
                      <option value="">Todos</option>
                      {types.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-600 mb-1.5 block">Preço mín.</label>
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="R$ 0" className="input-base text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-600 mb-1.5 block">Preço máx.</label>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="R$ 999" className="input-base text-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
                  <div>
                    <label className="text-xs font-medium text-surface-600 mb-1.5 block">Ordenar por</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-base text-sm w-48">
                      <option value="featured">Destaques</option>
                      <option value="price_asc">Menor preço</option>
                      <option value="price_desc">Maior preço</option>
                      <option value="rating">Melhor avaliação</option>
                      <option value="sales">Mais vendidos</option>
                    </select>
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-sm text-brand-600 font-semibold hover:text-brand-700">Limpar filtros</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-surface-500">{sorted.length} produtos encontrados</p>
        </div>

        {sorted.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} index={0} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-400 text-lg">Nenhum produto encontrado</p>
            <p className="text-surface-400 text-sm mt-2">Tente ajustar os filtros ou buscar por outro termo</p>
            <button onClick={clearFilters} className="btn-primary mt-4">Limpar filtros</button>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
