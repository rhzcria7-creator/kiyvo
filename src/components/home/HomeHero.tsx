'use client'
// Hero da Home v10.3 — MUITO mais animado, visível e impactante
// Gradientes animados, partículas, badges pulsantes, contador flutuante.
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight, Shield, Zap, Star, CheckCircle2, TrendingDown,
  Sparkles, Users, ShoppingBag, Bot, ArrowUpRight, Lock,
} from 'lucide-react'
import { GradientText, ShinyButton } from '@/components/ui/ReactBits'
import { Meteors, FlipWords, SparklesText, BackgroundBeams, Noise } from '@/components/ui/ReactBits2'

const ParticleField = dynamic(() => import('@/components/ui/ReactBits').then(m => m.ParticleField), { ssr: false })

// Badges flutuantes com produtos/ícones
const FLOATING_ITEMS = [
  { emoji: '💻', label: 'Windows 11', price: 'R$29,90', delay: 0, x: '8%', y: '18%', color: 'from-sky-400 to-blue-600' },
  { emoji: '🎬', label: 'Netflix Premium', price: 'R$9,90', delay: 0.3, x: '82%', y: '12%', color: 'from-red-400 to-rose-600' },
  { emoji: '📊', label: 'Planilha Financeira', price: 'R$19,90', delay: 0.6, x: '5%', y: '68%', color: 'from-emerald-400 to-green-600' },
  { emoji: '🎮', label: 'GTA V Steam', price: 'R$39,90', delay: 0.9, x: '85%', y: '62%', color: 'from-violet-400 to-purple-600' },
  { emoji: '🤖', label: '+200 IAs grátis', price: 'R$0', delay: 1.2, x: '50%', y: '8%', color: 'from-amber-400 to-orange-500' },
]

export function HomeHero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} className="relative pt-10 sm:pt-14 md:pt-20 pb-14 md:pb-20 overflow-hidden">
      {/* Fundo animado com gradientes que se movem */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Blobs animados em posições diferentes */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-400/30 to-brand-600/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 20, -30, 0],
            scale: [1, 1.05, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-10 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-400/25 to-fuchsia-500/15 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 20, -40, 0],
            y: [0, 30, -20, 0],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/10 blur-3xl"
        />
        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
        {/* Partículas flutuantes */}
        <ParticleField color="#2563EB" count={28} />
        <ParticleField color="#8B5CF6" count={18} />
        <Meteors number={15} />
        <Noise opacity={0.025} />
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge superior com PULSO forte */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs md:text-sm font-black uppercase tracking-widest mb-6"
          >
            <span className="relative flex h-2.5 w-2.5">
              <motion.span
                animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-500"
              />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <TrendingDown className="w-3.5 h-3.5" />
            Taxa mais justa do Brasil — 8% com teto de R$50
          </motion.div>

          {/* H1 principal — animação letra a letra */}
          <h1 className="font-black text-[clamp(2.6rem,7.5vw,5rem)] leading-[0.92] text-[#0F172A] dark:text-white tracking-[-0.03em] mb-5">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              O marketplace
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-block"
            >
              de{' '}
            </motion.span>
            <br className="hidden sm:block" />
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-block relative"
            >
              <FlipWords
                words={['tudo que é digital', 'cursos e e-books', 'software e licenças', 'templates e packs', 'prompts de IA', 'freelance e serviços']}
                className="bg-gradient-to-r from-brand-500 via-indigo-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent"
                duration={2400}
              />
            </motion.span>
            .
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Venda e compre{' '}
            <strong className="text-[#0F172A] dark:text-white font-black">cursos, e-books, templates, software,</strong>{' '}
            <span className="sm:inline block mt-1 sm:mt-0">
              <strong className="text-[#0F172A] dark:text-white font-black">games, streaming e freelances</strong> com a menor taxa do mercado.
            </span>{' '}
            Saque em 1 dia via PIX, use <strong className="text-brand-600 dark:text-brand-400">200+ agentes de IA</strong> gratuitos.
          </motion.p>

          {/* CTAs — COM HOVER e animação visível */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto cta-wiggle">
              <Link
                href="/vender"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-full px-8 py-4 text-base font-black shadow-xl shadow-black/20 dark:shadow-white/20 hover:shadow-2xl hover:shadow-brand-500/30 transition-all pulse-glow"
              >
                <span>Começar a vender grátis</span>
                <motion.span
                  className="inline-flex items-center"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}
                >
                  <ArrowRight className="w-5 h-5 group-hover:hidden" />
                  <ArrowUpRight className="w-5 h-5 hidden group-hover:inline" />
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/buscar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/20 text-[#0F172A] dark:text-white rounded-full px-8 py-4 text-base font-bold hover:bg-slate-50 dark:hover:bg-white/20 transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-500" />
                Explorar produtos
              </Link>
            </motion.div>
          </motion.div>

          {/* Selos de confiança */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs md:text-sm text-slate-500 dark:text-slate-400"
          >
            {[
              { icon: Shield, label: 'Pagamento seguro', color: 'text-emerald-500' },
              { icon: Zap, label: 'Saque PIX 1 dia', color: 'text-amber-500' },
              { icon: CheckCircle2, label: 'Garantia 7 dias', color: 'text-emerald-500' },
              { icon: Lock, label: 'KYC anti-fraude', color: 'text-brand-500' },
              { icon: Star, label: '4.8/5 (+2k reviews)', color: 'text-amber-500' },
            ].map((selo, i) => (
              <motion.span
                key={selo.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 + i * 0.07 }}
                className="inline-flex items-center gap-1.5 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10"
              >
                <selo.icon className={`w-4 h-4 ${selo.color}`} /> {selo.label}
              </motion.span>
            ))}
          </motion.div>

          {/* MINI STATS visíveis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-10 grid grid-cols-3 max-w-md mx-auto gap-3"
          >
            {[
              { icon: Users, value: '1.2M+', label: 'Usuários' },
              { icon: ShoppingBag, value: '789+', label: 'Produtos' },
              { icon: Bot, value: '203', label: 'Agentes IA' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.08 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center"
              >
                <s.icon className="w-4 h-4 mx-auto text-brand-500 mb-1" />
                <div className="text-xl font-black text-[#0F172A] dark:text-white">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Cards flutuantes decorativos (desktop only) */}
        <div className="hidden lg:block pointer-events-none">
          {FLOATING_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -12, 0],
              }}
              transition={{
                delay: 1.4 + item.delay,
                duration: 0.5,
                y: { delay: 2 + item.delay, duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ left: item.x, top: item.y }}
              className="absolute"
            >
              <div className="flex items-center gap-2.5 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-black/5 dark:border-white/10 px-3 py-2 backdrop-blur">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-md`}>
                  {item.emoji}
                </div>
                <div>
                  <div className="text-[11px] font-black text-[#0F172A] dark:text-white leading-tight max-w-[120px] truncate">{item.label}</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.price}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
