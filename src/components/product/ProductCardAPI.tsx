'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Star, Zap, PackageOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProductCardAPIProps {
  id: string
  title: string
  slug: string
  price: number
  original_price?: number | null
  image_url?: string | null
  category_name?: string
  category_slug?: string
  seller_name?: string
  seller_avatar?: string | null
  seller_verified?: boolean
  delivery_type?: string
  sales_count?: number
  rating?: number
  reviews_count?: number
  featured?: boolean
  index?: number
}

export function ProductCardAPI({
  slug,
  title,
  price,
  original_price,
  image_url,
  category_name,
  seller_name,
  seller_verified,
  delivery_type,
  sales_count,
  rating,
  index = 0,
}: ProductCardAPIProps) {
  const discount = original_price ? Math.round((1 - price / original_price) * 100) : 0

  const formatPrice = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/p/${slug}`} className="block group">
        <div className="card-base overflow-hidden hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-200/60">
          {/* Imagem */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
            {image_url ? (
              <Image
                src={image_url}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-surface-300">
                <PackageOpen size={32} />
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {discount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg font-display">
                  -{discount}%
                </span>
              )}
              {delivery_type === 'auto' && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-lg font-display flex items-center gap-1">
                  <Zap size={10} /> Auto
                </span>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-4">
            {category_name && (
              <p className="text-xs font-medium text-brand-600 mb-1 font-display">{category_name}</p>
            )}
            <h3 className="font-display font-bold text-surface-900 text-sm line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
              {title}
            </h3>

            {/* Vendedor */}
            {seller_name && (
              <div className="flex items-center gap-2 mt-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[9px] font-bold">
                  {seller_name[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-surface-500 truncate">{seller_name}</span>
                {seller_verified && (
                  <span className="text-brand-500 text-xs" title="Verificado">✓</span>
                )}
              </div>
            )}

            {/* Preço + Rating */}
            <div className="flex items-end justify-between mt-3 pt-3 border-t border-surface-100">
              <div>
                {original_price && (
                  <p className="text-xs text-surface-400 line-through">{formatPrice(original_price)}</p>
                )}
                <p className="font-display font-extrabold text-lg text-surface-900">{formatPrice(price)}</p>
              </div>
              {(rating !== undefined && rating > 0) && (
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="font-medium text-surface-600">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
