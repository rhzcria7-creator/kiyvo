'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, TrendingUp, TrendingDown, Target, Loader2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORIAS = ['jogos', 'streaming', 'software', 'cursos', 'giftcards', 'marketing', 'templates', 'musica', 'ebooks', 'api', 'outro']

export default function PriceMasterPage() {
  const [produto, setProduto] = useState('')
  const [categoria, setCategoria] = useState('software')
  const [custo, setCusto] = useState('')
  const [concorrentes, setConcorrentes] = useState('')
  const [loading, setLoading] = useState(false)
  const [r, setR] = useState<any>(null)

  async function calcular() {
    setLoading(true)
    try {
      const resp = await fetch('/api/agents/pricemaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto: produto || 'Produto digital',
          categoria,
          custoFornecedor: custo ? Number(custo) : undefined,
          concorrentes: concorrentes ? concorrentes.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n)) : undefined,
        }),
      })
      const data = await resp.json()
      setR(data.result)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/agentes" className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] mb-3 inline-flex">← Voltar</Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <LineChart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">PriceMaster</h1>
              <p className="text-sm font-bold text-[#64748B] mt-1">Preço ótimo, margem calculada e preço psicológico</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-7 shadow-sm border border-black/5 dark:border-white/5 space-y-5">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Produto</label>
            <input value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Ex: Microsoft 365 Família (1 ano)"
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3.5 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]">
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Custo do fornecedor (R$)</label>
              <input type="number" step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="Ex: 45.00"
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3.5 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Preços concorrentes (separados por vírgula)</label>
              <input value={concorrentes} onChange={(e) => setConcorrentes(e.target.value)} placeholder="Ex: 249, 259, 279"
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3.5 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]" />
            </div>
          </div>
          <button onClick={calcular} disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] text-white font-black px-6 py-4 text-sm hover:scale-[1.01] transition-transform disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
            {loading ? 'Calculando...' : 'Calcular preço ideal'}
          </button>
        </div>

        {r && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <PrecoCard titulo="Preço sugerido" valor={`R$ ${r.precoSugerido.toFixed(2).replace('.', ',')}`} icone={Target} cor="from-emerald-500 to-teal-500" grande />
            <PrecoCard titulo="Promo lançamento" valor={`R$ ${r.precoPromocional.toFixed(2).replace('.', ',')}`} icone={TrendingDown} cor="from-amber-500 to-orange-500" />
            <PrecoCard titulo="Preço mínimo" valor={`R$ ${r.precoMinimo.toFixed(2).replace('.', ',')}`} icone={TrendingDown} cor="from-red-500 to-rose-500" />
            <PrecoCard titulo="Teto de preço" valor={`R$ ${r.precoMaximo.toFixed(2).replace('.', ',')}`} icone={TrendingUp} cor="from-blue-500 to-indigo-600" />
            <div className="col-span-2 md:col-span-4 bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-black/5 dark:border-white/5">
              <h3 className="font-black text-[#0F172A] dark:text-white mb-2">📊 Análise</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider rounded-full px-3 py-1 bg-[#2563EB]/10 text-[#2563EB]">
                  Margem líquida: {r.margemLiquida}%
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider rounded-full px-3 py-1 bg-violet-500/10 text-violet-600">
                  Estratégia: {r.estrategia}
                </span>
              </div>
              <p className="text-sm text-[#475569] dark:text-slate-300 leading-relaxed">{r.justificativa}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function PrecoCard({ titulo, valor, icone: Icon, cor, grande }: { titulo: string; valor: string; icone: any; cor: string; grande?: boolean }) {
  return (
    <div className={`bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-black/5 dark:border-white/5 ${grande ? 'col-span-2' : ''}`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cor} flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">{titulo}</div>
      <div className={`font-black text-[#0F172A] dark:text-white ${grande ? 'text-3xl' : 'text-xl'}`}>{valor}</div>
    </div>
  )
}
