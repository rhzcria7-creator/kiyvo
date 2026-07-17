'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Filter, Download } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, NumberTicker } from '@/components/ui/AdvancedAnimations'

const transactions = [
  { id: 'TX-001', type: 'purchase', title: 'Windows 11 Pro — Licença', amount: -49.90, method: 'PIX', status: 'completed', date: '15/07/26', time: '14:32' },
  { id: 'TX-002', type: 'sale', title: 'Pack Templates Canva', amount: 17.91, method: 'Saldo PD', status: 'completed', date: '15/07/26', time: '11:20' },
  { id: 'TX-003', type: 'withdrawal', title: 'Saque via PIX', amount: -450.00, method: 'PIX', status: 'completed', date: '12/07/26', time: '09:15' },
  { id: 'TX-004', type: 'purchase', title: 'Curso Full Stack 120h', amount: -34.90, method: 'Cartão', status: 'completed', date: '11/07/26', time: '16:45' },
  { id: 'TX-005', type: 'sale', title: 'Conta Valorant Diamante', amount: 80.91, method: 'PIX', status: 'completed', date: '10/07/26', time: '22:10' },
  { id: 'TX-006', type: 'bonus', title: 'PD Points — Bônus semanal', amount: 5.00, method: 'Sistema', status: 'completed', date: '10/07/26', time: '00:00' },
  { id: 'TX-007', type: 'purchase', title: 'Netflix Premium 1 Ano', amount: -79.90, method: 'PIX', status: 'pending', date: '15/07/26', time: '15:30' },
  { id: 'TX-008', type: 'refund', title: 'Reembolso — Key Steam', amount: 149.90, method: 'PIX', status: 'completed', date: '08/07/26', time: '12:00' },
]

const typeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string }> = {
  purchase: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50', label: 'Compra' },
  sale: { icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Venda' },
  withdrawal: { icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Saque' },
  bonus: { icon: ArrowDownLeft, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Bônus' },
  refund: { icon: ArrowDownLeft, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Reembolso' },
}

export default function HistoricoPage() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Histórico de Transações</h1>
            <p className="text-surface-500 text-sm mt-1">Todas as suas movimentações financeiras</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-secondary text-sm py-2 flex items-center gap-2">
            <Download size={14} /> Exportar
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total gasto', value: 164.70, color: 'text-red-600' },
            { label: 'Total recebido', value: 103.82, color: 'text-emerald-600' },
            { label: 'Saldo disponível', value: 289.12, color: 'text-brand-600' },
          ].map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.08}>
              <div className="card-base p-4">
                <p className="text-xs text-surface-500">{stat.label}</p>
                <p className={`font-display font-extrabold text-xl ${stat.color}`}>
                  R$ <NumberTicker value={Math.floor(stat.value)} />
                </p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {[{ id: 'all', label: 'Todas' }, { id: 'purchase', label: 'Compras' }, { id: 'sale', label: 'Vendas' }, { id: 'withdrawal', label: 'Saques' }, { id: 'bonus', label: 'Bônus' }].map((f) => (
            <motion.button
              key={f.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.id ? 'bg-brand-600 text-white' : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-200'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Transactions List */}
        <StaggerContainer className="space-y-2">
          {filtered.map((tx) => {
            const config = typeConfig[tx.type]
            const Icon = config.icon
            const isPositive = tx.amount > 0

            return (
              <StaggerItem key={tx.id}>
                <motion.div whileHover={{ x: 4 }} className="card-base p-4 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-all">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-surface-900 truncate">{tx.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.color}`}>{config.label}</span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">{tx.id} • {tx.method} • {tx.date} {tx.time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-display font-extrabold text-sm ${isPositive ? 'text-emerald-600' : 'text-surface-900'}`}>
                      {isPositive ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {tx.status === 'completed' ? (
                        <CheckCircle size={10} className="text-emerald-500" />
                      ) : (
                        <Clock size={10} className="text-amber-500" />
                      )}
                      <span className="text-[10px] text-surface-400">{tx.status === 'completed' ? 'Concluída' : 'Pendente'}</span>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}
