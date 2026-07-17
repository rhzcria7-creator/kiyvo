'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Heart, Trash2, Star, Package } from 'lucide-react';
import Link from 'next/link';

// /buyer/favorites — Lista de desejos

interface FavoriteProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  rating: number;
  imageUrl: string | null;
}

export default function BuyerFavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadFavorites();
  }, [user, authLoading]);

  async function loadFavorites() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/favorites');
      if (res.ok) {
        const data = await res.json();
        setProducts(
          (data.favorites || []).map((f: Record<string, unknown>) => {
            const prod = (f.products || {}) as Record<string, unknown>;
            const images = (prod.product_images || []) as Record<string, unknown>[];
            return {
              id: (prod.id || f.product_id) as string,
              title: (prod.title || '') as string,
              slug: (prod.slug || '') as string,
              basePrice: Number(prod.base_price || 0),
              rating: Number(prod.rating || 0),
              imageUrl: (images?.[0]?.image_url || null) as string | null,
            };
          })
        );
      }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-pink-600/20 via-pink-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" /> Favoritos
          </h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-slate-800/30 rounded-xl h-52 animate-pulse" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16"><Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Nenhum favorito ainda</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/p/${p.slug}`} className="block group">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-pink-500/30 transition-all">
                    <div className="aspect-video bg-slate-800 relative">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-600 absolute inset-0 m-auto" />}
                    </div>
                    <div className="p-3">
                      <h3 className="text-white text-sm font-medium truncate group-hover:text-pink-400 transition-colors">{p.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-white">R$ {p.basePrice.toFixed(2)}</span>
                        {p.rating > 0 && <span className="flex items-center gap-1 text-xs text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{p.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
