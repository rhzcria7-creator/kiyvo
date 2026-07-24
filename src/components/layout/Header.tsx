'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { KiyvoLogo } from '@/components/brand/KiyvoLogo'
import ShimmerButton from '@/components/ui/ShimmerButton'
import {
  Menu, X, User, ShoppingBag, Plus, LogOut, Bot,
  LayoutDashboard, ChevronRight, BadgeCheck, Sparkles, Search, Gift, Medal, Briefcase, Bell,
  Heart, Megaphone, Flame,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import { useCart } from '@/lib/cart/store'
import { useKD } from '@/lib/kd/store'
import { useNotif } from '@/lib/notifications/store'
import { CommandSearch } from '@/components/ui/CommandSearch'
import { MiniCart } from '@/components/cart/MiniCart'
import { toast } from 'react-hot-toast'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const cartCount = useCart((s) => s.total().itens)
  const kdPontos = useKD((s) => s.pontos)
  const unreadNotif = useNotif((s) => s.unread)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!profileOpen) return
    const onClick = () => setProfileOpen(false)
    const t = setTimeout(() => document.addEventListener('click', onClick), 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('click', onClick)
    }
  }, [profileOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Você saiu da conta')
      router.push('/')
    } catch {
      toast.error('Erro ao sair')
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0B0F1A]/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-sm'
            : 'bg-white/70 dark:bg-[#0B0F1A]/50 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Kiyvo — Início">
              <KiyvoLogo variant="full" size="md" textColor="currentColor" className="text-[#0F172A] dark:text-white" />
            </Link>

            {/* Desktop Nav — 4 links essenciais só */}
            <nav className="hidden md:flex items-center gap-0.5">
              <Link href="/buscar" className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
                Explorar
              </Link>
              <Link href="/ofertas" className="px-3.5 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition inline-flex items-center gap-1">
                <Flame size={14} /> Ofertas
              </Link>
              <Link href="/lojas" className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
                Lojas
              </Link>
              <Link href="/trafego-pago" className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-1">
                <Megaphone size={14}/> Tráfego
              </Link>
              <Link href="/agentes" className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-1">
                <Bot size={14}/> Agentes <span className="text-[10px] font-black bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-full">200+</span>
              </Link>
              <Link href="/freelance" className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-1">
                <Briefcase size={14}/> Freela
              </Link>
              <Link href="/copiloto" className="px-3.5 py-2 text-sm font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15 hover:bg-brand-100 dark:hover:bg-brand-500/25 rounded-full transition inline-flex items-center gap-1.5">
                <Sparkles size={14}/> Copiloto <span className="text-[10px] font-black bg-brand-600 text-white px-1.5 py-0.5 rounded-full">IA</span>
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1.5">
              <CommandSearch />
              <Link href="/notificacoes" aria-label="Notificações" className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition">
                <Bell size={18} />
                {unreadNotif > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center"
                  >
                    {unreadNotif > 99 ? '99+' : unreadNotif}
                  </motion.span>
                )}
              </Link>
              <button type="button" onClick={() => setCartOpen(true)} aria-label="Carrinho" className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>
              {user && kdPontos > 0 && (
                <Link href="/recompensas" aria-label="KD Points" title={`${kdPontos.toLocaleString('pt-BR')} KD Points`}
                  className="hidden lg:inline-flex items-center gap-1 h-9 px-3 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/20 transition text-xs font-black">
                  <Medal size={14} />
                  {kdPontos >= 1000 ? `${(kdPontos/1000).toFixed(1)}k` : kdPontos}
                </Link>
              )}
              <ThemeToggle size="sm" />

              {user ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(o => !o)}
                    className="flex items-center gap-2 pl-1 pr-3 h-10 text-[#0F172A] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">
                      <User size={15} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.18, type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0F172A] rounded-2xl border border-black/10 dark:border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] py-2 overflow-hidden z-50"
                        role="menu"
                      >
                        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] dark:text-white/40">Logado como</p>
                          <p className="text-sm font-black text-[#0F172A] dark:text-white truncate mt-0.5">
                            {user.email || 'Usuário Kiyvo'}
                          </p>
                        </div>
                        <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link href="/conta/compras" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                          <ShoppingBag size={16} /> Minhas compras
                        </Link>
                        <Link href="/favoritos" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                          <Heart size={16} /> Favoritos
                        </Link>
                        <Link href="/recompensas" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition">
                          <Medal size={16} /> KD Points
                        </Link>
                        <Link href="/notificacoes" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                          <Bell size={16} /> Notificações
                        </Link>
                        <Link href="/indique-ganhe" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                          <Gift size={16} /> Indique e ganhe
                        </Link>
                        <Link href="/configuracoes" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                          <User size={16} /> Minha conta
                        </Link>
                        <div className="border-t border-black/5 dark:border-white/10 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                          >
                            <LogOut size={16} /> Sair
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-2 text-sm font-bold text-[#0F172A] dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition">
                    Entrar
                  </Link>
                  <ShimmerButton href="/vender" size="sm" icon={<Plus size={14} />}>
                    Vender
                  </ShimmerButton>
                </>
              )}
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-1 md:hidden">
              <CommandSearch />
              <button type="button" onClick={() => setCartOpen(true)} className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70" aria-label="Carrinho">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <ThemeToggle size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 md:hidden backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-3 top-[72px] z-[61] md:hidden"
            >
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-black/10 dark:border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
                <nav className="p-2">
                  {[
                    { href: '/copiloto', label: 'Copiloto IA Universal', icon: Sparkles, badge: 'AI' },
                    { href: '/buscar', label: 'Explorar produtos', icon: Search },
                    { href: '/lojas', label: 'Lojas', icon: Briefcase },
                    { href: '/trafego-pago', label: 'Tráfego Pago', icon: Megaphone },
                    { href: '/vender', label: 'Vender na Kiyvo', icon: Plus, highlight: true },
                    { href: '/agentes', label: '200+ Agentes', icon: Bot },
                    { href: '/freelance', label: 'Freelance', icon: Briefcase },
                    { href: '/carrinho', label: 'Meu carrinho', icon: ShoppingBag },
                    { href: '/favoritos', label: 'Favoritos', icon: Heart },
                    { href: '/doar', label: 'Apoiar o projeto', icon: Heart },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition ${
                        item.highlight
                          ? 'text-white bg-[#0F172A] dark:bg-white dark:text-black my-1 shadow-lg'
                          : item.badge
                            ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15'
                            : 'text-[#0F172A] dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon size={16} /> {item.label}
                        {item.badge === 'AI' && <span className="ml-auto text-[9px] font-black bg-gradient-to-r from-brand-500 to-violet-500 text-white px-1.5 py-0.5 rounded-full">IA</span>}
                      </span>
                      <ChevronRight size={14} className={item.highlight ? 'opacity-0' : 'opacity-40'} />
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-black/5 dark:border-white/10 p-3 flex gap-2">
                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#0F172A] dark:text-white">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => { handleSignOut(); setMobileOpen(false) }}
                        className="px-4 py-3 rounded-full bg-red-50 dark:bg-red-500/10 text-sm font-bold text-red-600 dark:text-red-400"
                      >
                        <LogOut size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#0F172A] dark:text-white">
                        Entrar
                      </Link>
                      <Link href="/vender" onClick={() => setMobileOpen(false)} className="flex-1">
                        <span className="flex w-full items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white text-sm font-black">
                          <Plus size={14}/> Vender
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16 lg:h-[72px]" />
      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
