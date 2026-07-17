// ─────────────────────────────────────────────────────────────
// Meus Anúncios — Dados reais do Supabase
// Zero mock data
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'
import { useAuth } from '@/lib/auth/context'
import { formatBRL } from '@/domain/fees/FeeEngine'
import { Eye, ShoppingCart, Pause, Play, Plus, Package } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Product {
  id: string
  title: string
  slug: string
  base_price: number
  status: string
  sales_count: number
  views_count: number
  created_at: string
  stock_count: number
}

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  published: { variant: 'success', label: 'Ativo' },
  draft: { variant: 'warning', label: 'Rascunho' },
  paused: { variant: 'warning', label: 'Pausado' },
  archived: { variant: 'danger', label: 'Arquivado' },
  rejected: { variant: 'danger', label: 'Rejeitado' },
}

export default function AnunciosPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      if (!user) { setLoading(false); return }
      try {
        const res = await fetch('/api/products?own=true&limit=50')
        if (res.ok) {
          const data = await res.json()
          setProducts((data.products || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            slug: p.slug as string,
            base_price: Number(p.base_price) || 0,
            status: p.status as string,
            sales_count: Number(p.sales_count) || 0,
            views_count: Number(p.views_count) || 0,
            created_at: p.created_at as string,
            stock_count: Number(p.stock_count) || 0,
          })))
        }
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
    fetchProducts()
  }, [user])

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">Meus Anúncios</h1>
          <Link href="/anunciar"><Button size="sm" icon={<Plus size={16} />}>Novo Anúncio</Button></Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-base p-5 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-surface-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded w-3/4" />
                  <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product, i) => {
              const st = statusMap[product.status] || statusMap.draft
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-base p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xl shrink-0">📦</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-surface-900 dark:text-white truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={st.variant} dot>{st.label}</Badge>
                      <span className="text-xs text-surface-400">Cofre: {product.stock_count} itens</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                    <span className="flex items-center gap-1"><Eye size={14} /> {product.views_count}</span>
                    <span className="flex items-center gap-1"><ShoppingCart size={14} /> {product.sales_count}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-surface-900 dark:text-white">{formatBRL(product.base_price)}</p>
                    <button className="text-xs text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 mt-1 flex items-center gap-1">
                      {product.status === 'published' ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Ativar</>}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 dark:text-surface-500 text-lg">Nenhum anúncio ainda</p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">Crie seu primeiro anúncio e comece a vender</p>
            <Link href="/anunciar" className="btn-primary mt-4 inline-block">Criar Primeiro Anúncio</Link>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
