'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Package, Plus, Shield, Edit3, Eye, EyeOff, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// /vendor/products — Gestão do catálogo (CRUD real no Supabase)

interface VendorProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  stockQuantity: number;
  status: string;
  salesCount: number;
  rating: number;
  deliveryType: string;
  imageUrl: string | null;
  vaultCount: number;
}

export default function VendorProductsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (profile && profile.role !== 'vendor' && profile.role !== 'admin') { router.push('/vendor/onboarding'); return; }
    if (user) loadProducts();
  }, [user, profile, authLoading]);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products?role=vendor');
      if (res.ok) {
        const data = await res.json();
        setProducts((data.products || []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          title: p.title as string,
          slug: p.slug as string,
          basePrice: Number(p.base_price || p.basePrice) || 0,
          stockQuantity: Number(p.stock_quantity || p.stockQuantity) || 0,
          status: (p.status as string) || 'draft',
          salesCount: Number(p.sales_count || p.salesCount) || 0,
          rating: Number(p.rating) || 0,
          deliveryType: (p.delivery_type as string) || 'auto',
          imageUrl: ((p.product_images as Record<string, unknown>[])?.[0]?.image_url as string) || null,
          vaultCount: Number(p.vault_count) || 0,
        })));
      }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: 'text-slate-400 bg-slate-400/10' },
    published: { label: 'Publicado', color: 'text-emerald-400 bg-emerald-400/10' },
    banned: { label: 'Banido', color: 'text-red-400 bg-red-400/10' },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-6 h-6 text-amber-400" /> Meus Produtos
            </h1>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/vender')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl text-white font-medium">
              <Plus className="w-4 h-4" /> Novo Anúncio
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-slate-800/30 rounded-xl p-5 h-24 animate-pulse" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Nenhum produto</h3>
            <p className="text-slate-500 text-sm mb-6">Crie seu primeiro anúncio e comece a vender</p>
            <button onClick={() => router.push('/vender')} className="px-6 py-2.5 bg-amber-600 rounded-xl text-white font-medium">Criar Anúncio</button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p, i) => {
              const s = statusConfig[p.status] || statusConfig.draft;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="w-16 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-slate-600 m-auto mt-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{p.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      <span className="text-slate-400 text-xs">R$ {p.basePrice.toFixed(2)}</span>
                      <span className="text-slate-400 text-xs">{p.salesCount} vendas</span>
                      <span className="text-slate-500 text-xs">Cofre: {p.vaultCount} itens</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/vendor/inventory/${p.id}`} className="p-2 hover:bg-slate-800 rounded-lg text-amber-400 transition-colors" title="Gerenciar Cofre">
                      <Shield className="w-4 h-4" />
                    </Link>
                    <Link href={`/p/${p.slug}`} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Ver produto">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-blue-400 transition-colors" title="Editar">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
