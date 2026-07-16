'use client'

import { mockOrders } from '@/data/mockFAQ'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { formatPrice } from '@/lib/utils'

export default function VendasPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 mb-6">Minhas Vendas</h1>
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">💰</div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-surface-900">{order.product}</p>
                <p className="text-sm text-surface-400">{order.id} • Comprador: {order.seller} • {order.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-emerald-600">+{formatPrice(order.price)}</p>
                <Badge variant="success" dot>Recebido</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
