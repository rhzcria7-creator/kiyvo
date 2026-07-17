'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Users, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, NumberTicker, StaggerContainer, StaggerItem } from '@/components/ui/AdvancedAnimations'

const stats = [
  { label: 'Receita Total', value: 284750, prefix: 'R$ ', icon: DollarSign, change: '+12.5%', up: true, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Receita Mês', value: 84520, prefix: 'R$ ', icon: TrendingUp, change: '+8.3%', up: true, color: 'bg-blue-50 text-blue-600' },
  { label: 'Transações', value: 4567, icon: ShoppingCart, change: '+15.2%', up: true, color: 'bg-purple-50 text-purple-600' },
  { label: 'Ticket Médio', value: 62, prefix: 'R$ ', icon: Users, change: '-2.1%', up: false, color: 'bg-amber-50 text-amber-600' },
]

const revenue = [
  { month: 'Jan', value: 45200 },
  { month: 'Fev', value: 52100 },
  { month: 'Mar', value: 48700 },
  { month: 'Abr', value: 61300 },
  { month: 'Mai', value: 72400 },
  { month: 'Jun', value: 84520 },
]

export default function AdminFinanceiroPage() {
  const maxVal = Math.max(...revenue.map(r => r.value))

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Financeiro</h1>
          <p className="text-surface-500 text-sm mt-1">Visão geral financeira da plataforma</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.05}>
              <div className="card-base p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-surface-500 font-medium">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon size={16} />
                  </div>
                </div>
                <p className="font-display font-extrabold text-2xl text-surface-900">
                  {stat.prefix}<NumberTicker value={stat.value} />
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Revenue Chart (CSS-based) */}
        <FadeInOnScroll className="mt-8">
          <div className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 mb-6">Receita Mensal</h2>
            <div className="flex items-end gap-3 h-64">
              {revenue.map((r, i) => (
                <div key={r.month} className="flex-1 flex flex-col items-center">
                  <p className="text-xs text-surface-500 mb-2 font-medium">R$ {(r.value / 1000).toFixed(0)}k</p>
                  <motion.div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(r.value / maxVal) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  />
                  <p className="text-xs text-surface-500 mt-2 font-medium">{r.month}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Recent transactions */}
        <FadeInOnScroll className="mt-8">
          <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Últimas Transações</h2>
          <div className="card-base divide-y divide-surface-100">
            {[
              { id: 'TX-001', user: 'João Silva', type: 'Compra', amount: 49.90, method: 'PIX', status: 'completed' },
              { id: 'TX-002', user: 'Ana Costa', type: 'Venda', amount: 17.91, method: 'Saldo', status: 'completed' },
              { id: 'TX-003', user: 'Pedro Santos', type: 'Saque', amount: 450.00, method: 'PIX', status: 'processing' },
              { id: 'TX-004', user: 'Marina Oliveira', type: 'Compra', amount: 34.90, method: 'Cartão', status: 'completed' },
              { id: 'TX-005', user: 'Lucas Ferreira', type: 'Reembolso', amount: 149.90, method: 'PIX', status: 'completed' },
            ].map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="p-4 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-surface-900">{tx.user}</p>
                  <p className="text-xs text-surface-400">{tx.id} • {tx.type} • {tx.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-surface-900">R$ {tx.amount.toFixed(2)}</p>
                  <p className={`text-xs ${tx.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {tx.status === 'completed' ? 'Concluída' : 'Processando'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
