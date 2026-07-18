'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { useParams } from 'next/navigation'
import { PageTransition } from '@/components/shared/PageTransition'
import { Badge } from '@/components/ui/Badge'
import { SlidersHorizontal, Loader2, AlertCircle, PackageOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ProductData {
  id: string
  title: string
  slug: string
  price: number
  original_price: number | null
  image_url: string | null
  category_slug: string
  category_name: string
  seller_name: string
  delivery_type: string
  featured: boolean
  sales_count: number
  rating: number
  reviews_count: number
}

interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string
  product_count: number
}

// Subcategorias padrão para cada tipo de produto digital
const defaultSubcategories = [
  { name: 'Contas & Acessos', icon: '👤' },
  { name: 'Keys & Códigos', icon: '🔑' },
  { name: 'Licenças & Ativações', icon: '📜' },
  { name: 'Cursos & Treinamentos', icon: '🎓' },
  { name: 'Templates & Assets', icon: '🎨' },
  { name: 'Gift Cards', icon: '🎁' },
  { name: 'Domínios & APIs', icon: '🌐' },
  { name: 'Serviços', icon: '🛠️' },
]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [products, setProducts] = useState<ProductData[]>([])
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar categorias para identificar a atual
        const catRes = await fetch('/api/v1/categories?limit=50')
        const catData = await catRes.json()
        const currentCat = (catData.categories || []).find((c: CategoryData) => c.slug === slug)
        setCategory(currentCat || null)

        // Buscar produtos da categoria via search
        const searchRes = await fetch(`/api/search?q=&category=${encodeURIComponent(slug)}&limit=40`)
        if (!searchRes.ok) throw new Error('Erro ao buscar produtos')
        const searchData = await searchRes.json()
        setProducts(searchData.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchData()
  }, [slug])

  const filtered = products.filter(p => {
    if (priceMin && p.price < Number(priceMin)) return false
    if (priceMax && p.price > Number(priceMax)) return false
    return true
  })

  // Formata preço

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/" className="hover:text-brand-600">Início</Link>
          <span>/</span>
          <Link href="/categorias" className="hover:text-brand-600">Categorias</Link>
          <span>/</span>
          <span className="text-surface-900 font-medium">{category?.name || slug}</span>
        </nav>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-surface-900">
              {category?.icon ? `${category.icon} ` : ''}{category?.name || 'Categoria'}
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
          {defaultSubcategories.map((sub) => (
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-base p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-surface-600 mb-1 block">Preço mín.</label>
              <input type="number" placeholder="R$ 0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="input-base w-32 text-sm py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600 mb-1 block">Preço máx.</label>
              <input type="number" placeholder="R$ 999" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="input-base w-32 text-sm py-2" />
            </div>
            <button onClick={() => { setPriceMin(''); setPriceMax('') }} className="text-sm text-brand-600 hover:text-brand-700 font-medium">Limpar filtros</button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Buscando produtos...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-2">Tentar novamente</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <PackageOpen size={48} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-400 text-lg font-display font-bold">Nenhum anúncio encontrado nesta categoria.</p>
            <p className="text-surface-400 text-sm mt-2">Tente ajustar os filtros ou explore outras categorias.</p>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => {
              const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/p/${product.slug}`} className="card-base overflow-hidden group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-surface-300">
                          <PackageOpen size={32} />
                        </div>
                      )}
                      {discount > 0 && (
                        <Badge variant="danger" className="absolute top-2 left-2">-{discount}%</Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-surface-400 mb-1">{product.category_name}</p>
                      <h3 className="font-display font-bold text-surface-900 text-sm line-clamp-2 group-hover:text-brand-600 transition-colors">{product.title}</h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-display font-extrabold text-brand-600">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-xs text-surface-400 line-through">{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                        <span>{product.seller_name}</span>
                        <span>•</span>
                        <span>{product.sales_count} vendas</span>
                        {product.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500">★ {product.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
