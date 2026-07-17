'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import {
  Star,
  Shield,
  Zap,
  ShoppingCart,
  Heart,
  Share2,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Copy,
  Package,
  MessageCircle,
  ThumbsUp,
  Flag,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /p/[slug] — Página do Produto
// Galeria, Preço, Botão Comprar REAL, Avaliações, Selos
// Dados reais do Supabase — ZERO mock
// ═══════════════════════════════════════════════════════════════

interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  descriptionHtml: string;
  basePrice: number;
  originalPrice: number | null;
  currency: string;
  stockQuantity: number;
  isDigital: boolean;
  deliveryType: string;
  status: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  tags: string[];
  images: { id: string; imageUrl: string; altText: string | null; isPrimary: boolean }[];
  vendor: {
    id: string;
    storeName: string;
    slug: string;
    logoUrl: string | null;
    ratingAvg: number;
    totalSales: number;
    level: string;
  };
  variants: { id: string; sku: string; attributes: Record<string, string>; priceAdjustment: number; stock: number }[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  reviewerName: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  async function loadProduct() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products?slug=${slug}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Produto não encontrado');
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      const p = data.product || data;
      const rawVendor = (p.vendors || {}) as Record<string, unknown>;
      const rawMetrics = (rawVendor.vendor_metrics || {}) as Record<string, unknown>;
      const rawImages = (p.product_images || p.images || []) as Record<string, unknown>[];
      const rawVariants = (p.product_variants || p.variants || []) as Record<string, unknown>[];

      setProduct({
        id: p.id,
        title: p.title,
        slug: p.slug,
        descriptionHtml: p.description_html || p.descriptionHtml || '',
        basePrice: Number(p.base_price || p.basePrice) || 0,
        originalPrice: p.original_price ? Number(p.original_price) : null,
        currency: p.currency || 'BRL',
        stockQuantity: Number(p.stock_quantity || p.stockQuantity) || 0,
        isDigital: p.is_digital !== false,
        deliveryType: p.delivery_type || 'auto',
        status: p.status,
        rating: Number(p.rating) || 0,
        reviewCount: Number(p.review_count || p.reviewCount) || 0,
        salesCount: Number(p.sales_count || p.salesCount) || 0,
        viewsCount: Number(p.views_count || p.viewsCount) || 0,
        isFeatured: p.is_featured || false,
        tags: p.tags || [],
        images: rawImages.map((img: Record<string, unknown>) => ({
          id: img.id as string,
          imageUrl: (img.image_url as string) || (img.imageUrl as string) || '',
          altText: (img.alt_text as string) || null,
          isPrimary: img.is_primary as boolean || false,
        })),
        vendor: {
          id: rawVendor.id as string || '',
          storeName: (rawVendor.store_name as string) || 'Vendedor',
          slug: (rawVendor.slug as string) || '',
          logoUrl: (rawVendor.logo_url as string) || null,
          ratingAvg: Number(rawVendor.rating_avg) || 0,
          totalSales: Number(rawVendor.total_sales) || 0,
          level: (rawMetrics.level as string) || 'bronze',
        },
        variants: rawVariants.map((v: Record<string, unknown>) => ({
          id: v.id as string,
          sku: (v.sku as string) || '',
          attributes: (v.attributes as Record<string, string>) || {},
          priceAdjustment: Number(v.price_adjustment) || 0,
          stock: Number(v.stock) || 0,
        })),
      });

      // Carregar reviews se existir
      if (data.reviews) {
        setReviews(
          data.reviews.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            rating: Number(r.rating),
            comment: (r.comment as string) || '',
            isAnonymous: r.is_anonymous as boolean || false,
            createdAt: r.created_at as string,
            reviewerName: r.is_anonymous ? 'Anônimo' : ((r.profiles as Record<string, unknown>)?.full_name as string) || 'Usuário',
          }))
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar produto';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddToCart = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!product) return;

    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error('Erro ao adicionar ao carrinho');

      router.push('/cart');
    } catch {
      setShowBuyModal(true);  // Mostra modal de erro
    } finally {
      setIsAddingToCart(false);
    }
  }, [user, product, selectedVariant, router]);

  const handleBuyNow = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!product) return;

    router.push(`/checkout?product=${product.id}${selectedVariant ? `&variant=${selectedVariant}` : ''}`);
  }, [user, product, selectedVariant, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const currentPrice = product
    ? product.basePrice + (product.variants.find((v) => v.id === selectedVariant)?.priceAdjustment || 0)
    : 0;

  const deliveryLabels: Record<string, { label: string; desc: string; color: string; icon: React.ReactNode }> = {
    auto: { label: 'Auto-entrega', desc: 'Receba instantaneamente após o pagamento', color: 'text-emerald-400', icon: <Zap className="w-5 h-5" /> },
    license_key: { label: 'Chave de Licença', desc: 'CD-Key entregue automaticamente', color: 'text-blue-400', icon: <Shield className="w-5 h-5" /> },
    download: { label: 'Download', desc: 'Link de download após confirmação', color: 'text-purple-400', icon: <Package className="w-5 h-5" /> },
    manual: { label: 'Entrega Manual', desc: 'Vendedor entrega em até 24h', color: 'text-yellow-400', icon: <Clock className="w-5 h-5" /> },
  };

  const levelBadges: Record<string, { label: string; color: string }> = {
    bronze: { label: 'Bronze', color: 'bg-amber-800/50 text-amber-400' },
    silver: { label: 'Prata', color: 'bg-slate-400/20 text-slate-300' },
    gold: { label: 'Ouro', color: 'bg-yellow-500/20 text-yellow-400' },
    diamond: { label: 'Diamante', color: 'bg-cyan-400/20 text-cyan-400' },
    platinum: { label: 'Platina', color: 'bg-purple-400/20 text-purple-400' },
  };

  if (isLoading) return <ProductSkeleton />;
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">{error || 'Produto não encontrado'}</h2>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Voltar ao início</Link>
        </motion.div>
      </div>
    );
  }

  const delivery = deliveryLabels[product.deliveryType] || deliveryLabels.manual;
  const vendorBadge = levelBadges[product.vendor.level] || levelBadges.bronze;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Breadcrumb */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/categorias" className="hover:text-white transition-colors">Categorias</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Coluna Esquerda — Galeria */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Imagem Principal */}
            <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden mb-4 relative">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.imageUrl}
                  alt={product.images[selectedImage]?.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-slate-600" />
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-lg">
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
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-blue-500' : 'border-slate-700'
                    }`}
                  >
                    <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Coluna Direita — Info + Compra */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Título + Tags */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.tags?.slice(0, 5).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{product.title}</h1>
            </div>

            {/* Vendedor */}
            <Link
              href={`/v/${product.vendor.slug}`}
              className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                {product.vendor.storeName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm flex items-center gap-2">
                  {product.vendor.storeName}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${vendorBadge.color}`}>
                    {vendorBadge.label}
                  </span>
                </p>
                <p className="text-slate-400 text-xs">
                  {product.vendor.totalSales} vendas • ⭐ {product.vendor.ratingAvg.toFixed(1)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>

            {/* Selo de Entrega */}
            <div className={`flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-xl ${delivery.color}`}>
              {delivery.icon}
              <div>
                <p className={`font-semibold ${delivery.color}`}>{delivery.label}</p>
                <p className="text-slate-400 text-xs">{delivery.desc}</p>
              </div>
            </div>

            {/* Variantes */}
            {product.variants.length > 0 && (
              <div>
                <h3 className="text-white font-medium text-sm mb-3">Opções disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id === selectedVariant ? null : v.id)}
                      className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                        v.id === selectedVariant
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {Object.values(v.attributes).join(' / ') || v.sku || 'Variante'}
                      {v.priceAdjustment !== 0 && (
                        <span className="ml-2 text-xs">
                          {v.priceAdjustment > 0 ? '+' : ''}{formatPrice(v.priceAdjustment)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preço */}
            <div className="space-y-1">
              {product.originalPrice && (
                <p className="text-slate-500 line-through text-lg">{formatPrice(product.originalPrice)}</p>
              )}
              <p className="text-4xl font-bold text-white">{formatPrice(currentPrice)}</p>
              {product.originalPrice && (
                <p className="text-emerald-400 text-sm font-medium">
                  Você economiza {formatPrice(product.originalPrice - currentPrice)} ({Math.round((1 - currentPrice / product.originalPrice) * 100)}% OFF)
                </p>
              )}
            </div>

            {/* Estoque */}
            {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <p className="text-orange-400 text-sm flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Apenas {product.stockQuantity} restante{product.stockQuantity > 1 ? 's' : ''}!
              </p>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 text-white font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {product.stockQuantity === 0 ? 'Esgotado' : 'Comprar Agora'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || isAddingToCart}
                className="px-5 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Proteção ao Comprador */}
            <div className="flex items-center gap-4 p-3 bg-emerald-900/10 border border-emerald-600/20 rounded-xl">
              <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-400 text-sm font-semibold">Proteção Kiyvo</p>
                <p className="text-slate-400 text-xs">Dinheiro retido em Escrow até você confirmar o recebimento. 7 dias para abrir disputa.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-900/30 rounded-xl">
                <Eye className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{product.viewsCount}</p>
                <p className="text-slate-500 text-xs">Visualizações</p>
              </div>
              <div className="text-center p-3 bg-slate-900/30 rounded-xl">
                <ShoppingCart className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{product.salesCount}</p>
                <p className="text-slate-500 text-xs">Vendas</p>
              </div>
              <div className="text-center p-3 bg-slate-900/30 rounded-xl">
                <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{product.rating.toFixed(1)}</p>
                <p className="text-slate-500 text-xs">{product.reviewCount} reviews</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Descrição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Descrição</h2>
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-300"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </motion.div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Avaliações ({product.reviewCount})
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 text-sm">{review.reviewerName}</span>
                    <span className="text-slate-600 text-xs">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {review.comment && <p className="text-slate-300 text-sm">{review.comment}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="bg-slate-900/30 h-12" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-video bg-slate-800/30 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-800/30 rounded w-3/4" />
            <div className="h-6 bg-slate-800/30 rounded w-1/2" />
            <div className="h-20 bg-slate-800/30 rounded-xl" />
            <div className="h-12 bg-slate-800/30 rounded-xl" />
            <div className="h-16 bg-slate-800/30 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
