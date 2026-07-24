'use client'

// ─────────────────────────────────────────────────────────────
// KIYVO — Conta Layout com navegação lateral
// Consistente entre todas as páginas de /conta/*
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, ShoppingBag, Package, DollarSign, Shield,
  Star, Crown, ChevronRight, Menu, X, LogOut, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Links de navegação da conta
const accountLinks = [
  { href: '/conta', label: 'Visão Geral', icon: User, exact: true },
  { href: '/conta/compras', label: 'Minhas Compras', icon: ShoppingBag },
  { href: '/conta/vendas', label: 'Minhas Vendas', icon: Package },
  { href: '/conta/anuncios', label: 'Meus Anúncios', icon: Package },
  { href: '/conta/retiradas', label: 'Retiradas', icon: DollarSign },
  { href: '/conta/verificacoes', label: 'Verificação', icon: Shield },
  { href: '/recompensas', label: 'KD Points', icon: Crown },
]

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, profile, loading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          aria-label="Menu"
        >
          <Menu size={20} className="text-surface-600 dark:text-surface-400" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-surface-900 dark:text-white">
            {profile?.username || 'Minha Conta'}
          </span>
          {profile?.verification_status === 'verified' && (
            <Badge variant="success" dot>Verificado</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* ─── Sidebar ─── */}
        <AnimatePresence>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`${
            sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-900 shadow-2xl' : 'hidden'
          } lg:block lg:static lg:w-64 shrink-0`}
        >
          {/* Mobile close */}
          {sidebarOpen && (
            <div className="flex items-center justify-between p-4 lg:hidden">
              <span className="font-display font-bold text-surface-900 dark:text-white">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                <X size={20} className="text-surface-500" />
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="card-base p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  profile?.username?.charAt(0).toUpperCase() || 'K'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm text-surface-900 dark:text-white truncate">
                  {profile?.full_name || profile?.username || 'Usuário'}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {profile?.role === 'vendor' && (
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Vendedor</span>
                  )}
                  {profile?.verification_status === 'verified' && (
                    <Shield size={12} className="text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            {/* KD Points */}
            <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center gap-2">
              <Crown size={14} className="text-amber-500" />
              <span className="text-xs text-surface-500 dark:text-surface-400">KD Points:</span>
              <span className="text-xs font-bold text-surface-900 dark:text-white">{profile?.kd_points || 0}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="card-base overflow-hidden">
            {accountLinks.map((link) => {
              const active = isActive(link.href, link.exact)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border-l-4 border-brand-500'
                      : 'text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 border-l-4 border-transparent'
                  }`}
                >
                  <link.icon size={18} className={active ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400 dark:text-surface-500'} />
                  <span className="flex-1">{link.label}</span>
                  {active && <ChevronRight size={14} className="text-brand-400" />}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <Link href="/vender" className="block">
              <Button size="sm" className="w-full" icon={<Package size={16} />}>
                Anunciar Produto
              </Button>
            </Link>
            <Link href="/notificacoes" className="block">
              <Button variant="ghost" size="sm" className="w-full" icon={<Bell size={16} />}>
                Notificações
              </Button>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
