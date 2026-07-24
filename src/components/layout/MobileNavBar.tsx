'use client'
// ─────────────────────────────────────────────────────────────
// MobileNavBar — navegação inferior fixa (apenas < md).
// Melhora MUITO a UX mobile: acesso rápido a Início, Buscar,
// Categorias, Carrinho e Conta com áreas de toque de 56px.
// Some em telas grandes e em fluxos críticos (login/checkout).
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { useCart } from '@/lib/cart/store'

const HIDDEN_PREFIXES = ['/login', '/cadastro', '/auth', '/checkout', '/onboarding']

interface NavTab {
  key: string
  label: string
  href?: string
  icon: typeof Home
  active: boolean
  onClick?: () => void
  badge?: number
}

export function MobileNavBar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const cartCount = useCart((s) => s.total().itens)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const hide = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))
  if (hide || !mounted) return null

  const openCart = () => window.dispatchEvent(new Event('kiyvo:open-cart'))

  const tabs: NavTab[] = [
    { key: 'home', label: 'Início', href: '/', icon: Home, active: pathname === '/' },
    { key: 'buscar', label: 'Buscar', href: '/buscar', icon: Search, active: pathname.startsWith('/buscar') },
    { key: 'categorias', label: 'Categorias', href: '/categorias', icon: LayoutGrid, active: pathname.startsWith('/categorias') },
    { key: 'carrinho', label: 'Carrinho', icon: ShoppingBag, active: false, onClick: openCart, badge: cartCount },
    { key: 'conta', label: 'Conta', href: user ? '/conta' : '/login', icon: User, active: pathname.startsWith('/conta') || pathname.startsWith('/dashboard') },
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 dark:bg-[#0B0F1A]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/10 safe-bottom"
    >
      <div className="grid grid-cols-5 items-stretch">
        {tabs.map((tab) => {
          const content = (
            <span className="relative flex flex-col items-center justify-center gap-0.5 h-14 w-full">
              <span className="relative">
                <tab.icon
                  size={22}
                  className={tab.active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}
                />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  tab.active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {tab.active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600 dark:bg-brand-400"
                />
              )}
            </span>
          )

          if (!tab.href) {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={tab.onClick}
                aria-label={tab.label}
                className="active:scale-95 transition-transform"
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-label={tab.label}
              className="active:scale-95 transition-transform"
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavBar
