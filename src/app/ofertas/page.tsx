'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Flame, Clock, Tag, ArrowRight, Loader2, AlertCircle, PackageOpen } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { StaggerContainer, StaggerItem, FadeInOnScroll } from '@/components/animations'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'

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

export default function OfertasPage() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/search?q=&featured=true&limit=20')
        if (!res.ok) throw new Error('Erro ao buscar ofertas')
        const data = await res.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])


  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <FadeInOnScroll>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Flame size={24} className="text-red-500" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white">Ofertas em Destaque</h1>
              <p className="text-surface-500 dark:text-surface-400 text-sm">Os melhores descontos em produtos digitais</p>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Countdown banner */}
        <FadeInOnScroll delay={0.1}>
          <div className="mt-8 p-6 bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock size={24} />
              <div>
                <p className="font-display font-bold">Ofertas por tempo limitado</p>
                <p className="text-brand-200 text-sm">Descontos de até 70% em produtos selecionados</p>
              </div>
            </div>
            <Link href="/planos" className="bg-white text-brand-700 px-5 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-brand-50 transition-colors flex items-center gap-2">
              Ver planos <ArrowRight size={16} />
            </Link>
          </div>
        </FadeInOnScroll>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando ofertas...</p>
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
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <PackageOpen size={32} className="text-surface-300" />
            <p className="text-surface-500 text-lg font-display font-bold">Nenhuma oferta disponível no momento</p>
            <p className="text-surface-400 text-sm">Novas ofertas serão adicionadas em breve.</p>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && products.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {products.map((product) => {
              const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0
              return (
                <StaggerItem key={product.id}>
                  <Link href={`/p/${product.slug}`} className="card-base overflow-hidden group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
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
                      <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                        <span>{product.seller_name}</span>
                        <span>•</span>
                        <span>{product.sales_count} vendas</span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}

        {/* Coupon Section */}
        <FadeInOnScroll className="mt-12">
          <div className="card-base p-8 text-center">
            <Tag size={32} className="text-brand-600 mx-auto mb-3" />
            <h2 className="font-display font-extrabold text-xl text-surface-900">Cupons Disponíveis</h2>
            <p className="text-surface-500 text-sm mt-1 mb-6">Use estes cupons para obter descontos extras</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { code: 'WELCOME10', discount: '10%', desc: 'Primeira compra' },
                { code: 'DIGITAL20', discount: '20%', desc: 'Produtos digitais' },
                { code: 'KIYVO15', discount: '15%', desc: 'Qualquer produto' },
              ].map((coupon) => (
                <motion.div key={coupon.code} whileHover={{ scale: 1.03 }} className="p-4 border-2 border-dashed border-brand-200 rounded-xl bg-brand-50">
                  <p className="font-mono font-bold text-brand-700 text-lg">{coupon.code}</p>
                  <p className="text-brand-600 font-display font-bold">{coupon.discount} OFF</p>
                  <p className="text-xs text-surface-500 mt-1">{coupon.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
