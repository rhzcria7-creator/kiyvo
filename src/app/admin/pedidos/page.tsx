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
            <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
              Gerenciar Pedidos
            </h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
              {loading ? 'Carregando...' : `${orders.length} pedidos`}
            </p>
          </motion.div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm self-start sm:self-auto disabled:opacity-50"
            aria-label="Atualizar lista"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
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
                  <tr className="border-b border-surface-100 dark:border-surface-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Comprador
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-mono font-semibold text-surface-900 dark:text-white">
                        {order.order_number || order.id.slice(0, 10)}
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-700 dark:text-surface-300">
                        {order.buyer_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-700 dark:text-surface-300">
                        {order.seller_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-700 dark:text-surface-300 max-w-xs truncate">
                        {order.product_title || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-surface-900 dark:text-white">
                        {formatPrice(Number(order.subtotal) || 0)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[order.status] || statusColors.pending
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-500 dark:text-surface-400">
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
