'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { InlineLoader } from '@/components/ui/LoadingScreen'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { clientLogger } from '@/lib/observability/client-logger'

interface AdminOrderRow {
  id: string
  order_number: string
  buyer_name: string
  seller_name: string
  product_title: string
  subtotal: number
  status: string
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  paid: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  confirmed: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  in_dispute: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  cancelled: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
  refunded: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  delivered: 'Entregue',
  confirmed: 'Confirmado',
  in_dispute: 'Em Disputa',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/orders?limit=50', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.status === 401 || res.status === 403) {
        setError('Sem permissão para acessar. Apenas administradores.')
        setOrders([])
        return
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setOrders(Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      clientLogger.error('Falha ao carregar pedidos admin', { metadata: { err: String(err) } })
      setError('Não foi possível carregar os pedidos. Tente novamente.')
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1 w-6 bg-earth-500 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-widest text-earth-650">Painel de Controle</p>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-earth-950 dark:text-white tracking-tight">
              Gerenciamento de Pedidos
            </h1>
            <p className="text-earth-500 dark:text-white/40 text-xs sm:text-sm font-semibold mt-1">
              {loading ? 'Carregando transações...' : `${orders.length} pedidos de custódia e escrow`}
            </p>
          </motion.div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto disabled:opacity-50"
            aria-label="Atualizar lista"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {loading && (
          <div className="card-base p-5">
            <SkeletonList rows={6} />
          </div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6 text-center border-red-200 dark:border-red-900/50"
          >
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-surface-900 dark:text-white font-semibold mb-1">Erro</p>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">{error}</p>
            <button onClick={handleRefresh} className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
              {refreshing ? <InlineLoader className="text-white" /> : null} Tentar novamente
            </button>
          </motion.div>
        )}

        {!loading && !error && orders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base p-10 text-center">
            <p className="text-surface-500 dark:text-surface-400">Nenhum pedido encontrado.</p>
          </motion.div>
        )}

        {!loading && !error && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base overflow-hidden mt-2"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-earth-100/60 dark:border-white/10 bg-earth-50/50 dark:bg-white/5">
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Pedido
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Comprador
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Vendedor
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Produto
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Valor
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-earth-600 dark:text-white/40 uppercase tracking-widest">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-earth-50/30 dark:hover:bg-white/5 border-b border-earth-50/50 dark:border-white/5 transition-colors"
                    >
                      <td className="px-5 py-3 text-xs sm:text-sm font-mono font-black text-earth-900 dark:text-white">
                        {order.order_number || order.id.slice(0, 10)}
                      </td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-semibold text-earth-700 dark:text-white/60">
                        {order.buyer_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-semibold text-earth-700 dark:text-white/60">
                        {order.seller_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-bold text-earth-700 dark:text-white/60 max-w-xs truncate">
                        {order.product_title || '—'}
                      </td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-black text-earth-950 dark:text-white">
                        {formatPrice(Number(order.subtotal) || 0)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            statusColors[order.status] || statusColors.pending
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-earth-400 dark:text-white/40">
                        {order.created_at ? formatDate(order.created_at) : '—'}
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
