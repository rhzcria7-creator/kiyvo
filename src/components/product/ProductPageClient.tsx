'use client'

// ─────────────────────────────────────────────────────────────
// ProductPageClient — Página de Produto interativa
// Recebe dados iniciais via props do server component
// Galeria, Preço, Botão Comprar, Avaliações, Selos
// Framer Motion para todas as animações
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import {
  Star, Shield, Zap, ShoppingCart, Heart, Share2, Eye,
  Clock, CheckCircle, AlertTriangle, ChevronRight, Copy,
  Package, MessageCircle, ThumbsUp, Flag, Loader2,
} from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'

interface ProductImage {
  id: string
  imageUrl: string
  altText: string | null
  isPrimary: boolean
}

interface ProductVariant {
  id: string
  sku: string
  attributes: Record<string, string>
  priceAdjustment: number
  stock: number
}

interface ProductDetail {
  id: string
  title: string
  slug: string
  descriptionHtml: string
  basePrice: number
  originalPrice: number | null
  currency: string
  stockQuantity: number
  isDigital: boolean
  deliveryType: string
  status: string
  rating: number
  reviewCount: number
  salesCount: number
  viewsCount: number
  isFeatured: boolean
  tags: string[]
  images: ProductImage[]
  vendor: {
    id: string
    storeName: string
    slug: string
    logoUrl: string | null
    ratingAvg: number
    totalSales: number
    level: string
  }
  variants: ProductVariant[]
}

interface Review {
  id: string
  rating: number
  comment: string
  isAnonymous: boolean
  createdAt: string
  reviewerName: string
}

// Mapear dados do servidor para o formato do client
function mapServerProduct(data: Record<string, unknown>): ProductDetail | null {
  try {
    const vendor = (data.vendors || {}) as Record<string, unknown>
    const images = ((data.product_images || []) as Array<Record<string, unknown>>).map((img) => ({
      id: img.id as string,
      imageUrl: img.image_url as string,
      altText: img.alt_text as string | null,
      isPrimary: img.is_primary as boolean,
    }))

    const variants = ((data.product_variants || []) as Array<Record<string, unknown>>).map((v) => ({
      id: v.id as string,
      sku: v.sku as string,
      attributes: (v.attributes as Record<string, string>) || {},
      priceAdjustment: Number(v.price_adjustment || 0),
      stock: Number(v.stock || 0),
    }))

    return {
      id: data.id as string,
      title: data.title as string,
      slug: data.slug as string,
      descriptionHtml: (data.description as string) || '',
      basePrice: Number(data.base_price || 0),
      originalPrice: data.original_price ? Number(data.original_price) : null,
      currency: (data.currency as string) || 'BRL',
      stockQuantity: Number(data.stock_quantity || 0),
      isDigital: (data.is_digital as boolean) || true,
      deliveryType: (data.delivery_type as string) || 'automatic',
      status: (data.status as string) || 'published',
      rating: Number(data.rating || 0),
      reviewCount: Number(data.review_count || 0),
      salesCount: Number(data.sales_count || 0),
      viewsCount: Number(data.views_count || 0),
      isFeatured: (data.is_featured as boolean) || false,
      tags: (data.tags as string[]) || [],
      images,
      vendor: {
        id: String(vendor.id || ''),
        storeName: (vendor.store_name as string) || 'Vendedor',
        slug: (vendor.slug as string) || '',
        logoUrl: (vendor.logo_url as string) || null,
        ratingAvg: Number(vendor.rating_avg || 0),
        totalSales: Number(vendor.total_sales || 0),
        level: (vendor.level as string) || 'silver',
      },
      variants,
    }
  } catch {
    return null
  }
}

function mapServerReviews(data: Array<Record<string, unknown>>): Review[] {
  return data.map((r) => {
    const reviewer = (r.reviewer as Record<string, unknown>) || {}
    return {
      id: r.id as string,
      rating: Number(r.rating || 0),
      comment: (r.comment as string) || '',
      isAnonymous: (r.is_anonymous as boolean) || false,
      createdAt: r.created_at as string,
      reviewerName: r.is_anonymous
        ? 'Anônimo'
        : ((reviewer.full_name as string) || (reviewer.username as string) || 'Usuário'),
    }
  })
}

export function ProductPageClient({
  slug,
  initialProduct,
  initialReviews,
}: {
  slug: string
  initialProduct: Record<string, unknown> | null
  initialReviews: Array<Record<string, unknown>>
}) {
  const router = useRouter()
  const { user } = useAuth()

  const [product, setProduct] = useState<ProductDetail | null>(
    initialProduct ? mapServerProduct(initialProduct) : null
  )
  const [reviews, setReviews] = useState<Review[]>(
    initialReviews.length > 0 ? mapServerReviews(initialReviews) : []
  )
  const [isLoading, setIsLoading] = useState(initialProduct === null)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  // Se não recebemos dados do servidor, buscar via API
  useEffect(() => {
    if (initialProduct) return

    async function loadProduct() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/products?slug=${slug}`)
        if (!response.ok) {
          if (response.status === 404) throw new Error('Produto não encontrado')
          throw new Error('Erro ao carregar produto')
        }
        const data = await response.json()
        const mapped = mapServerProduct(data.product || data)
        if (mapped) setProduct(mapped)
        else throw new Error('Dados do produto inválidos')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [slug, initialProduct])

  // Buscar reviews se não veio do servidor
  useEffect(() => {
    if (initialReviews.length > 0 || !product) return

    async function loadReviews() {
      try {
        const res = await fetch(`/api/v1/reviews?product_id=${product?.id}&limit=20`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch {
        // Erro silencioso
      }
    }

    loadReviews()
  }, [product, initialReviews.length])

  // Checkout
  const handleBuy = useCallback(async () => {
    if (!user) {
      router.push(`/login?redirect=/p/${slug}`)
      return
    }
    if (!product) return

    setIsAddingToCart(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erro ao criar checkout')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsAddingToCart(false)
    }
  }, [user, product, slug, selectedVariant, router])

  // Favoritar
  const toggleFavorite = useCallback(async () => {
    if (!user || !product) return
    try {
      const res = await fetch('/api/v1/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      })
      if (res.ok) setIsFavorited(!isFavorited)
    } catch {
      // Erro silencioso
    }
  }, [user, product, isFavorited])

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-brand-600 dark:text-brand-400" />
        </div>
      </PageTransition>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-2">
            {error || 'Produto não encontrado'}
          </h1>
          <a href="/categorias" className="btn-primary inline-block mt-4">Ver Categorias</a>
        </div>
      </PageTransition>
    )
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
    : 0
  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0]
  const inStock = product?.stockQuantity ? product.stockQuantity > 0 : true
  const isOwner = user?.id === product?.vendor?.id

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/" className="hover:text-brand-500 transition-colors">Início</Link>
          <ChevronRight size={14} />
          <Link href="/categorias" className="hover:text-brand-500 transition-colors">Categorias</Link>
          <ChevronRight size={14} />
          <span className="text-surface-600 dark:text-surface-300 truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galeria de Imagens */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]?.imageUrl || primaryImage?.imageUrl || '/placeholder-product.svg'}
                  alt={product.images[selectedImage]?.altText || product.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </AnimatePresence>
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 right-4 bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ⭐ Destaque
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Informações do Produto */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Título e Tags */}
            <div>
              {product.tags.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
                {product.title}
              </h1>
            </div>

            {/* Rating + Vendas */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-surface-900 dark:text-white">{product.rating.toFixed(1)}</span>
                <span className="text-surface-400">({product.reviewCount} avaliações)</span>
              </div>
              <div className="flex items-center gap-1 text-surface-400">
                <Eye size={14} />
                <span>{product.viewsCount} visualizações</span>
              </div>
              <div className="flex items-center gap-1 text-surface-400">
                <ShoppingCart size={14} />
                <span>{product.salesCount} vendas</span>
              </div>
            </div>

            {/* Preço */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-extrabold text-3xl text-surface-900 dark:text-white">
                  {formatPrice(product.basePrice)}
                </span>
                {product.originalPrice && discount > 0 && (
                  <span className="text-lg text-surface-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-400">Pagamento seguro • Escrow KIYVO</p>
            </div>

            {/* Selos de confiança */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Shield size={14} />
                <span>Compra Garantida</span>
              </div>
              {product.isDigital && (
                <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                  <Zap size={14} />
                  <span>Entrega Automática</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-surface-500">
                <Clock size={14} />
                <span>{product.deliveryType === 'automatic' ? 'Instantânea' : 'Até 24h'}</span>
              </div>
            </div>

            {/* Variantes */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white">Opções</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(selectedVariant === variant.id ? null : variant.id)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        selectedVariant === variant.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                          : 'border-surface-200 dark:border-surface-700 hover:border-brand-300'
                      }`}
                    >
                      {Object.values(variant.attributes).join(' · ') || variant.sku}
                      {variant.priceAdjustment > 0 && (
                        <span className="ml-1 text-xs">(+{formatPrice(variant.priceAdjustment)})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                disabled={!inStock || isAddingToCart || isOwner}
                className="flex-1 btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : !inStock ? (
                  'Esgotado'
                ) : isOwner ? (
                  'Seu produto'
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Comprar Agora
                  </>
                )}
              </button>
              <button
                onClick={toggleFavorite}
                className="p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart size={20} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-surface-400'} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}
                className="p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                aria-label="Compartilhar"
              >
                <Share2 size={20} className="text-surface-400" />
              </button>
            </div>

            {/* Vendor info */}
            <div className="card-base p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden">
                  {product.vendor.logoUrl ? (
                    <img src={product.vendor.logoUrl} alt={product.vendor.storeName} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={18} className="text-surface-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/vendedor/${product.vendor.slug}`} className="font-display font-bold text-sm text-surface-900 dark:text-white hover:text-brand-600 transition-colors">
                    {product.vendor.storeName}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>{product.vendor.ratingAvg.toFixed(1)}</span>
                    <span>·</span>
                    <span>{product.vendor.totalSales} vendas</span>
                    {product.vendor.level !== 'silver' && (
                      <>
                        <span>·</span>
                        <span className="text-brand-500 font-semibold">{product.vendor.level === 'diamond' ? '💎' : '🥇'}</span>
                      </>
                    )}
                  </div>
                </div>
                <Link href={`/vendedor/${product.vendor.slug}`} className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  Ver loja →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Descrição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-4">Descrição</h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none card-base p-6"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml || '<p>Sem descrição disponível.</p>' }}
          />
        </motion.div>

        {/* Avaliações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">
              Avaliações ({product.reviewCount})
            </h2>
            {user && !isOwner && (
              <Link href={`/avaliar/${product.id}`} className="btn-secondary text-sm">
                Avaliar produto
              </Link>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="card-base p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200 dark:text-surface-700'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-surface-900 dark:text-white">
                      {review.reviewerName}
                    </span>
                    <span className="text-xs text-surface-400">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-surface-600 dark:text-surface-400">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 card-base">
              <MessageCircle size={32} className="mx-auto text-surface-300 mb-2" />
              <p className="text-surface-500 dark:text-surface-400">Nenhuma avaliação ainda</p>
              <p className="text-xs text-surface-400">Seja o primeiro a avaliar este produto!</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
