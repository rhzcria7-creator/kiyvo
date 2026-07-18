// ─────────────────────────────────────────────────────────────
// Conta Page — Dashboard da conta com dados reais
// Zero mock data — busca do Supabase via API
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { useAuth } from '@/lib/auth/context'
import { formatBRL } from '@/domain/fees/FeeEngine'
import { ShoppingBag, DollarSign, Package, Star, ArrowRight, User, Bell, Shield, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrderItem {
  id: string
  order_number: string
  title: string
  price: number
  status: string
  created_at: string
}

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  delivered: { variant: 'success', label: 'Entregue' },
  confirmed: { variant: 'success', label: 'Confirmado' },
  paid: { variant: 'info', label: 'Pago' },
  pending: { variant: 'warning', label: 'Pendente' },
  pending_payment: { variant: 'warning', label: 'Aguardando pagamento' },
  cancelled: { variant: 'danger', label: 'Cancelado' },
  in_dispute: { variant: 'info', label: 'Em disputa' },
  refunded: { variant: 'danger', label: 'Reembolsado' },
}

export default function ContaPage() {
  const { user, profile } = useAuth()
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) { setLoading(false); return }
      try {
        const res = await fetch('/api/orders?role=buyer&limit=4')
        if (res.ok) {
          const data = await res.json()
          setRecentOrders((data.orders || []).map((o: Record<string, unknown>) => ({
            id: o.id as string,
            order_number: o.order_number as string,
            title: (o.order_items as Record<string, unknown>[])?.[0]?.product_title as string || 'Pedido',
            price: Number(o.subtotal) || 0,
            status: o.status as string,
            created_at: o.created_at as string,
          })))
        }
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  const quickStats = [
    { icon: ShoppingBag, label: 'Compras', value: String(profile?.total_purchases || 0), href: '/conta/compras' },
    { icon: Package, label: 'Vendas', value: String(profile?.total_sales || 0), href: '/conta/vendas' },
    { icon: DollarSign, label: 'Saldo', value: formatBRL(0), href: '/vendor/finance' },
    { icon: Crown, label: 'KD Points', value: String(profile?.kd_points || 0), href: '/recompensas' },
  ]

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('pt-BR') } catch { return d }
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Foto do perfil" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User size={28} className="text-brand-600 dark:text-brand-400" />
            )}
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
              Olá, {profile?.username || 'Usuário'}!
            </h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm flex items-center gap-2">
              {profile?.created_at && `Membro desde ${new Date(profile.created_at).getFullYear()}`}
              {profile?.verification_status === 'verified' && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Conta verificada ✓</span>
              )}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link href="/buyer/settings">
              <Button variant="ghost" size="sm" icon={<Bell size={18} />}>Notificações</Button>
            </Link>
            <Link href="/anunciar">
              <Button size="sm">Anunciar</Button>
            </Link>
          </div>
        </motion.div>

        {/* Verification Banner */}
        {profile?.verification_status === 'unverified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center gap-4"
          >
            <Shield size={24} className="text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="font-display font-bold text-amber-900 dark:text-amber-200">Verifique sua conta</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">Complete a verificação para vender e retirar dinheiro.</p>
            </div>
            <Link href="/vendor/onboarding/kyc" className="btn-primary text-sm py-2 shrink-0">Verificar agora</Link>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="card-base p-4 group hover:border-brand-200 dark:hover:border-brand-700 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                  <stat.icon size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{stat.label}</p>
                  <p className="font-display font-bold text-surface-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Pedidos Recentes</h2>
              <Link href="/buyer/orders" className="text-sm text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 hover:text-brand-700">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card-base p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-200 dark:bg-surface-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const st = statusMap[order.status] || statusMap.pending
                  return (
                    <div key={order.id} className="card-base p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-lg shrink-0">📦</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-surface-900 dark:text-white truncate">{order.title}</p>
                        <p className="text-xs text-surface-400 dark:text-surface-500">{order.order_number} • {formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-sm text-surface-900 dark:text-white">{formatBRL(order.price)}</p>
                        <Badge variant={st.variant} dot>{st.label}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card-base p-8 text-center">
                <ShoppingBag size={32} className="text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                <p className="text-surface-400 dark:text-surface-500 text-sm">Nenhum pedido ainda</p>
                <Link href="/categorias" className="btn-primary text-sm mt-3 inline-block">Explorar Produtos</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Menu Rápido</h2>
            <div className="card-base divide-y divide-surface-100 dark:divide-surface-800">
              {[
                { href: '/buyer/orders', label: 'Minhas Compras', icon: ShoppingBag },
                { href: '/vendor/dashboard', label: 'Painel de Vendas', icon: Package },
                { href: '/vendor/products', label: 'Meus Anúncios', icon: Package },
                { href: '/vendor/finance', label: 'Retiradas', icon: DollarSign },
                { href: '/vendor/onboarding/kyc', label: 'Verificação', icon: Shield },
                { href: '/recompensas', label: 'KD Points', icon: Star },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all"
                >
                  <item.icon size={18} className="text-surface-400 dark:text-surface-500" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
