'use client'

import { getProductById, mockProducts } from '@/data/mockProducts'
import { formatPrice, getDiscount } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Zap, Shield, Clock, MessageSquare, ChevronLeft, Heart, Share2 } from 'lucide-react'

export default function ProductPage() {
  const params = useParams()
  const id = params.id as string
  const product = getProductById(id) || mockProducts[0]
  const discount = product.originalPrice ? getDiscount(product.price, product.originalPrice) : 0

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/" className="hover:text-brand-600">Início</Link>
          <span>/</span>
          <Link href={`/categoria/${product.categorySlug}`} className="hover:text-brand-600">{product.category}</Link>
          <span>/</span>
          <span className="text-surface-900 font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image */}
          <div className="lg:col-span-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-100">
              <Image src={product.image} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" priority />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg font-display">-{discount}%</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="brand">{product.category}</Badge>
                <Badge variant="info">{product.type === 'account' ? 'Conta' : product.type === 'key' ? 'Key' : product.type === 'gold' ? 'Moedas' : 'Item'}</Badge>
                {product.deliveryType === 'auto' && (
                  <Badge variant="success" dot>Entrega Automática</Badge>
                )}
              </div>

              <h1 className="font-display font-extrabold text-2xl text-surface-900 leading-snug">{product.title}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-surface-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-surface-600">{product.rating}</span>
                <span className="text-sm text-surface-400">({product.reviews} avaliações)</span>
                <span className="text-sm text-surface-400">•</span>
                <span className="text-sm text-surface-400">{product.sales} vendas</span>
              </div>

              {/* Price */}
              <div className="mt-6 p-4 bg-surface-50 rounded-xl border border-surface-100">
                {product.originalPrice && (
                  <p className="text-sm text-surface-400 line-through">{formatPrice(product.originalPrice)}</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-3xl text-surface-900">{formatPrice(product.price)}</span>
                  {discount > 0 && (
                    <span className="text-sm font-bold text-red-500">-{discount}%</span>
                  )}
                </div>
                <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                  <Zap size={12} /> {product.deliveryType === 'auto' ? 'Entrega automática' : 'Entrega manual pelo vendedor'}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                <Link href="/checkout" className="flex-1">
                  <Button size="lg" className="w-full">Comprar Agora</Button>
                </Link>
                <Button variant="ghost" size="lg" icon={<Heart size={20} />}> </Button>
                <Button variant="ghost" size="lg" icon={<Share2 size={20} />}> </Button>
              </div>

              {/* Seller */}
              <div className="mt-6 p-4 card-base flex items-center gap-3">
                <img src={product.seller.avatar} alt={product.seller.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-semibold text-sm text-surface-900 truncate">{product.seller.name}</p>
                    {product.seller.verified && <span className="text-brand-500 text-sm">✓</span>}
                  </div>
                  <p className="text-xs text-surface-400">{product.seller.sales} vendas • ⭐ {product.seller.rating}</p>
                </div>
                <Button variant="ghost" size="sm" icon={<MessageSquare size={16} />}>Chat</Button>
              </div>

              {/* Guarantees */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: 'Garantia', sub: 'Dinheiro de volta' },
                  { icon: Clock, label: 'Prazo', sub: '4-7 dias liberação' },
                  { icon: MessageSquare, label: 'Suporte', sub: '24h disponível' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-surface-50 rounded-xl">
                    <item.icon size={18} className="text-brand-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-surface-700 font-display">{item.label}</p>
                    <p className="text-[10px] text-surface-400">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10">
          <h2 className="font-display font-bold text-xl text-surface-900 mb-4">Descrição</h2>
          <div className="card-base p-6">
            <p className="text-surface-600 leading-relaxed">{product.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <Badge key={tag}>#{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
