'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { mockOrders } from '@/data/mockFAQ'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, DollarSign, Package, Star, ArrowRight, User, Bell } from 'lucide-react'

const quickStats = [
  { icon: ShoppingBag, label: 'Compras', value: '12', href: '/conta/compras' },
  { icon: Package, label: 'Vendas', value: '34', href: '/conta/vendas' },
  { icon: DollarSign, label: 'Saldo', value: 'R$ 450,00', href: '/conta/retiradas' },
  { icon: Star, label: 'PD Points', value: '2.340', href: '/recompensas' },
]

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  delivered: { variant: 'success', label: 'Entregue' },
  pending: { variant: 'warning', label: 'Pendente' },
  cancelled: { variant: 'danger', label: 'Cancelado' },
  in_dispute: { variant: 'info', label: 'Em disputa' },
}

export default function ContaPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
            <User size={28} className="text-brand-600" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900">Olá, Jogador!</h1>
            <p className="text-surface-500 text-sm">Membro desde 2023 • Conta verificada ✓</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" icon={<Bell size={18} />}>Notificações</Button>
            <Link href="/anunciar">
              <Button size="sm">Anunciar</Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="card-base p-4 group hover:border-brand-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <stat.icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-500">{stat.label}</p>
                  <p className="font-display font-bold text-surface-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-surface-900">Pedidos Recentes</h2>
              <Link href="/conta/compras" className="text-sm text-brand-600 font-semibold flex items-center gap-1 hover:text-brand-700">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div key={order.id} className="card-base p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-lg shrink-0">🎮</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-surface-900 truncate">{order.product}</p>
                    <p className="text-xs text-surface-400">{order.id} • {order.seller} • {order.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-sm">{formatPrice(order.price)}</p>
                    <Badge variant={statusMap[order.status].variant} dot>
                      {statusMap[order.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Menu Rápido</h2>
            <div className="card-base divide-y divide-surface-100">
              {[
                { href: '/conta/compras', label: 'Minhas Compras', icon: ShoppingBag },
                { href: '/conta/vendas', label: 'Minhas Vendas', icon: Package },
                { href: '/conta/anuncios', label: 'Meus Anúncios', icon: Package },
                { href: '/conta/retiradas', label: 'Retiradas', icon: DollarSign },
                { href: '/conta/verificacoes', label: 'Verificação', icon: User },
                { href: '/recompensas', label: 'PD Points', icon: Star },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-700 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  <item.icon size={18} className="text-surface-400" />
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
