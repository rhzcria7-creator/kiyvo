'use client'
// DailyDeals — seção "Ofertas do dia" com contador regressivo até meia-noite.
// Mostra produtos com maior desconto. Mobile-first, scroll horizontal snap.
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, ChevronLeft, ChevronRight, Tag, Star } from 'lucide-react'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'

interface Prod { id: string; slug?: string; titulo: string; preco: number; preco_de?: number | null; emoji?: string; gradient?: string; categoria?: string; vendedor_nome?: string; rating?: number; total_vendas?: number }

function pad(n: number) { return String(n).padStart(2, '0') }
function endOfDay() { const e = new Date(); e.setHours(23,59,59,999); return e.getTime() }

export function DailyDeals() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [now, setNow] = useState(Date.now())
  const endAt = useMemo(() => endOfDay(), [])

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])

  // Pega 12 produtos com maior desconto percentual e que tenham preco_de
  const produtos = useMemo<Prod[]>(() => {
    const all = [...(DEMO_PRODUCTS as unknown as Prod[]), ...(GG_PRODUCTS as unknown as Prod[]), ...(MEGA_PRODUCTS as unknown as Prod[])]
    return all
      .filter(p => p.preco_de && p.preco_de > p.preco && p.preco_de > 5)
      .map(p => ({ ...p, _pct: (p.preco_de! - p.preco) / p.preco_de! }))
      .sort((a, b) => (b as any)._pct - (a as any)._pct)
      .slice(0, 12)
  }, [])

  function updateArrows() {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [])

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const ms = Math.max(0, endAt - now)
  const secs = Math.floor(ms/1000)
  const hh = Math.floor(secs/3600)
  const mm = Math.floor((secs%3600)/60)
  const ss = secs%60

  if (produtos.length === 0) return null

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-red-50/40 via-transparent to-transparent dark:from-red-950/10 dark:via-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 md:mb-7 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                <Flame className="w-3.5 h-3.5" /> Ofertas do dia
              </span>
              <div className="flex items-center gap-1 bg-red-600 text-white rounded-lg px-2 py-1 font-black tabular-nums text-sm">
                <Clock className="w-3 h-3" />
                <span suppressHydrationWarning>{pad(hh)}:{pad(mm)}:{pad(ss)}</span>
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              Até <span className="text-red-600 dark:text-red-400">70% OFF</span> — termina hoje!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Corre que acaba em algumas horas</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scrollBy(-380)} disabled={!canPrev}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition"
              aria-label="Anterior"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => scrollBy(380)} disabled={!canNext}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition"
              aria-label="Próximo"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </motion.div>

        <div className="relative -mx-4 sm:mx-0">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 sm:px-0 pb-4 -mb-4"
          >
            {produtos.map((p, i) => {
              const desconto = p.preco_de ? Math.round((1 - p.preco / p.preco_de) * 100) : 0
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: Math.min(i*0.04, 0.35), type: 'spring', stiffness:200, damping:22 }}
                  className="snap-start shrink-0 w-[220px] sm:w-[240px] bg-white dark:bg-[#111827] rounded-[1.25rem] border-2 border-red-200/60 dark:border-red-500/30 overflow-hidden relative hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition"
                >
                  <Link href={`/p/${p.slug || p.id}`} className="block">
                    <div className="relative aspect-[4/3] bg-gradient-to-br ${p.gradient || 'from-red-400 to-rose-600'} flex items-center justify-center">
                      <span className="text-5xl drop-shadow-lg">{p.emoji || '🎁'}</span>
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-0.5 shadow-lg">
                        <Tag className="w-2.5 h-2.5" /> -{desconto}%
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" /> {(p.rating || 4.8).toFixed(1)}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-black text-[#0F172A] dark:text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.titulo}</h3>
                      <div className="mt-2 flex items-end gap-1.5">
                        <span className="text-xs text-slate-400 line-through">R$ {p.preco_de?.toFixed(2).replace('.',',')}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-red-600 dark:text-red-400">R$ {p.preco.toFixed(2).replace('.',',')}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">à vista no PIX ou 12x sem juros</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-red-50/40 dark:from-[#0B0F1A] to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-red-50/40 dark:from-[#0B0F1A] to-transparent sm:hidden" />
        </div>
      </div>
    </section>
  )
}

export default DailyDeals
