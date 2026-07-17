'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/ui/SearchBar'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Menu, X, User, ShoppingBag, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-white dark:bg-surface-950'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-extrabold text-sm">P</span>
              </div>
              <span className="font-display font-extrabold text-xl text-surface-900 dark:text-white">
                Play<span className="text-brand-600 dark:text-brand-400">dex</span>
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/categorias" className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all">
                Categorias
              </Link>
              <Link href="/como-funciona" className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all">
                Como Funciona
              </Link>
              <Link href="/tarifas" className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all">
                Tarifas
              </Link>
              <Link href="/blog" className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all">
                Blog
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 ml-4">
              <ThemeToggle size="sm" />
              <Link href="/anunciar">
                <Button variant="secondary" size="sm" icon={<Plus size={16} />}>
                  Anunciar
                </Button>
              </Link>
              <Link href="/conta/compras" className="p-2 text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-all relative">
                <ShoppingBag size={20} />
              </Link>
              <Link href="/login">
                <Button size="sm" icon={<User size={16} />}>
                  Entrar
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle size="sm" />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-20 lg:hidden"
          >
            <div className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 shadow-elevated mx-4 rounded-2xl mt-2 overflow-hidden">
              <div className="p-4">
                <SearchBar />
              </div>
              <nav className="px-2 pb-3 space-y-0.5">
                {[
                  { href: '/categorias', label: 'Categorias' },
                  { href: '/como-funciona', label: 'Como Funciona' },
                  { href: '/tarifas', label: 'Tarifas' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/anunciar', label: 'Anunciar' },
                  { href: '/login', label: 'Entrar' },
                  { href: '/cadastro', label: 'Criar Conta' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 lg:h-18" />
    </>
  )
}
