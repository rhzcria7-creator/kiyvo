'use client'

// ─────────────────────────────────────────────────────────────
// MobileNavBar Pro v0.0.1 — Fixa < md, 44px touch targets
// Início/Buscar/Categorias/Carrinho/Conta com badge bounce
// BackToTop + KiyaWidget posicionados 80px acima
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Grid3X3, ShoppingCart, User, ArrowUp, MessageCircle } from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  badge?: number
}

export default function MobileNavBarPro() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [cartCount] = useState(0)

  React.useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCart = () => {
    window.dispatchEvent(new CustomEvent('kiyvo:open-cart'))
  }

  const items: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Início', href: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Buscar', href: '/buscar' },
    { icon: <Grid3X3 className="w-5 h-5" />, label: 'Categorias', href: '/categorias' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Carrinho', href: '#', badge: cartCount },
    { icon: <User className="w-5 h-5" />, label: 'Conta', href: '/account' },
  ]

  return (
    <>
      {/* Mobile Nav - fixa bottom */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe">
        <div className="flex items-center justify-around h-14">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.label === 'Carrinho') {
                  e.preventDefault()
                  openCart()
                }
              }}
              className="relative flex flex-col items-center justify-center w-11 h-11 touch-manipulation"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <span className="text-zinc-600 dark:text-zinc-400">
                {item.icon}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* Back to Top - aparece após scroll, posicionado acima da nav */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className={clsx(
              'fixed z-40 bottom-20 right-4 md:bottom-8 md:right-8',
              'w-11 h-11 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
              'shadow-lg flex items-center justify-center',
              'hover:scale-105 active:scale-95 transition-transform'
            )}
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* KiyaWidget posicionado acima da nav mobile */}
      <div className="md:hidden fixed z-40 bottom-20 right-4" style={{ bottom: 'calc(3.5rem + 16px)' }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('kiyvo:open-kiya'))}
          className={clsx(
            'w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600',
            'text-white shadow-lg flex items-center justify-center',
            'hover:scale-105 active:scale-95 transition-transform'
          )}
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label="Abrir Kiya"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </>
  )
}
