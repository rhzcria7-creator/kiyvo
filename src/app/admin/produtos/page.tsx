'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { SkeletonList } from '@/components/ui/Skeleton'
import { InlineLoader } from '@/components/ui/LoadingScreen'
import { Search, Eye, Ban, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { clientLogger } from '@/lib/observability/client-logger'

interface AdminProductRow {
  id: string
  title: string
  seller_name: string
  price: number
  category_name?: string
  status: string
  sales_count: number
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  under_review: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  removed: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  paused: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  sold_out: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  under_review: 'Em revisão',
  removed: 'Removido',
  paused: 'Pausado',
  sold_out: 'Esgotado',
}

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<AdminProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/products?limit=50', { credentials: 'include' })
      if (res.status === 401 || res.status === 403) {
        setError('Sem permissão para acessar. Apenas administradores.')
        setProducts([])
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProducts(Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      clientLogger.error('Falha ao carregar produtos admin', { metadata: { err: String(err) } })
      setError('Não foi possível carregar produtos.')
      setProducts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filtered = products.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.seller_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
              Gerenciar Produtos
            </h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
              {loading ? 'Carregando...' : `${filtered.length} produtos`}
            </p>
          </motion.div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto ou vendedor..."
                className="input-base pl-9 text-sm w-56 sm:w-64"
              />
            </div>
            <button
              onClick={() => { setRefreshing(true); fetchProducts() }}
              disabled={loading || refreshing}
              className="btn-secondary p-2"
              aria-label="Atualizar"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading && <div className="card-base p-5"><SkeletonList rows={6} /></div>}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6 text-center border-red-200 dark:border-red-900/50"
          >
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-surface-900 dark:text-white font-semibold mb-1">Erro</p>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">{error}</p>
            <button onClick={() => { setRefreshing(true); fetchProducts() }} className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
              {refreshing ? <InlineLoader className="text-white" /> : null} Tentar novamente
            </button>
          </motion.div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="card-base p-10 text-center">
            <p className="text-surface-500 dark:text-surface-400">Nenhum produto encontrado.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Produto</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Vendedor</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Preço</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Vendas</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {filtered.map((product, i) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{product.title}</p>
                        <p className="text-xs text-surface-400">{product.category_name || '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-700 dark:text-surface-300">{product.seller_name || '—'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-surface-900 dark:text-white">{formatPrice(Number(product.price) || 0)}</td>
                      <td className="px-5 py-3 text-sm text-surface-700 dark:text-surface-300">{product.sales_count || 0}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[product.status] || statusColors.under_review}`}>
                          {statusLabels[product.status] || product.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors" aria-label="Visualizar">
                            <Eye size={14} className="text-surface-500" />
                          </button>
                          <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors" aria-label="Aprovar">
                            <CheckCircle size={14} className="text-emerald-500" />
                          </button>
                          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" aria-label="Banir">
                            <Ban size={14} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
