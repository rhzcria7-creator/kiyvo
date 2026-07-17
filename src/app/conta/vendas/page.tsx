// ─────────────────────────────────────────────────────────────
// Minhas Vendas — Dados reais do Supabase
// Zero mock data
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { useAuth } from '@/lib/auth/context'
import { formatBRL } from '@/domain/fees/FeeEngine'
import { TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  title: string
  price: number
  status: string
  created_at: string
  buyer_name: string
}

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  delivered: { variant: 'success', label: 'Entregue' },
  confirmed: { variant: 'success', label: 'Confirmado' },
  paid: { variant: 'info', label: 'Pago' },
  pending: { variant: 'warning', label: 'Pendente' },
  pending_payment: { variant: 'warning', label: 'Aguardando pagamento' },
  in_dispute: { variant: 'info', label: 'Em disputa' },
  cancelled: { variant: 'danger', label: 'Cancelado' },
  refunded: { variant: 'danger', label: 'Reembolsado' },
}

export default function VendasPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!user) { setLoading(false); return }
      try {
        const res = await fetch('/api/orders?role=vendor&limit=50')
        if (res.ok) {
          const data = await res.json()
          setOrders((data.orders || []).map((o: Record<string, unknown>) => ({
            id: o.id as string,
            order_number: o.order_number as string,
            title: (o.order_items as Record<string, unknown>[])?.[0]?.product_title as string || 'Pedido',
            price: Number(o.vendor_net || o.subtotal) || 0,
            status: o.status as string,
            created_at: o.created_at as string,
            buyer_name: (o.profiles as Record<string, unknown>)?.username as string || 'Comprador',
          })))
        }
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [user])

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('pt-BR') } catch { return d }
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6">Minhas Vendas</h1>

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
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const st = statusMap[order.status] || statusMap.pending
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-base p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-lg shrink-0">💰</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-surface-900 dark:text-white truncate">{order.title}</p>
                    <p className="text-sm text-surface-400 dark:text-surface-500">
                      {order.order_number} • Comprador: {order.buyer_name} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-emerald-600 dark:text-emerald-400">+{formatBRL(order.price)}</p>
                    <Badge variant={st.variant} dot>{st.label}</Badge>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <TrendingUp size={48} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 dark:text-surface-500 text-lg">Nenhuma venda ainda</p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">Comece a anunciar seus produtos digitais</p>
            <Link href="/anunciar" className="btn-primary mt-4 inline-block">Criar Primeiro Anúncio</Link>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
