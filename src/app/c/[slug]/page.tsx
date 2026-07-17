'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  SlidersHorizontal,
  Star,
  Shield,
  Zap,
  Eye,
  Tag,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /c/[slug] — Vitrine dinâmica de categorias
// Ex: /c/jogos, /c/contas, /c/software
// Dados reais do Supabase via API — ZERO mock
// ═══════════════════════════════════════════════════════════════

interface Product {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  originalPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  deliveryType: string;
  isDigital: boolean;
  imageUrl: string | null;
  vendorName: string;
  vendorSlug: string;
  isFeatured: boolean;
}

interface CategoryInfo {
  name: string;
  slug: string;
  icon: string;
  description: string;
  parentId: string | null;
  parentName: string | null;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCategory();
    }
  }, [slug, sortBy]);

  async function loadCategory() {
    setIsLoading(true);
    setError(null);
    try {
      // Buscar info da categoria e produtos em paralelo
      const [catRes, prodRes] = await Promise.all([
        fetch(`/api/v1/search?category=${slug}&limit=0`),
        fetch(`/api/v1/search?category=${slug}&sort=${sortBy}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}${deliveryFilter !== 'all' ? `&delivery=${deliveryFilter}` : ''}`),
      ]);

      if (!catRes.ok || !prodRes.ok) {
        throw new Error('Erro ao carregar categoria');
      }

      const catData = await catRes.json();
      const prodData = await prodRes.json();

      setCategory(catData.category || {
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        slug,
        icon: '📦',
        description: '',
        parentId: null,
        parentName: null,
      });

        setProducts(
          (prodData.products || []).map((p: Record<string, unknown>) => {
            const vendor = (p.vendors || {}) as Record<string, unknown>;
            const images = (p.product_images || []) as Record<string, unknown>[];
            return {
              id: p.id as string,
              title: p.title as string,
              slug: p.slug as string,
              basePrice: Number(p.base_price || p.basePrice) || 0,
              originalPrice: p.original_price ? Number(p.original_price) : null,
              currency: (p.currency as string) || 'BRL',
              rating: Number(p.rating) || 0,
              reviewCount: Number(p.review_count || p.reviewCount) || 0,
              salesCount: Number(p.sales_count || p.salesCount) || 0,
              deliveryType: (p.delivery_type as string) || 'auto',
              isDigital: p.is_digital !== false,
              imageUrl: (p.image_url as string) || (images?.[0]?.image_url as string) || null,
              vendorName: (vendor.store_name as string) || 'Vendedor',
              vendorSlug: (vendor.slug as string) || '',
              isFeatured: p.is_featured as boolean || false,
            };
          })
        );
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

  const deliveryLabels: Record<string, { label: string; color: string }> = {
    auto: { label: 'Auto-entrega', color: 'text-emerald-400 bg-emerald-400/10' },
    license_key: { label: 'Chave', color: 'text-blue-400 bg-blue-400/10' },
    download: { label: 'Download', color: 'text-purple-400 bg-purple-400/10' },
    manual: { label: 'Manual', color: 'text-yellow-400 bg-yellow-400/10' },
  };

  if (isLoading) {
    return <CategorySkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={loadCategory} className="px-4 py-2 bg-blue-600 rounded-lg text-white">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/categorias" className="hover:text-white transition-colors">Categorias</Link>
            {category?.parentName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-500">{category.parentName}</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-white font-medium">{category?.name}</span>
          </div>
        </div>
      </div>

      {/* Hero da Categoria */}
      <div className="bg-gradient-to-r from-blue-600/20 via-blue-500/5 to-transparent border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{category?.icon || '📦'}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">{category?.name}</h1>
                {category?.description && (
                  <p className="text-slate-400 mt-1">{category.description}</p>
                )}
                <p className="text-slate-500 text-sm mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controles */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 hover:border-slate-600 transition-colors text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-300 text-sm focus:border-blue-500 outline-none"
          >
            <option value="relevance">Relevância</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="rating">Melhor avaliação</option>
            <option value="newest">Mais recentes</option>
          </select>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tipo de Entrega</label>
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="auto">Auto-entrega</option>
                  <option value="license_key">Chave</option>
                  <option value="download">Download</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Preço Mínimo</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  placeholder="R$ 0"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Preço Máximo</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  placeholder="R$ 10.000"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid de Produtos */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhum produto nesta categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product, index) => {
              const delivery = deliveryLabels[product.deliveryType] || deliveryLabels.manual;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link href={`/p/${product.slug}`} className="block group">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                      {/* Imagem */}
                      <div className="aspect-video bg-slate-800 relative overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Tag className="w-8 h-8" />
                          </div>
                        )}
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          {product.isFeatured && (
                            <span className="px-2 py-0.5 bg-yellow-500/90 text-black text-xs font-bold rounded-md">
                              ⭐ Destaque
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-md ${delivery.color}`}>
                            {delivery.label}
                          </span>
                        </div>
                        {product.originalPrice && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md">
                            -{Math.round((1 - product.basePrice / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {product.title}
                        </h3>
                        <Link
                          href={`/v/${product.vendorSlug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-400 hover:text-blue-400 mt-1 flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" />
                          {product.vendorName}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          {product.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {product.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {product.salesCount} vendas
                          </span>
                        </div>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-lg font-bold text-white">
                            {formatPrice(product.basePrice)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-slate-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="bg-slate-900/30 h-12" />
      <div className="bg-slate-900/30 h-32" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-10 bg-slate-800/30 rounded-xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-2xl h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}
