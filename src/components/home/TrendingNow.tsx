'use client'
// TrendingNow — carrossel horizontal "Em Alta 🔥"
// Mostra produtos destaque/boost/populares com scroll horizontal touch-friendly
// e indicador visual de "em alta".
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, ChevronLeft, ChevronRight, Star, Zap, ShoppingCart } from 'lucide-react'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'
import { useBoost } from '@/lib/boost/store'

interface Prod { id: string; slug?: string; titulo: string; preco: number; preco_de?: number | null; emoji?: string; gradient?: string; categoria?: string; vendedor_nome?: string; rating?: number; total_vendas?: number; boost?: boolean }

export function TrendingNow() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const isBoosted = useBoost(s => s.isBoosted)
  const initBoost = useBoost(s => s.init)
  useEffect(() => { initBoost() }, [initBoost])

  // Monta lista: produtos com boost vêm primeiro, depois os mais vendidos, depois os melhores avaliados
  const produtos = useMemo<Prod[]>(() => {
    const all = [...(DEMO_PRODUCTS as unknown as Prod[]), ...(GG_PRODUCTS as unknown as Prod[]), ...(MEGA_PRODUCTS as unknown as Prod[])]
    const boosted = all.filter(p => p.boost || isBoosted(p.id))
    const outros = all
      .filter(p => !boosted.find(b => b.id === p.id))
      .sort((a, b) => (b.total_vendas || 0) - (a.total_vendas || 0))
    const result = [...boosted, ...outros].slice(0, 14)
    return result
  }, [isBoosted])

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

  return (
    <section className="py-12 md:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="flex items-end justify-between mb-5 md:mb-7 gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 mb-2">
              <Flame className="w-3.5 h-3.5" /> Em alta agora
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              Bombando na KIYVO 🔥
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Os mais vendidos e destacados das últimas 24h</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollBy(-380)}
              disabled={!canPrev}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition"
              aria-label="Anterior"
            ><ChevronLeft className="w-5 h-5" /></button>
            <button
              onClick={() => scrollBy(380)}
              disabled={!canNext}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition"
              aria-label="Próximo"
            ><ChevronRight className="w-5 h-5" /></button>
          </div>
        </motion.div>

        <div className="relative -mx-4 sm:mx-0">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 sm:px-0 pb-4 -mb-4"
          >
            {produtos.map((p, i) => {
              const boosted = Boolean(p.boost) || Boolean(isBoosted(p.id))
              const desconto = p.preco_de && p.preco_de > p.preco ? Math.round((1 - p.preco / p.preco_de) * 100) : 0
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), type: 'spring', stiffness: 200, damping: 22 }}
                  className={`snap-start shrink-0 w-[260px] sm:w-[280px] bg-white dark:bg-[#111827] rounded-[1.5rem] border overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all ${
                    boosted
                      ? 'border-amber-300/70 dark:border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <Link href={`/p/${p.slug || p.id}`} className="block">
                    <div className={`relative aspect-[4/3] bg-gradient-to-br ${p.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center`}>
                      <span className="text-6xl drop-shadow-lg">{p.emoji || '✨'}</span>
                      <div className="absolute top-2 left-2 flex gap-1">
                        {boosted && (
                          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-0.5 shadow">
                            <Zap className="w-2.5 h-2.5 fill-current" /> Destaque
                          </span>
                        )}
                        {desconto > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow">
                            -{desconto}%
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-orange-400" /> {(p.total_vendas || 0) + 120} vendas
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-[#0F172A] dark:text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.titulo}</h3>
                      <div className="flex items-center gap-1 mt-2 text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-amber-600 dark:text-amber-400">{(p.rating || 4.8).toFixed(1)}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-medium">{p.vendedor_nome || 'KIYVO'}</span>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <div>
                          {p.preco_de && p.preco_de > p.preco && (
                            <div className="text-[10px] text-slate-400 line-through">R$ {p.preco_de.toFixed(2).replace('.', ',')}</div>
                          )}
                          <div className="text-xl font-black text-[#0F172A] dark:text-white">R$ {p.preco.toFixed(2).replace('.', ',')}</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          {/* fade nas bordas */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FAFAFA] dark:from-[#0B0F1A] to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FAFAFA] dark:from-[#0B0F1A] to-transparent sm:hidden" />
        </div>
      </div>
    </section>
  )
}

export default TrendingNow
