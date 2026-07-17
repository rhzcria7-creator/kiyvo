'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'

const mockAdminOrders = [
  { id: 'PD-2607-089', buyer: 'João Silva', seller: 'SoftVault', product: 'Windows 11 Pro', price: 49.90, status: 'pending', date: '15/07/26' },
  { id: 'PD-2607-088', buyer: 'Ana Costa', seller: 'PixelKing', product: 'Conta Valorant', price: 89.90, status: 'delivered', date: '15/07/26' },
  { id: 'PD-2606-087', buyer: 'Pedro Santos', seller: 'EduPro', product: 'Curso Full Stack', price: 34.90, status: 'in_dispute', date: '14/07/26' },
  { id: 'PD-2606-086', buyer: 'Maria Oliveira', seller: 'DesignLab', product: 'Pack Templates', price: 19.90, status: 'confirmed', date: '14/07/26' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  confirmed: 'bg-blue-50 text-blue-700',
  in_dispute: 'bg-red-50 text-red-700',
  cancelled: 'bg-surface-100 text-surface-500',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente', delivered: 'Entregue', confirmed: 'Confirmado', in_dispute: 'Em Disputa', cancelled: 'Cancelado',
}

export default function AdminPedidosPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Gerenciar Pedidos</h1>
          <p className="text-surface-500 text-sm mt-1">{mockAdminOrders.length} pedidos recentes</p>
        </motion.div>

        <div className="card-base overflow-hidden mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Pedido</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Comprador</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Produto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Valor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {mockAdminOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-50/50 transition-colors"
                >
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-surface-900">{order.id}</td>
                  <td className="px-5 py-3 text-sm text-surface-700">{order.buyer}</td>
                  <td className="px-5 py-3 text-sm text-surface-700">{order.product}</td>
                  <td className="px-5 py-3 text-sm font-medium text-surface-900">R$ {order.price.toFixed(2)}</td>
                  <td className="px-5 py-3"><span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status]}</span></td>
                  <td className="px-5 py-3 text-sm text-surface-500">{order.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  )
}
