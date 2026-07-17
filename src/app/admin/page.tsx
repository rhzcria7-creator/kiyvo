'use client'

import { motion } from 'framer-motion'
import { Users, Package, DollarSign, AlertTriangle, TrendingUp, ShoppingBag, Star, Clock } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, AnimatedCounter, StaggerContainer, StaggerItem } from '@/components/animations'

const stats = [
  { label: 'Usuários', value: 12547, icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: 'Produtos Ativos', value: 8234, icon: Package, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Pedidos Hoje', value: 342, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
  { label: 'Receita (mês)', value: 84520, icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
  { label: 'Disputas Abertas', value: 12, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  { label: 'Verificações Pendentes', value: 47, icon: Clock, color: 'bg-orange-50 text-orange-600' },
]

const recentActivity = [
  { type: 'order', message: 'Novo pedido PD-2607-089 — Windows 11 Pro', time: '2 min' },
  { type: 'verify', message: 'Verificação pendente de @joaosilva', time: '5 min' },
  { type: 'dispute', message: 'Disputa aberta no pedido PD-2606-045', time: '12 min' },
  { type: 'order', message: 'Pedido PD-2607-088 entregue com sucesso', time: '18 min' },
  { type: 'verify', message: 'Documento aprovado para @mariaoliveira', time: '25 min' },
]

const typeColors: Record<string, string> = {
  order: 'bg-blue-100 text-blue-700',
  verify: 'bg-purple-100 text-purple-700',
  dispute: 'bg-red-100 text-red-700',
}

export default function AdminPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900">Painel Administrativo</h1>
          <p className="text-surface-500 text-sm mt-1">Gerencie a plataforma Playdex</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {stats.map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.05}>
              <div className="card-base p-5 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-surface-500 font-medium">{stat.label}</span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                </div>
                <p className="font-display font-extrabold text-2xl text-surface-900">
                  <AnimatedCounter target={stat.value} prefix={stat.label === 'Receita (mês)' ? 'R$ ' : ''} />
                </p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 card-base overflow-hidden">
            <div className="p-5 border-b border-surface-100">
              <h2 className="font-display font-bold text-lg text-surface-900">Atividade Recente</h2>
            </div>
            <div className="divide-y divide-surface-100">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 hover:bg-surface-50/50 transition-colors flex items-center gap-3"
                >
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[activity.type]}`}>
                    {activity.type === 'order' ? 'Pedido' : activity.type === 'verify' ? 'Verif.' : 'Disputa'}
                  </span>
                  <p className="text-sm text-surface-700 flex-1">{activity.message}</p>
                  <span className="text-xs text-surface-400">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card-base p-5">
            <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/usuarios', label: 'Gerenciar Usuários', icon: Users },
                { href: '/admin/produtos', label: 'Gerenciar Produtos', icon: Package },
                { href: '/admin/pedidos', label: 'Ver Pedidos', icon: ShoppingBag },
              ].map((link) => (
                <a key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                    <link.icon size={16} className="text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-surface-700 group-hover:text-brand-600">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
