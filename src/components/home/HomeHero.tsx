'use client'
// Hero da Home — Marketplace de duas pontas (comprador + vendedor)
// Visual editorial, premium e 100% mobile-first. Menos "cara de IA":
// sem card flutuante genérico — foco em mensagem clara, duas jornadas
// e prova social real. Animações leves e respeitando reduced-motion.
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight, Shield, Zap, Star, CheckCircle2, Lock,
  ShoppingBag, Store, TrendingDown, Sparkles, Users,
} from 'lucide-react'
import { Meteors, Noise } from '@/components/ui/ReactBits2'
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/useIsMobile'

const ParticleField = dynamic(() => import('@/components/ui/ReactBits').then((m) => m.ParticleField), { ssr: false })

export function HomeHero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  // Em telas estreitas ou com reduced-motion, desliga efeitos pesados.
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const lightMode = isMobile || reduced

  return (
    <section ref={ref} className="relative pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-24 overflow-hidden">
      {/* Fundo animado (leve) */}
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        {lightMode ? (
          <motion.div
            animate={{ x: [0, 14, -8, 0], y: [0, -10, 8, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 -left-32 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/10 blur-2xl"
          />
        ) : (
          <>
            <motion.div
              animate={{ x: [0, 36, -18, 0], y: [0, -26, 16, 0], scale: [1, 1.08, 0.96, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-gradient-to-br from-brand-400/26 to-brand-600/16 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -26, 34, 0], y: [0, 18, -24, 0] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 right-0 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-violet-400/22 to-fuchsia-500/12 blur-3xl"
            />
          </>
        )}
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
        {lightMode ? <ParticleField color="#2563EB" count={6} /> : <ParticleField color="#2563EB" count={22} />}
        {lightMode ? <Meteors number={3} /> : <Meteors number={10} />}
        {!reduced && <Noise opacity={0.02} />}
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs md:text-sm font-black uppercase tracking-widest mb-7"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Taxa mais justa do Brasil — 8% sem teto
          </motion.div>

          {/* H1 duas pontas */}
          <h1 className="font-black text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.95] text-[#0F172A] dark:text-white tracking-[-0.03em] mb-6">
            <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5 }} className="inline-block">
              Compre o que precisa.
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
            >
              Venda o que cria.
            </motion.span>
          </h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-9"
          >
            Cursos, softwares, games, templates e serviços com a menor taxa do mercado.
            Tudo num só lugar — <strong className="text-[#0F172A] dark:text-white font-black">você do lado de cá</strong> e{' '}
            <strong className="text-[#0F172A] dark:text-white font-black">do lado de lá</strong>.
          </motion.p>

          {/* Duas jornadas */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-9 text-left">
            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <h3 className="font-black text-[#0F172A] dark:text-white">Sou comprador</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ache o produto ideal com entrega na hora e garantia de 7 dias.</p>
              <Link href="/buscar" className="group inline-flex items-center gap-1.5 font-black text-brand-600 dark:text-brand-400 text-sm">
                Explorar produtos
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-3xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </span>
                <h3 className="font-black">Quero vender</h3>
              </div>
              <p className="text-sm text-white/70 dark:text-slate-600 mb-4">Abra sua loja grátis. Taxa de 8% e saque em 1 dia via PIX.</p>
              <Link href="/vender" className="group inline-flex items-center gap-1.5 font-black text-emerald-300 dark:text-emerald-600 text-sm">
                Começar a vender
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Selos de confiança */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 text-xs md:text-sm text-slate-500 dark:text-slate-400">
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
                transition={{ delay: 0.9 + i * 0.06 }}
                className="inline-flex items-center gap-1.5 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10"
              >
                <selo.icon className={`w-4 h-4 ${selo.color}`} /> {selo.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Prova social compacta */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="mt-10 grid grid-cols-3 max-w-md mx-auto gap-3">
            {[
              { icon: Users, value: '1.2M+', label: 'Usuários' },
              { icon: ShoppingBag, value: '789+', label: 'Produtos' },
              { icon: Sparkles, value: '203', label: 'Agentes IA' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15 + i * 0.07 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center"
              >
                <s.icon className="w-4 h-4 mx-auto text-brand-500 mb-1" />
                <div className="text-xl font-black text-[#0F172A] dark:text-white">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
