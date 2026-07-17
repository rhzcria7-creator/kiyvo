'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getProductById, mockProducts } from '@/data/mockProducts'
import { mockReviews } from '@/data/mockReviews'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, Share2, Shield, Zap, Award, Clock, User, MessageCircle, ChevronLeft, ChevronRight, ShoppingCart, Tag, Truck } from 'lucide-react'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, ScaleInOnScroll, StaggerContainer, StaggerItem } from '@/components/animations'
import { AnimatedShield, AnimatedLightning } from '@/components/svgs/AnimatedSVGs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const relatedProducts = mockProducts.filter(p => !p.featured).slice(0, 4)

export default function ProductPage() {
  const params = useParams()
  const product = getProductById(params.id as string) || mockProducts[0]
  const [selectedImage, setSelectedImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')

  const images = [product.image, product.image, product.image]
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/" className="hover:text-brand-600">Início</Link>
          <span>/</span>
          <Link href={`/categoria/${product.categorySlug}`} className="hover:text-brand-600">{product.category}</Link>
          <span>/</span>
          <span className="text-surface-900 font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-100 mb-3">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-display font-bold text-sm">
                  -{discount}%
                </div>
              )}

              {/* Nav arrows */}
              <button
                onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === selectedImage ? 'border-brand-500 ring-2 ring-brand-200' : 'border-surface-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right — Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand">{product.category}</Badge>
                <Badge variant="default">{product.type === 'account' ? 'Conta' : product.type === 'key' ? 'Chave' : product.type === 'course' ? 'Curso' : product.type === 'license' ? 'Licença' : product.type === 'template' ? 'Template' : product.type === 'ebook' ? 'E-book' : product.type === 'subscription' ? 'Assinatura' : product.type === 'giftcard' ? 'Gift Card' : 'Digital'}</Badge>
                {product.deliveryType === 'auto' && (
                  <Badge variant="success">Entrega automática</Badge>
                )}
              </div>
              <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-surface-300'} />
                ))}
              </div>
              <span className="text-sm font-medium text-surface-900">{product.rating}</span>
              <span className="text-sm text-surface-400">({product.reviews} avaliações)</span>
              <span className="text-sm text-surface-400">•</span>
              <span className="text-sm text-surface-400">{product.sales} vendas</span>
            </div>

            {/* Price */}
            <div className="p-5 bg-surface-50 rounded-2xl">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-extrabold text-3xl text-surface-900">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-surface-400 line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-emerald-600 text-sm font-semibold mt-1">
                  Economize R$ {(product.originalPrice! - product.price).toFixed(2)} ({discount}% de desconto)
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-surface-500">
                <Truck size={14} />
                <span>Entrega {product.deliveryType === 'auto' ? 'automática instantânea' : 'via chat pelo vendedor'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Link href="/checkout">
                  <Button size="lg" className="w-full" icon={<ShoppingCart size={18} />}>
                    Comprar Agora
                  </Button>
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setLiked(!liked); toast.success(liked ? 'Removido dos favoritos' : 'Adicionado aos favoritos') }}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  liked ? 'border-red-200 bg-red-50 text-red-500' : 'border-surface-200 text-surface-400 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado!') }}
                className="w-12 h-12 rounded-xl border-2 border-surface-200 flex items-center justify-center text-surface-400 hover:text-brand-600 hover:border-brand-200 transition-all"
              >
                <Share2 size={20} />
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Compra Garantida', color: 'text-brand-600 bg-brand-50' },
                { icon: Zap, label: 'Entrega Rápida', color: 'text-amber-600 bg-amber-50' },
                { icon: Award, label: 'Ganhe PD Points', color: 'text-purple-600 bg-purple-50' },
              ].map((badge) => (
                <div key={badge.label} className={`p-3 rounded-xl ${badge.color} text-center`}>
                  <badge.icon size={20} className="mx-auto mb-1" />
                  <p className="text-xs font-medium">{badge.label}</p>
                </div>
              ))}
            </div>

            {/* Seller info */}
            <div className="card-base p-4">
              <div className="flex items-center gap-3">
                <img src={product.seller.avatar} alt={product.seller.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-surface-900">{product.seller.name}</p>
                    {product.seller.verified && (
                      <span className="text-brand-600 text-xs font-semibold bg-brand-50 px-2 py-0.5 rounded-full">✓ Verificado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {product.seller.rating}</span>
                    <span>{product.seller.sales} vendas</span>
                    <span>Membro desde {product.seller.memberSince}</span>
                  </div>
                </div>
                <Link href={`/perfil?id=${product.seller.id}`} className="text-sm text-brand-600 font-semibold hover:text-brand-700">
                  Ver perfil
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-surface-200 mb-6">
            {(['description', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-display font-semibold transition-all border-b-2 ${
                  activeTab === tab ? 'text-brand-600 border-brand-600' : 'text-surface-400 border-transparent hover:text-surface-600'
                }`}
              >
                {tab === 'description' ? 'Descrição' : `Avaliações (${product.reviews})`}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' ? (
              <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="prose max-w-none">
                  <p className="text-surface-600 leading-relaxed">{product.description}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-surface-50 border border-surface-200 rounded-full text-xs font-medium text-surface-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-4">
                  {mockReviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="card-base p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={review.avatar} alt={review.user} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{review.user}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs text-surface-400">{review.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-surface-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products */}
        <FadeInOnScroll className="mt-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <div key={p.id} className="card-base overflow-hidden group hover:shadow-card-hover transition-shadow">
                <Link href={`/produto/${p.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-surface-400">{p.category}</p>
                    <p className="font-display font-bold text-sm text-surface-900 mt-0.5 line-clamp-2">{p.title}</p>
                    <p className="font-display font-extrabold text-brand-600 mt-2">R$ {p.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
