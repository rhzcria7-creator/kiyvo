'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Radar, Flame, TrendingUp, AlertTriangle, Loader2, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'

const CATEGORIAS = ['todas', 'jogos', 'streaming', 'software', 'cursos', 'giftcards', 'marketing', 'musica', 'seguranca', 'produtividade', 'templates']

interface Sugestao {
  id: string; titulo: string; categoria: string; scoreViral: number; precoSugerido: number; margemEstimada: number
  fonte: string; razao: string; tags: string[]; risco: 'baixo' | 'medio' | 'alto'
}

export default function ProductHunterPage() {
  const [cat, setCat] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [produtos, setProdutos] = useState<Sugestao[]>([])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/agents/producthunter?categoria=${cat}&max=20`)
      .then((r) => r.json())
      .then((d) => setProdutos(d.produtos || []))
      .finally(() => setLoading(false))
  }, [cat])

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/agentes" className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] mb-3 inline-flex">← Voltar</Link>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Radar size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">ProductHunter</h1>
              <p className="text-sm font-bold text-[#64748B] mt-1">Descubra produtos virais e de alta margem para vender agora</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-5 px-5 md:mx-0 md:px-0">
          {CATEGORIAS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                cat === c ? 'bg-[#2563EB] text-white shadow-lg' : 'bg-white dark:bg-[#0F172A] text-[#64748B] border border-black/5 dark:border-white/5 hover:border-[#2563EB]'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-6 border border-black/5 dark:border-white/5 animate-pulse">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-3" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-white/10 rounded mb-6" />
                <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {produtos.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-6 border border-black/5 dark:border-white/5 hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1">{p.categoria}</span>
                  {p.risco === 'baixo' && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">Risco baixo</span>}
                  {p.risco === 'medio' && <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full"><AlertTriangle size={10} className="inline mr-1" />Risco médio</span>}
                  {p.risco === 'alto' && <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-500/10 px-2 py-1 rounded-full">Risco alto</span>}
                </div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white mb-2 leading-tight">{p.titulo}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 mb-4 leading-relaxed flex-1">{p.razao}</p>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Flame size={14} /> <span className="font-black">{p.scoreViral}/100</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#2563EB]">
                    <TrendingUp size={14} /> <span className="font-black">{p.margemEstimada}% margem</span>
                  </div>
                  <div className="ml-auto font-black text-xl text-[#0F172A] dark:text-white">R${p.precoSugerido.toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">#{t}</span>
                  ))}
                </div>
                <div className="text-[10px] text-[#94A3B8] mb-3">Fonte: {p.fonte}</div>
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-black px-5 py-3 text-xs hover:scale-[1.02] transition-transform">
                  <Plus size={14} /> Gerar ficha completa + banner
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-white">
          <div className="flex items-start gap-4">
            <Sparkles size={28} className="shrink-0 mt-1" />
            <div>
              <h3 className="text-xl md:text-2xl font-black mb-2">Quer que a gente cadastre e publique automaticamente?</h3>
              <p className="text-white/80 mb-4">Com o plano <strong>Pro</strong> ou <strong>Vendor Pro</strong>, o ProductHunter gera ficha completa (copy + banner) e publica direto na Loja Oficial da KIYVO com seu selo de afiliado — você ganha comissão em cada venda sem esforço.</p>
              <Link href="/planos" className="inline-flex items-center gap-2 rounded-full bg-white text-violet-700 font-black px-5 py-2.5 text-sm hover:scale-105 transition-transform">
                Ver planos Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
