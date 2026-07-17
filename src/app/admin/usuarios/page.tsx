'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Search, Shield, Ban, Eye } from 'lucide-react'

const mockUsers = [
  { id: '1', username: 'PixelKing', email: 'pixel@email.com', plan: 'diamond', verification: 'verified', sales: 2341, status: 'active' },
  { id: '2', username: 'SoftVault', email: 'soft@email.com', plan: 'gold', verification: 'verified', sales: 1876, status: 'active' },
  { id: '3', username: 'EduPro', email: 'edu@email.com', plan: 'gold', verification: 'verified', sales: 954, status: 'active' },
  { id: '4', username: 'DesignLab', email: 'design@email.com', plan: 'silver', verification: 'pending', sales: 567, status: 'active' },
  { id: '5', username: 'BadActor', email: 'bad@email.com', plan: 'silver', verification: 'rejected', sales: 23, status: 'banned' },
]

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  banned: 'bg-red-50 text-red-700',
}
const verifyColors: Record<string, string> = {
  verified: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
  unverified: 'bg-surface-100 text-surface-500',
}

export default function AdminUsuariosPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Gerenciar Usuários</h1>
            <p className="text-surface-500 text-sm mt-1">{mockUsers.length} usuários</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Buscar usuário..." className="input-base pl-9 text-sm w-64" />
          </div>
        </motion.div>

        <div className="card-base overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Usuário</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Plano</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Verificação</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Vendas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {mockUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-surface-900">{user.username}</p>
                    <p className="text-xs text-surface-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge bg-brand-50 text-brand-700">{user.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${verifyColors[user.verification]}`}>{user.verification}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-surface-700">{user.sales}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${statusColors[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><Eye size={14} className="text-surface-500" /></button>
                      <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><Shield size={14} className="text-surface-500" /></button>
                      <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><Ban size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  )
}
