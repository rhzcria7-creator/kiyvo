'use client'
// HomeNumeros — stats reais com contador animado.
// Card 0% é GRANDE e em destaque (Taxa Zero para novos vendedores).
// Comentários em PT-BR.
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Gift, ShieldCheck, Clock, Zap, TrendingUp } from 'lucide-react'

interface StatItem {
  value: number
  prefix?: string
  suffix?: string
  label: string
  sub: string
  duration?: number
  accent?: 'emerald' | 'brand' | 'slate'
  emoji?: string
  icon?: React.ReactNode
  whole?: boolean // para valores 0..100 não decimais
}

const numeros: StatItem[] = [
  {
    value: 0, prefix: '', suffix: '%',
    label: 'Taxa Zero',
    sub: 'Primeiras 5.000 vendas isentas',
    duration: 1000, accent: 'emerald',
    icon: <Gift className="w-6 h-6" />, whole: true,
  },
  {
    value: 789, prefix: '', suffix: '+',
    label: 'Produtos digitais',
    sub: 'Cursos, software, templates e mais',
    duration: 1400, accent: 'brand',
    icon: <Zap className="w-6 h-6" />, whole: true,
  },
  {
    value: 60, prefix: '', suffix: '+',
    label: 'Lojas verificadas',
    sub: 'Vendedores de todo o Brasil',
    duration: 1200, accent: 'slate',
    icon: <ShieldCheck className="w-6 h-6" />, whole: true,
  },
  {
    value: 1, prefix: '', suffix: ' dia',
    label: 'Saque em PIX',
    sub: 'Mín. R$30 · taxa fixa R$0,99',
    duration: 1000, accent: 'slate',
    icon: <Clock className="w-6 h-6" />, whole: true,
  },
  {
    value: 7, prefix: '', suffix: ' dias',
    label: 'Garantia total',
    sub: 'Reembolso fácil se der problema',
    duration: 1000, accent: 'slate',
    icon: <ShieldCheck className="w-6 h-6" />, whole: true,
  },
]

function AnimatedNumber({ item }: { item: StatItem }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20%' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let raf: number
    const start = performance.now()
    const dur = item.duration || 1500
    const target = item.value
    if (target === 0) { setDisplay(0); return }
    const animate = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(animate)
      else setDisplay(target)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isInView, item.value, item.duration])

  return (
    <span ref={ref} className="tabular-nums">
      {item.prefix}{display}{item.suffix}
    </span>
  )
}

export function HomeNumeros() {
  return (
    <section className="py-12 md:py-20 border-y border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-[#0B0F1A] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <span className="w-6 h-px bg-brand-500" /> Números que importam <span className="w-6 h-px bg-brand-500" />
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-tight">
            Feito para <span className="bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">vender mais</span><br className="hidden sm:block" />
            e comprar com segurança.
          </h2>
        </motion.div>

        {/* Card DESTAQUE Taxa Zero */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6 md:mb-8 max-w-3xl mx-auto"
        >
          <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 md:p-10 text-white shadow-2xl shadow-emerald-500/30 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Gift className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-1">Taxa Zero</div>
                <div className="text-6xl md:text-8xl font-black leading-none drop-shadow-md">
                  0<span className="text-4xl md:text-6xl align-top">%</span>
                </div>
                <p className="mt-2 text-base md:text-xl font-bold text-emerald-50">
                  Nas primeiras <span className="underline decoration-white/40 decoration-2 underline-offset-4">5.000 vendas</span> para novos vendedores.
                </p>
                <p className="mt-1 text-sm text-emerald-100/90">Zero mensalidade, zero taxa de adesão. Começa a vender de graça.</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <a href="/vender" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-emerald-700 font-black text-sm hover:scale-105 transition shadow-lg">
                    <TrendingUp className="w-4 h-4" /> Quero vender com 0%
                  </a>
                  <a href="/planos" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white font-bold text-sm hover:bg-white/25 transition">
                    Ver planos
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid de outros números */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {numeros.slice(1).map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition"
            >
              <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-2 ${
                n.accent === 'brand'
                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
              }`}>
                {n.icon}
              </div>
              <div className="text-3xl md:text-4xl font-black leading-none bg-gradient-to-br from-brand-500 via-indigo-500 to-brand-700 bg-clip-text text-transparent">
                <AnimatedNumber item={n} />
              </div>
              <div className="mt-2 text-xs md:text-sm font-black text-[#0F172A] dark:text-white">{n.label}</div>
              <div className="text-[10px] md:text-xs mt-0.5 leading-snug text-slate-500 dark:text-slate-400">{n.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
