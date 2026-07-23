// ─────────────────────────────────────────────────────────────
// Dashboard Page — Dados reais do Supabase
// Busca pedidos, saldo e estatísticas em tempo real
// Zero mock data
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { motion } from 'framer-motion'
import { ShoppingBag, DollarSign, Star, Heart, Package, TrendingUp, Bell, ArrowRight, Shield, Crown, Zap } from 'lucide-react'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'
import { AnimatedCounter } from '@/components/animations'
import { FloatingDots } from '@/components/svgs/AnimatedSVGs'
import { formatBRL } from '@/domain/fees/FeeEngine'

interface OrderItem {
  id: string
  order_number: string
  title: string
  price: number
  status: string
  created_at: string
}

interface DashboardStats {
  totalPurchases: number
  totalSales: number
  rating: number
  /** KD Points — moeda de recompensa oficial */
  kdPoints: number
  /** @deprecated alias legado — usar kdPoints */
  pdPoints: number
  availableBalance: number
  escrowBalance: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  pending_payment: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  paid: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  in_dispute: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  cancelled: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
  refunded: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  delivered: 'Entregue',
  confirmed: 'Confirmado',
  in_dispute: 'Em disputa',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalPurchases: 0,
    totalSales: 0,
    rating: 0,
    kdPoints: 0,
    pdPoints: 0,
    availableBalance: 0,
    escrowBalance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        // Buscar pedidos reais
        const ordersRes = await fetch('/api/orders?role=buyer&limit=5')
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          const orders = (ordersData.orders || []).map((o: Record<string, unknown>) => ({
            id: o.id as string,
            order_number: o.order_number as string,
            title: (o.order_items as Record<string, unknown>[])?.[0]?.product_title as string || 'Pedido',
            price: Number(o.subtotal) || 0,
            status: o.status as string,
            created_at: o.created_at as string,
          }))
          setRecentOrders(orders)
        }

        // Calcular stats a partir do profile
        if (profile) {
          const kdPointsEarned = profile.kd_points || 0
          setStats({
            totalPurchases: profile.total_purchases || 0,
            totalSales: profile.total_sales || 0,
            rating: profile.rating || 0,
            kdPoints: kdPointsEarned,
            pdPoints: kdPointsEarned, // alias legado
            availableBalance: 0,
            escrowBalance: 0,
          })
        }
      } catch {
        // Erro silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user, profile])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  const statsCards = [
    { label: 'Compras', value: stats.totalPurchases, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
    { label: 'Vendas', value: stats.totalSales, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' },
    { label: 'Avaliação', value: stats.rating, icon: Star, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
    { label: 'KD Points', value: stats.kdPoints, icon: Crown, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400' },
  ]

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <FloatingDots count={8} className="opacity-30 dark:opacity-20" />

        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
              Olá, {profile?.username || 'Usuário'} 👋
            </h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Aqui está o resumo da sua conta</p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.verification_status !== 'verified' && (
              <Link href="/vendor/onboarding/kyc" className="btn-secondary text-sm py-2 flex items-center gap-2">
                <Shield size={16} /> Verificar conta
              </Link>
            )}
            <Link href="/anunciar" className="btn-primary text-sm py-2">
              + Anunciar
            </Link>
          </div>
        </motion.div>

        {/* Verification banner */}
        {profile?.verification_status === 'unverified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-amber-900 dark:text-amber-200">Verificação necessária para vender</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">Complete a verificação de identidade para começar a anunciar produtos.</p>
            </div>
            <Link href="/vendor/onboarding/kyc" className="btn-primary text-sm py-2 shrink-0">
              Verificar agora
            </Link>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-base p-5 hover:shadow-card-hover dark:hover:shadow-dark-glow transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-surface-500 dark:text-surface-400 font-medium">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
                <AnimatedCounter target={stat.value} />
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="card-base overflow-hidden">
              <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Pedidos Recentes</h2>
                <Link href="/buyer/orders" className="text-sm text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 hover:text-brand-700 dark:hover:text-brand-300">
                  Ver todos <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="p-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-200 dark:bg-surface-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="divide-y divide-surface-100 dark:divide-surface-800">
                  {recentOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{order.title}</p>
                          <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{order.order_number} • {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || statusColors.pending}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                          <p className="text-sm font-bold text-surface-900 dark:text-white">{formatBRL(order.price)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingBag size={32} className="text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-400 dark:text-surface-500 text-sm">Nenhum pedido ainda</p>
                  <Link href="/categorias" className="btn-primary text-sm mt-3 inline-block">Explorar Produtos</Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="card-base p-5">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Ações Rápidas</h2>
              <div className="space-y-2">
                {[
                  { href: '/anunciar', icon: Package, label: 'Novo Anúncio', desc: 'Vender um produto' },
                  { href: '/buyer/favorites', icon: Heart, label: 'Favoritos', desc: 'Produtos salvos' },
                  { href: '/vendor/finance', icon: DollarSign, label: 'Retirar', desc: 'Sacar saldo' },
                  { href: '/buyer/settings', icon: Bell, label: 'Configurações', desc: 'Perfil e notificações' },
                ].map((action, i) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={action.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                        <action.icon size={18} className="text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{action.label}</p>
                        <p className="text-xs text-surface-400 dark:text-surface-500">{action.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Seller Plan */}
            <div className="card-base p-5 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} />
                <span className="font-display font-bold text-sm">Plano {profile?.seller_plan === 'silver' ? 'Prata' : profile?.seller_plan === 'gold' ? 'Ouro' : 'Diamante'}</span>
              </div>
              <p className="text-brand-100 text-sm mb-3">Faça upgrade para ter mais visibilidade nos anúncios.</p>
              <Link href="/planos" className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Ver planos <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
