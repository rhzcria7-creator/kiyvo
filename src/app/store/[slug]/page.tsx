'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, ScaleInOnScroll } from '@/components/animations'
import { Button } from '@/components/ui/Button'
import { Store, Star, Shield, Package, MapPin, ExternalLink, ChevronRight, Search, Heart, MessageCircle, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

/** Mock vendor data — em produção, query do Supabase com RLS */
interface VendorData {
  id: string
  storeName: string
  slug: string
  description: string
  logoUrl: string
  bannerUrl: string
  ratingAvg: number
  totalSales: number
  totalProducts: number
  isVerified: boolean
  stripeOnboardingComplete: boolean
  joinedAt: string
  products: VendorProduct[]
}

interface VendorProduct {
  id: string
  title: string
  slug: string
  price: number
  originalPrice: number | null
  imageUrl: string
  rating: number
  salesCount: number
  status: string
}

const mockVendor: VendorData = {
  id: 'v1',
  storeName: 'SoftVault Digital',
  slug: 'softvault',
  description: 'Loja especializada em licenças de software originais com os melhores preços do Brasil. Windows, Office, Antivírus e muito mais. Todas as chaves são 100% legítimas e com entrega automática.',
  logoUrl: 'https://picsum.photos/seed/sv-logo/200/200',
  bannerUrl: 'https://picsum.photos/seed/sv-banner/1200/300',
  ratingAvg: 4.8,
  totalSales: 1876,
  totalProducts: 24,
  isVerified: true,
  stripeOnboardingComplete: true,
  joinedAt: '2021',
  products: [
    { id: 'p1', title: 'Windows 11 Pro — Licença Vitalícia', slug: 'windows-11-pro', price: 49.90, originalPrice: 299.90, imageUrl: 'https://picsum.photos/seed/win11/400/300', rating: 4.8, salesCount: 5678, status: 'published' },
    { id: 'p2', title: 'Office 365 — 1 Ano de Acesso', slug: 'office-365-1ano', price: 69.90, originalPrice: 349.90, imageUrl: 'https://picsum.photos/seed/o365/400/300', rating: 4.7, salesCount: 3210, status: 'published' },
    { id: 'p3', title: 'Kaspersky Total Security — 3 Dispositivos', slug: 'kaspersky-ts', price: 29.90, originalPrice: 149.90, imageUrl: 'https://picsum.photos/seed/kasp/400/300', rating: 4.6, salesCount: 1890, status: 'published' },
    { id: 'p4', title: 'Windows 10 Pro — Licença Original', slug: 'win10-pro', price: 39.90, originalPrice: 249.90, imageUrl: 'https://picsum.photos/seed/win10/400/300', rating: 4.9, salesCount: 4102, status: 'published' },
    { id: 'p5', title: 'Norton 360 Premium — 5 Devices', slug: 'norton-360', price: 34.90, originalPrice: 199.90, imageUrl: 'https://picsum.photos/seed/nort/400/300', rating: 4.5, salesCount: 1234, status: 'published' },
    { id: 'p6', title: 'Windows Server 2022 — Licença', slug: 'winserver-2022', price: 199.90, originalPrice: 899.90, imageUrl: 'https://picsum.photos/seed/winsvr/400/300', rating: 4.8, salesCount: 567, status: 'published' },
  ],
}

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'sales'>('featured')

  // Em produção: const { data: vendor } = useQuery(['vendor', slug], () => supabase.from('vendors').select('*, products(*)').eq('slug', slug).single())
  const vendor = mockVendor

  const filteredProducts = vendor.products
    .filter(p => p.status === 'published')
    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'sales') return b.salesCount - a.salesCount
      return b.salesCount - a.salesCount // featured = mais vendidos
    })

  return (
    <PageTransition>
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-brand-600 to-brand-800 overflow-hidden">
        <img src={vendor.bannerUrl} alt="Banner da loja" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-surface-950 shadow-elevated overflow-hidden bg-white shrink-0">
              <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pt-2 sm:pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
                  {vendor.storeName}
                </h1>
                {vendor.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full">
                    <Shield size={12} /> Verificado
                  </span>
                )}
                {vendor.stripeOnboardingComplete && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">
                    <Shield size={12} /> Pagamento Seguro
                  </span>
                )}
              </div>
              <p className="text-surface-500 dark:text-surface-400 text-sm mt-1 max-w-xl line-clamp-2">
                {vendor.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { icon: <Star size={16} className="text-amber-500" />, value: vendor.ratingAvg.toFixed(1), label: 'Avaliação' },
              { icon: <Package size={16} className="text-brand-500" />, value: vendor.totalProducts.toString(), label: 'Produtos' },
              { icon: <TrendingUp size={16} className="text-emerald-500" />, value: vendor.totalSales.toLocaleString('pt-BR'), label: 'Vendas' },
              { icon: <Award size={16} className="text-purple-500" />, value: `Desde ${vendor.joinedAt}`, label: 'Membro' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                {stat.icon}
                <div>
                  <p className="text-xs font-semibold text-surface-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-surface-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Sort */}
        <FadeInOnScroll>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nesta loja..."
                className="input-base pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input-base w-auto"
            >
              <option value="featured">Mais vendidos</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="rating">Melhor avaliados</option>
              <option value="sales">Mais populares</option>
            </select>
          </div>
        </FadeInOnScroll>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredProducts.map((product, i) => {
            const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
            return (
              <ScaleInOnScroll key={product.id} delay={i * 0.05}>
                <Link href={`/produto/${product.slug}`}>
                  <div className="card-base overflow-hidden hover:shadow-card-hover dark:hover:shadow-dark-glow transition-shadow group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                          -{discount}%
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); toast.success('Adicionado aos favoritos') }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-surface-900 transition-colors"
                      >
                        <Heart size={14} className="text-surface-400 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-sm text-surface-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-display font-extrabold text-lg text-brand-600 dark:text-brand-400">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-surface-400 line-through">
                            R$ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-amber-500 fill-amber-500" /> {product.rating}
                        </span>
                        <span>{product.salesCount.toLocaleString('pt-BR')} vendas</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScaleInOnScroll>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400">Nenhum produto encontrado nesta loja</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
