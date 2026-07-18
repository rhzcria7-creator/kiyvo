// ─────────────────────────────────────────────────────────────
// Buscar Page — Busca real via API v1/search
// Zero mock, busca Full Text Search no Supabase
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/ui/AdvancedAnimations'
import { ProductCardAPI } from '@/components/product/ProductCardAPI'
import { formatBRL } from '@/domain/fees/FeeEngine'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  slug: string
  base_price: number
  original_price: number | null
  product_type: string
  delivery_type: string
  sales_count: number
  rating: number
  review_count: number
  tags: string[]
  category: string
  categorySlug: string
  vendor: { store_name: string; slug: string; logo_url: string; rating_avg: number }
  image: string
}

interface CategoryResult {
  id: string
  name: string
  slug: string
  icon: string
}

interface SellerResult {
  id: string
  name: string
  slug: string
  rating: number
  sales: number
  verified: boolean
}

export default function BuscarPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<SearchResult[]>([])
  const [categories, setCategories] = useState<CategoryResult[]>([])
  const [sellers, setSellers] = useState<SellerResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [categoriesList, setCategoriesList] = useState<CategoryResult[]>([])

  // Carregar categorias disponíveis
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/v1/categories?limit=30')
        if (res.ok) {
          const data = await res.json()
          setCategoriesList(data.categories || [])
        }
      } catch {
        // Erro silencioso
      }
    }
    loadCategories()
  }, [])

  // Debounced search
  const doSearch = useCallback(async (searchQuery: string, searchPage = 1) => {
    if (!searchQuery && !category && !type) {
      setProducts([])
      setCategories([])
      setSellers([])
      setTotal(0)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (category) params.set('category', category)
      if (type) params.set('type', type)
      if (priceMin) params.set('min_price', priceMin)
      if (priceMax) params.set('max_price', priceMax)
      params.set('sort', sort)
      params.set('page', String(searchPage))
      params.set('limit', '20')

      const res = await fetch(`/api/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        const searchData = data.data || data
        setProducts(searchData.products || [])
        setCategories(searchData.categories || [])
        setSellers(searchData.sellers || [])
        setTotal(data.total || 0)
        setPage(searchPage)
      }
    } catch {
      toast.error('Erro ao buscar produtos')
    } finally {
      setLoading(false)
    }
  }, [category, type, priceMin, priceMax, sort])

  // Auto-search com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query, category, type, sort, doSearch])

  const clearFilters = () => {
    setCategory('')
    setType('')
    setPriceMin('')
    setPriceMax('')
    setSort('relevance')
  }
  const hasFilters = category || type || priceMin || priceMax

  const types = ['account', 'key', 'license', 'course', 'ebook', 'template', 'subscription', 'giftcard', 'domain', 'api', 'service']
  const typeLabels: Record<string, string> = {
    account: 'Conta', key: 'Chave', license: 'Licença', course: 'Curso', ebook: 'E-book',
    template: 'Template', subscription: 'Assinatura', giftcard: 'Gift Card', domain: 'Domínio', api: 'API', service: 'Serviço',
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">Buscar Produtos</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">Encontre qualquer produto digital</p>
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
              showFilters || hasFilters ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:border-brand-700 dark:text-brand-300' : 'border-surface-200 dark:border-surface-700 text-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800'
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
                    <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Categoria</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base text-sm">
                      <option value="">Todas</option>
                      {categoriesList.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Tipo</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="input-base text-sm">
                      <option value="">Todos</option>
                      {types.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Preço mín.</label>
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="R$ 0" className="input-base text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Preço máx.</label>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="R$ 999" className="input-base text-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                  <div>
                    <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Ordenar por</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-base text-sm w-48">
                      <option value="relevance">Relevância</option>
                      <option value="price_asc">Menor preço</option>
                      <option value="price_desc">Maior preço</option>
                      <option value="rating">Melhor avaliação</option>
                      <option value="sales">Mais vendidos</option>
                      <option value="newest">Mais recentes</option>
                    </select>
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-sm text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700">Limpar filtros</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories results */}
        {categories.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Categorias</p>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <Link key={c.id} href={`/c/${c.slug}`} className="px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400 transition-all">
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sellers results */}
        {sellers.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Vendedores</p>
            <div className="flex gap-2 flex-wrap">
              {sellers.map(s => (
                <Link key={s.id} href={`/v/${s.slug}`} className="px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400 transition-all flex items-center gap-2">
                  {s.name}
                  {s.verified && <span className="text-brand-500">✓</span>}
                  <span className="text-xs text-surface-400">⭐ {Number(s.rating).toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {loading ? 'Buscando...' : `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-base overflow-hidden">
                <div className="aspect-[4/3] bg-surface-200 dark:bg-surface-800 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-1/3" />
                  <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-3/4" />
                  <div className="h-6 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCardAPI
                  id={product.id}
                  title={product.title}
                  slug={product.slug}
                  price={product.base_price}
                  original_price={product.original_price}
                  image_url={product.image}
                  category_name={product.category}
                  category_slug={product.categorySlug}
                  seller_name={product.vendor?.store_name}
                  delivery_type={product.delivery_type}
                  sales_count={product.sales_count}
                  rating={product.rating}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : query || hasFilters ? (
          <div className="text-center py-20">
            <Search size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 dark:text-surface-500 text-lg">Nenhum produto encontrado</p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">Tente ajustar os filtros ou buscar por outro termo</p>
            <button onClick={clearFilters} className="btn-primary mt-4">Limpar filtros</button>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 dark:text-surface-500 text-lg">Busque por qualquer produto digital</p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">Jogos, software, cursos, e-books, templates e muito mais</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
