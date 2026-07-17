'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Star,
  Package,
  Clock,
  CheckCircle,
  ChevronRight,
  Award,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /v/[slug] — Perfil Público do Vendedor
// Lista de anúncios, taxa de sucesso, emblemas, data de registo
// ═══════════════════════════════════════════════════════════════

interface VendorProfile {
  id: string;
  storeName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  ratingAvg: number;
  totalSales: number;
  totalProducts: number;
  isActive: boolean;
  createdAt: string;
  metrics: {
    level: string;
    experiencePoints: number;
    disputeRatePercent: number;
    positiveReviewsPercent: number;
    successfulDeliveries: number;
    avgResponseTimeHours: number | null;
  };
}

interface VendorProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  originalPrice: number | null;
  rating: number;
  salesCount: number;
  deliveryType: string;
  imageUrl: string | null;
}

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadVendor();
  }, [slug]);

  async function loadVendor() {
    setIsLoading(true);
    setError(null);
    try {
      const [vendorRes, productsRes] = await Promise.all([
        fetch(`/api/v1/vendors?slug=${slug}`),
        fetch(`/api/products?vendor_slug=${slug}&status=published&limit=20`),
      ]);

      if (!vendorRes.ok) throw new Error('Vendedor não encontrado');

      const vendorData = await vendorRes.json();
      const v = vendorData.vendor || vendorData;

      setVendor({
        id: v.id,
        storeName: v.store_name || v.storeName || slug,
        slug: v.slug || slug,
        description: v.description || null,
        logoUrl: v.logo_url || v.logoUrl || null,
        bannerUrl: v.banner_url || v.bannerUrl || null,
        ratingAvg: Number(v.rating_avg || v.ratingAvg) || 0,
        totalSales: Number(v.total_sales || v.totalSales) || 0,
        totalProducts: Number(v.total_products || v.totalProducts) || 0,
        isActive: v.is_active !== false,
        createdAt: v.created_at || v.createdAt || new Date().toISOString(),
        metrics: {
          level: v.vendor_metrics?.level || 'bronze',
          experiencePoints: Number(v.vendor_metrics?.experience_points) || 0,
          disputeRatePercent: Number(v.vendor_metrics?.dispute_rate_percent) || 0,
          positiveReviewsPercent: Number(v.vendor_metrics?.positive_reviews_percent) || 100,
          successfulDeliveries: Number(v.vendor_metrics?.successful_deliveries) || 0,
          avgResponseTimeHours: v.vendor_metrics?.avg_response_time_hours ? Number(v.vendor_metrics.avg_response_time_hours) : null,
        },
      });

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(
          (prodData.products || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            slug: p.slug as string,
            basePrice: Number(p.base_price || p.basePrice) || 0,
            originalPrice: p.original_price ? Number(p.original_price) : null,
            rating: Number(p.rating) || 0,
            salesCount: Number(p.sales_count || p.salesCount) || 0,
            deliveryType: (p.delivery_type as string) || 'auto',
            imageUrl: ((p.product_images as Record<string, unknown>[])?.[0]?.image_url as string) || null,
          }))
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const levelConfig: Record<string, { label: string; emoji: string; color: string; bgGradient: string }> = {
    bronze: { label: 'Bronze', emoji: '🥉', color: 'text-amber-400', bgGradient: 'from-amber-600/20 to-amber-800/10' },
    silver: { label: 'Prata', emoji: '🥈', color: 'text-slate-300', bgGradient: 'from-slate-400/20 to-slate-600/10' },
    gold: { label: 'Ouro', emoji: '🥇', color: 'text-yellow-400', bgGradient: 'from-yellow-500/20 to-yellow-700/10' },
    diamond: { label: 'Diamante', emoji: '💎', color: 'text-cyan-400', bgGradient: 'from-cyan-400/20 to-cyan-600/10' },
    platinum: { label: 'Platina', emoji: '👑', color: 'text-purple-400', bgGradient: 'from-purple-400/20 to-purple-600/10' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 animate-pulse">
        <div className="h-48 bg-slate-900/30" />
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <div className="h-16 bg-slate-800/30 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-800/30 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Voltar</Link>
        </div>
      </div>
    );
  }

  const level = levelConfig[vendor.metrics.level] || levelConfig.bronze;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Banner */}
      <div className={`h-48 bg-gradient-to-r ${level.bgGradient} relative`}>
        {vendor.bannerUrl && (
          <img src={vendor.bannerUrl} alt="" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        {/* Header do Vendedor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {vendor.logoUrl ? (
                <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                vendor.storeName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{vendor.storeName}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${level.color} bg-slate-800`}>
                  {level.emoji} {level.label}
                </span>
                {vendor.isActive && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-400/10">
                    ✓ Verificado
                  </span>
                )}
              </div>
              {vendor.description && (
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{vendor.description}</p>
              )}
              <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Membro desde {new Date(vendor.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <Package className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{vendor.totalSales}</p>
            <p className="text-slate-400 text-xs">Vendas</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{vendor.ratingAvg.toFixed(1)}</p>
            <p className="text-slate-400 text-xs">Avaliação</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{vendor.metrics.positiveReviewsPercent.toFixed(0)}%</p>
            <p className="text-slate-400 text-xs">Positivas</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{vendor.totalProducts}</p>
            <p className="text-slate-400 text-xs">Produtos</p>
          </div>
        </motion.div>

        {/* Taxa de Disputa */}
        {vendor.metrics.disputeRatePercent > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-4 p-3 rounded-xl border ${
              vendor.metrics.disputeRatePercent > 5
                ? 'bg-red-900/10 border-red-600/20 text-red-400'
                : 'bg-yellow-900/10 border-yellow-600/20 text-yellow-400'
            }`}
          >
            <p className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Taxa de disputa: {vendor.metrics.disputeRatePercent.toFixed(1)}%
              {vendor.metrics.disputeRatePercent > 5 && ' — Atenção: taxa acima do recomendado'}
            </p>
          </motion.div>
        )}

        {/* Produtos do Vendedor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Produtos ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">Nenhum produto disponível</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link href={`/p/${product.slug}`} className="block group">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all">
                      <div className="aspect-video bg-slate-800 relative">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-white">{formatPrice(product.basePrice)}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-slate-400">{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
