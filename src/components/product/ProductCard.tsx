'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice, getDiscount } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Star, Zap, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { ref, isVisible } = useScrollAnimation(0.05)
  const discount = product.originalPrice ? getDiscount(product.price, product.originalPrice) : 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/produto/${product.id}`} className="block group">
        <div className="card-base overflow-hidden hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-200/60">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {discount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg font-display">
                  -{discount}%
                </span>
              )}
              {product.deliveryType === 'auto' && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-lg font-display flex items-center gap-1">
                  <Zap size={10} /> Auto
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs font-medium text-brand-600 mb-1 font-display">{product.category}</p>
            <h3 className="font-display font-bold text-surface-900 text-sm line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
              {product.title}
            </h3>

            {/* Seller */}
            <div className="flex items-center gap-2 mt-2.5">
              <img
                src={product.seller.avatar}
                alt={product.seller.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-surface-500 truncate">{product.seller.name}</span>
              {product.seller.verified && (
                <span className="text-brand-500 text-xs" title="Verificado">✓</span>
              )}
            </div>

            {/* Price + Rating */}
            <div className="flex items-end justify-between mt-3 pt-3 border-t border-surface-100">
              <div>
                {product.originalPrice && (
                  <p className="text-xs text-surface-400 line-through">{formatPrice(product.originalPrice)}</p>
                )}
                <p className="font-display font-extrabold text-lg text-surface-900">{formatPrice(product.price)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-surface-400">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="font-medium text-surface-600">{product.rating}</span>
                <span>({product.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
