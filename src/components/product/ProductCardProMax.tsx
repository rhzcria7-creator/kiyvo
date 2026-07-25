'use client'

// ─────────────────────────────────────────────────────────────
// ProductCard Pro Max v0.0.1 — Card premium com boost badge amber pulse
// Framer Motion scale, gradient border, rating, preço PIX
// Memoizado com React.memo
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Zap, Shield, Clock, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

interface ProductCardProMaxProps {
  id: string
  title: string
  slug: string
  price: number
  originalPrice?: number | null
  rating: number
  totalSales: number
  thumbnail: string
  category: string
  sellerName?: string
  sellerLevel?: string
  hasBoost?: boolean
  isTaxFree?: boolean
  deliveryType?: 'instant' | 'manual'
  index?: number
}

function ProductCardProMaxComponent({
  id,
  title,
  slug,
  price,
  originalPrice,
  rating,
  totalSales,
  thumbnail,
  category,
  sellerName,
  sellerLevel,
  hasBoost,
  isTaxFree,
  deliveryType,
  index = 0,
}: ProductCardProMaxProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  return (
    <motion.a
      href={`/product/${slug || id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, type: 'spring', damping: 22, stiffness: 200 }}
      className={clsx(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200/50 dark:border-zinc-800/50',
        'shadow-sm hover:shadow-xl transition-all duration-300',
        hasBoost && 'ring-1 ring-amber-500/30'
      )}
    >
      {/* Boost badge */}
      {hasBoost && (
        <div className="absolute top-2 left-2 z-10">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full"
          >
            <Zap className="w-3 h-3" />
            BOOST
          </motion.div>
        </div>
      )}

      {/* Tax Free badge */}
      {isTaxFree && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
            <Shield className="w-3 h-3" />
            TAX FREE
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        {/* Category + Delivery */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{category}</span>
          {deliveryType === 'instant' && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-500">
              <Zap className="w-2.5 h-2.5" />
              Imediato
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>

        {/* Rating + Sales */}
        <div className="flex items-center gap-3 mt-auto mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-zinc-400">{totalSales} vendas</span>
        </div>

        {/* Seller */}
        {sellerName && (
          <p className="text-[11px] text-zinc-400 mb-2">
            por {sellerName}
            {sellerLevel && (
              <span className={clsx(
                'ml-1 px-1 py-0.5 rounded text-[9px] font-semibold uppercase',
                sellerLevel === 'legend' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                sellerLevel === 'master' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                sellerLevel === 'diamond' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                sellerLevel === 'gold' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              )}>
                {sellerLevel}
              </span>
            )}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                R$ {price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-zinc-400 line-through">
                  R$ {originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {isTaxFree && (
              <span className="text-[10px] text-emerald-500 font-medium">Sem taxa extra</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              window.dispatchEvent(new CustomEvent('kiyvo:add-to-cart', { detail: { id, title, price } }))
            }}
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center',
              'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
              'hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors'
            )}
            style={{ minWidth: 36, minHeight: 36 }}
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.a>
  )
}

const ProductCardProMax = React.memo(ProductCardProMaxComponent)
export { ProductCardProMax }
export default ProductCardProMax
