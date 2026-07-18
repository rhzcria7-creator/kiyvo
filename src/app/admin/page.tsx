'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, DollarSign, AlertTriangle, TrendingUp, ShoppingBag, Star, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/animations'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  activeProducts: number
  ordersToday: number
  revenueMonth: number
  openDisputes: number
  pendingVerifications: number
}

interface ActivityItem {
  id: string
  type: 'order' | 'verify' | 'dispute' | 'product' | 'withdrawal'
  message: string
  time: string
}

const typeColors: Record<string, string> = {
  order: 'bg-blue-100 text-blue-700',
  verify: 'bg-purple-100 text-purple-700',
  dispute: 'bg-red-100 text-red-700',
  product: 'bg-emerald-100 text-emerald-700',
  withdrawal: 'bg-amber-100 text-amber-700',
}

const typeLabels: Record<string, string> = {
  order: 'Pedido',
  verify: 'Verif.',
  dispute: 'Disputa',
  product: 'Produto',
  withdrawal: 'Saque',
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    setLoading(true)
    setError(null)
    try {
      // Buscar métricas do Supabase
      const res = await fetch('/api/v1/admin/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || null)
        setActivities(data.activities || [])
      } else {
        // Fallback: buscar métricas individuais
        const [usersRes, productsRes, ordersRes] = await Promise.allSettled([
          fetch('/api/users?count=true'),
          fetch('/api/products?status=published&count=true'),
          fetch('/api/orders?today=true&count=true'),
        ])

        setStats({
          totalUsers: usersRes.status === 'fulfilled' && usersRes.value.ok ? (await usersRes.value.json()).count || 0 : 0,
          activeProducts: productsRes.status === 'fulfilled' && productsRes.value.ok ? (await productsRes.value.json()).count || 0 : 0,
          ordersToday: ordersRes.status === 'fulfilled' && ordersRes.value.ok ? (await ordersRes.value.json()).count || 0 : 0,
          revenueMonth: 0,
          openDisputes: 0,
          pendingVerifications: 0,
        })
        setActivities([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { label: 'Usuários', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', prefix: '' },
    { label: 'Produtos Ativos', value: stats.activeProducts, icon: Package, color: 'bg-emerald-50 text-emerald-600', prefix: '' },
    { label: 'Pedidos Hoje', value: stats.ordersToday, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', prefix: '' },
    { label: 'Receita (mês)', value: stats.revenueMonth, icon: DollarSign, color: 'bg-amber-50 text-amber-600', prefix: 'R$ ' },
    { label: 'Disputas Abertas', value: stats.openDisputes, icon: AlertTriangle, color: 'bg-red-50 text-red-600', prefix: '' },
    { label: 'Verificações Pendentes', value: stats.pendingVerifications, icon: Clock, color: 'bg-orange-50 text-orange-600', prefix: '' },
  ] : []

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-extrabold text-3xl text-surface-900">Painel Administrativo</h1>
            <p className="text-surface-500 text-sm mt-1">Gerencie a plataforma Kiyvo</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboard}
            disabled={loading}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
          </motion.button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando métricas...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 text-sm">{error}</p>
            <button onClick={fetchDashboard} className="btn-secondary text-sm mt-2">Tentar novamente</button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {statCards.map((stat, i) => (
              <FadeInOnScroll key={stat.label} delay={i * 0.05}>
                <div className="card-base p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-surface-500 font-medium">{stat.label}</span>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                  </div>
                  <p className="font-display font-extrabold text-2xl text-surface-900">
                    {stat.prefix}{stat.value.toLocaleString('pt-BR')}
                  </p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        )}

        {/* Empty state para stats */}
        {!loading && !error && !stats && (
          <div className="mt-8 card-base p-8 text-center">
            <TrendingUp size={32} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 font-display font-bold">Conecte o Supabase para ver métricas reais</p>
            <p className="text-surface-400 text-sm mt-1">Execute o schema v6 no SQL Editor do Supabase.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 card-base overflow-hidden">
            <div className="p-5 border-b border-surface-100">
              <h2 className="font-display font-bold text-lg text-surface-900">Atividade Recente</h2>
            </div>
            {activities.length > 0 ? (
              <div className="divide-y divide-surface-100">
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 hover:bg-surface-50/50 transition-colors flex items-center gap-3"
                  >
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[activity.type] || 'bg-surface-100 text-surface-600'}`}>
                      {typeLabels[activity.type] || activity.type}
                    </span>
                    <p className="text-sm text-surface-700 flex-1">{activity.message}</p>
                    <span className="text-xs text-surface-400">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Clock size={24} className="text-surface-300 mx-auto mb-2" />
                <p className="text-surface-400 text-sm">Sem atividades recentes. As atividades aparecerão aqui quando o Supabase estiver conectado.</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="card-base p-5">
            <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/usuarios', label: 'Gerenciar Usuários', icon: Users, color: 'bg-blue-50 text-blue-600' },
                { href: '/admin/produtos', label: 'Gerenciar Produtos', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
                { href: '/admin/pedidos', label: 'Ver Pedidos', icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
                { href: '/admin/disputas', label: 'Disputas', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
                { href: '/admin/verificacoes', label: 'Verificações KYC', icon: Star, color: 'bg-amber-50 text-amber-600' },
                { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign, color: 'bg-green-50 text-green-600' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                  <div className={`w-9 h-9 rounded-lg ${link.color} flex items-center justify-center group-hover:opacity-80 transition-opacity`}>
                    <link.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-surface-700 group-hover:text-brand-600">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
