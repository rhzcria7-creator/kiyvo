'use client'
// Seção de produtos em destaque na home (usa API pública /api/v1/products)
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Flame, Loader2, Sparkles } from 'lucide-react'
import { ProductGrid, type Product } from '@/components/ProductCard'

export function FeaturedProductsV2() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'supabase' | 'demo'>('demo')

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/products?limit=8&ordenar=boost')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        setProducts(json.data || [])
        setSource(json.meta?.source === 'supabase' ? 'supabase' : 'demo')
        setLoading(false)
      })
      .catch(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  return (
    <section className="py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[11px] font-black uppercase tracking-widest mb-3">
              <Flame className="w-3.5 h-3.5" /> Em destaque
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              Produtos em alta
              {source === 'supabase' && (
                <span className="ml-2 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full align-middle">
                  <Sparkles className="w-3 h-3 inline mr-1" /> ao vivo
                </span>
              )}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
              Os produtos mais vendidos da semana, selecionados por vendedores verificados.
            </p>
          </div>
          <Link href="/buscar" className="hidden sm:flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="bg-white dark:bg-[#111827] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-4 animate-pulse">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 mb-4">Nenhum produto publicado ainda. Seja o primeiro!</p>
            <Link href="/vender" className="bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3 font-bold text-sm inline-flex items-center gap-2">
              Vender meu primeiro produto <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ProductGrid produtos={products} />
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/buscar" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600">
            Ver todos os produtos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
