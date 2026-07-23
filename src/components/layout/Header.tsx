'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { KiyvoLogoSvg } from '@/components/brand/KiyvoLogoSvg'
import ShimmerButton from '@/components/ui/ShimmerButton'
import {
  Menu, X, User, ShoppingBag, Plus, LogOut, Bot,
  LayoutDashboard, ChevronRight, BadgeCheck, Sparkles, Search, Gift, Medal, Briefcase, Bell,
  Headphones, FileText, Receipt, MessageCircleWarning, Key, FileBadge, Newspaper, AudioLines,
  BookHeart, FileEdit, Ticket, ShieldAlert, Radio, Network, HeartHandshake, ArrowDownToLine,
  Handshake, ScrollText, Shield, Zap, TrendingUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'react-hot-toast'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fechar dropdown ao clicar fora
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10'
            : 'bg-white/50 dark:bg-transparent backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Kiyvo — Início">
              <KiyvoLogoSvg variant="full" size="md" className="text-[#0F172A] dark:text-white" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/categorias"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                Explorar
              </Link>
              <Link
                href="/oficial"
                className="px-3.5 py-2 text-sm font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15 hover:bg-brand-100 dark:hover:bg-brand-500/25 rounded-full transition inline-flex items-center gap-1.5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"/>
                </span>
                <BadgeCheck size={14} /> Oficial
              </Link>
              <Link
                href="/como-funciona"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                Como funciona
              </Link>
              <Link
                href="/planos"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                Planos
              </Link>
              <Link
                href="/transparencia"
                className="px-3.5 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 rounded-full bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition inline-flex items-center gap-1"
              >
                <Shield size={14}/> Taxas justas
              </Link>
              <Link
                href="/blackfriday"
                className="px-3.5 py-2 text-sm font-black text-red-700 dark:text-red-400 hover:text-red-900 rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition inline-flex items-center gap-1 animate-pulse"
              >
                🔥 BF 60% OFF
              </Link>
              <Link
                href="/boost"
                className="px-3.5 py-2 text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 rounded-full bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 transition inline-flex items-center gap-1"
              >
                <Zap size={14}/> Boost
              </Link>
              <Link
                href="/renda-extra"
                className="px-3.5 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 rounded-full bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 transition inline-flex items-center gap-1"
              >
                <TrendingUp size={14}/> Ganhar $
              </Link>
              <Link
                href="/saque"
                className="px-3.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-full hover:bg-black/5 transition inline-flex items-center gap-1"
              >
                <ArrowDownToLine size={14}/> Saque
              </Link>
              <Link
                href="/indique-ganhe"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-1"
              >
                <Gift size={14}/> Indique
              </Link>
              <Link
                href="/agentes"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-1"
              >
                <Bot size={14}/> Agentes
              </Link>
              <Link
                href="/freelance"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-1"
              >
                <Briefcase size={14}/> Freela
              </Link>
              <Link
                href="/blog"
                className="px-3.5 py-2 text-sm font-semibold text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                Blog
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 ml-4">
              <Link
                href="/buscar"
                aria-label="Buscar"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                <Search size={18} />
              </Link>
              <ThemeToggle size="sm" />

              {user ? (
                <>
                  <Link
                    href="/conta/compras"
                    aria-label="Minhas compras"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition relative"
                  >
                    <ShoppingBag size={18} />
                  </Link>

                  {/* Profile dropdown */}
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
                          className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0F172A] rounded-2xl border border-black/10 dark:border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] py-2 overflow-hidden"
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
                            <Sparkles size={16} /> Favoritos
                          </Link>
                          <Link href="/notificacoes" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                            <Bell size={16} /> Notificações
                          </Link>
                          <Link href="/conta/emblemas" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition">
                            <Medal size={16} /> Meus emblemas
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
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-bold text-[#0F172A] dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition">
                    Entrar
                  </Link>
                  <ShimmerButton href="/cadastro" size="sm" icon={<Sparkles size={14} />}>
                    Começar grátis
                  </ShimmerButton>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/buscar"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70"
                aria-label="Buscar"
              >
                <Search size={18} />
              </Link>
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
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-3 top-[72px] z-30 lg:hidden"
            >
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-black/10 dark:border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
                <nav className="p-2">
                  {[
                    { href: '/categorias', label: 'Explorar', icon: Search },
                    { href: '/oficial', label: 'Loja Oficial', icon: BadgeCheck, badge: true },
                    { href: '/como-funciona', label: 'Como funciona', icon: ChevronRight },
                    { href: '/planos', label: 'Planos', icon: Sparkles },
                    { href: '/indique-ganhe', label: 'Indique e ganhe', icon: Gift },
                    { href: '/agentes', label: 'Agentes IA', icon: Bot },
                    { href: '/freelance', label: 'Freelance', icon: Briefcase },
                    { href: '/vender', label: 'Vender na Kiyvo', icon: Plus },
                    { href: '/blog', label: 'Blog', icon: ChevronRight },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition ${
                        item.badge
                          ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15'
                          : 'text-[#0F172A] dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon size={16} /> {item.label}
                      </span>
                      <ChevronRight size={14} className="opacity-40" />
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
                      <Link href="/cadastro" onClick={() => setMobileOpen(false)} className="flex-1">
                        <span className="flex w-full items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white text-sm font-black">
                          <Sparkles size={14}/> Criar conta
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

      {/* Spacer — altura do header */}
      <div className="h-16 lg:h-[72px]" />
    </>
  )
}
