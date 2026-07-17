'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Search, Eye, Ban, CheckCircle } from 'lucide-react'

const mockAdminProducts = [
  { id: '1', title: 'Windows 11 Pro — Licença Vitalícia', seller: 'SoftVault', price: 49.90, category: 'Software', status: 'active', sales: 5678 },
  { id: '2', title: 'Conta Valorant Diamante + 40 Skins', seller: 'PixelKing', price: 89.90, category: 'Jogos', status: 'active', sales: 234 },
  { id: '3', title: 'Curso Full Stack 120h', seller: 'EduPro', price: 34.90, category: 'Cursos', status: 'active', sales: 1890 },
  { id: '4', title: 'Pack Templates Canva', seller: 'DesignLab', price: 19.90, category: 'Design', status: 'under_review', sales: 3456 },
]

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  under_review: 'bg-amber-50 text-amber-700',
  removed: 'bg-red-50 text-red-700',
}

export default function AdminProdutosPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Gerenciar Produtos</h1>
            <p className="text-surface-500 text-sm mt-1">{mockAdminProducts.length} produtos</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Buscar produto..." className="input-base pl-9 text-sm w-64" />
          </div>
        </motion.div>

        <div className="card-base overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Produto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Vendedor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Preço</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Vendas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {mockAdminProducts.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-surface-900">{product.title}</p>
                    <p className="text-xs text-surface-400">{product.category}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-surface-700">{product.seller}</td>
                  <td className="px-5 py-3 text-sm font-medium text-surface-900">R$ {product.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm text-surface-700">{product.sales}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${statusColors[product.status]}`}>{product.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><Eye size={14} className="text-surface-500" /></button>
                      <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><CheckCircle size={14} className="text-emerald-500" /></button>
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
