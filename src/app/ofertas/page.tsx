'use client'
// /ofertas — Produtos com maior desconto no catálogo (ordenados por % off)
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Percent, Sparkles, Filter, Tag } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductCard, type Product } from '@/components/ProductCard'

export default function OfertasPage() {
  const [produtos, setProdutos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [minDesconto, setMinDesconto] = useState(20)
  const [maxPreco, setMaxPreco] = useState(200)
  const [somenteEntregaAuto, setSomenteEntregaAuto] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/products?limit=200&ordenar=desconto`)
      .then(r => r.json())
      .then(data => setProdutos(data?.data || []))
      .catch(() => setProdutos([]))
      .finally(() => setLoading(false))
  }, [])

  const ofertas = useMemo(() => {
    return produtos
      .map(p => {
        const de = p.preco_de && p.preco_de > p.preco ? p.preco_de : p.preco * 1.4
        const descPct = Math.round((1 - p.preco / de) * 100)
        return { ...p, _de: de, _desc: descPct }
      })
      .filter(p => p._desc >= minDesconto && p.preco <= maxPreco)
      .filter(p => !somenteEntregaAuto || p.entrega_automatica !== false)
      .sort((a, b) => b._desc - a._desc)
  }, [produtos, minDesconto, maxPreco, somenteEntregaAuto])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
        <section className="relative bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-yellow-300 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-[11px] font-black uppercase tracking-widest mb-4">
              <Flame className="w-3.5 h-3.5 animate-pulse" /> Ofertas relâmpago
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">As melhores ofertas<br/>do marketplace</h1>
            <p className="mt-3 text-white/90 max-w-xl">Produtos com desconto de até 90% — entrega automática, garantia de 7 dias e devolução fácil.</p>
            <div className="mt-5 flex flex-wrap gap-6 text-sm font-black">
              <span className="flex items-center gap-1.5"><Percent className="w-4 h-4" /> Até 90% OFF</span>
              <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> Cupons automáticos</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Novas ofertas todo dia</span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Filtros */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500"><Filter className="w-4 h-4" />Filtros</span>
            <label className="flex items-center gap-2 text-xs font-bold">
              Mínimo desconto:
              <select value={minDesconto} onChange={e => setMinDesconto(Number(e.target.value))}
                className="bg-slate-100 dark:bg-white/10 rounded-lg px-2 py-1 outline-none">
                {[10,20,30,40,50,60].map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              Máx. preço:
              <input type="range" min="10" max="500" step="10" value={maxPreco} onChange={e => setMaxPreco(Number(e.target.value))} className="accent-red-500" />
              <span className="font-black">R${maxPreco}</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
              <input type="checkbox" checked={somenteEntregaAuto} onChange={e => setSomenteEntregaAuto(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
              Entrega automática
            </label>
            <span className="ml-auto text-xs font-black text-slate-500">{ofertas.length} ofertas</span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-3 border border-slate-100 dark:border-slate-800">
                  <div className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                  <div className="h-4 bg-slate-100 dark:bg-white/5 rounded mt-3 animate-pulse" />
                  <div className="h-3 bg-slate-100 dark:bg-white/5 rounded mt-2 w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : ofertas.length === 0 ? (
            <div className="text-center py-20">
              <Flame className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-black text-slate-500">Nenhuma oferta com esses filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {ofertas.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once: true }} transition={{ delay: Math.min(i*0.04,0.5) }}
                  className="relative">
                  <div className="absolute -top-2 -left-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Flame className="w-3 h-3" /> -{p._desc}%
                  </div>
                  <ProductCard produto={p} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
