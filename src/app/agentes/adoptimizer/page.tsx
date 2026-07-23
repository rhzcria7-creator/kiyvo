'use client'
// ─────────────────────────────────────────────────────────────
// /agentes/adoptimizer — Otimizador de anuncios (CPA/ROAS)
// Gera 5 variantes de copy, 3 publicos, orcamento ideal,
// diagnosticos e dicas de thumbnail em 1 clique.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Sparkles, TrendingUp, Target, DollarSign, AlertTriangle,
  CheckCircle2, Image as ImageIcon, Copy, ChevronRight, Zap,
} from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import { Loader2 } from 'lucide-react'

interface Variant { headline: string; primaryText: string; cta: string; hook: string }
interface Audience { name: string; ageRange: string; interests: string[]; placements: string[] }
interface Result {
  score: number; estimatedCPA: number; estimatedROAS: number
  variants: Variant[]; audiences: Audience[]
  budget: { dailyRecommended: number; testDays: number; split: { name: string; pct: number }[] }
  diagnostics: { type: 'good'|'warn'|'bad'; message: string }[]
  thumbnailHints: string[]; tags: string[]
}

const CATEGORIAS = [
  { id: '', nome: 'Selecione (opcional)' },
  { id: 'jogos', nome: '🎮 Jogos' },
  { id: 'software', nome: '💻 Software' },
  { id: 'streaming', nome: '🎬 Streaming' },
  { id: 'giftcards', nome: '🎁 Gift Cards' },
  { id: 'cursos', nome: '📚 Cursos' },
  { id: 'templates', nome: '🎨 Templates' },
  { id: 'ia', nome: '🤖 IA / Prompts' },
]

const PLATAFORMAS = [
  { id: 'meta', nome: 'Meta (Facebook/Instagram)' },
  { id: 'tiktok', nome: 'TikTok Ads' },
  { id: 'google', nome: 'Google Ads' },
  { id: 'youtube', nome: 'YouTube Ads' },
]

export default function AdOptimizerPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [desc, setDesc] = useState('')
  const [platform, setPlatform] = useState<'meta'|'tiktok'|'google'|'youtube'>('meta')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || title.length < 5) { toast.error('Título precisa ter ao menos 5 caracteres'); return }
    const p = Number(price)
    if (!Number.isFinite(p) || p < 1) { toast.error('Preço inválido'); return }
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/adoptimizer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: title, productPrice: p, productCategory: category,
          productDescription: desc, platform, dailyBudget: Number(budget)||0,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro')
      setResult(d.result)
      toast.success('Análise pronta!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro')
    } finally { setLoading(false) }
  }

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success('Copiado!') } catch { toast.error('Copie manualmente') }
  }

  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-rose-600'
  const scoreBg = (s: number) => s >= 75 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen pb-20">
      <section className="pt-10 pb-8 md:pt-16 md:pb-10 border-b border-black/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/agentes" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#64748B] hover:text-brand-600 mb-5">
            ← Agentes
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg">
              <TrendingUp size={22} className="text-white"/>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">AdOptimizer</h1>
              <p className="text-sm text-[#64748B] font-bold mt-1">Reduza seu CPA em até 40% em 1 clique</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 grid lg:grid-cols-5 gap-6">
        <form onSubmit={run} className="lg:col-span-2 bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10 space-y-4 h-fit">
          <h2 className="font-black text-lg">Dados do produto</h2>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Gift Card Steam R$100"
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500"/>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Preço (R$) *</label>
            <input type="number" step="0.01" min={1} value={price} onChange={e => setPrice(e.target.value)} placeholder="49,90"
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500"/>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500">
              {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Plataforma</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as 'meta'|'tiktok'|'google'|'youtube')}
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500">
              {PLATAFORMAS.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Orçamento diário (R$)</label>
            <input type="number" min={5} value={budget} onChange={e => setBudget(e.target.value)} placeholder="50"
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500"/>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Descrição (opcional)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value.slice(0, 300))} rows={3}
              placeholder="Diferencial do produto..."
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-4 py-3 focus:outline-none focus:border-brand-500 resize-none"/>
          </div>
          <ShimmerButton type="submit" disabled={loading} className="w-full justify-center" icon={<Sparkles size={16}/>}>
            {loading ? 'Otimizando...' : 'Otimizar anúncio'}
          </ShimmerButton>
        </form>

        <div className="lg:col-span-3 space-y-5">
          {loading && (
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-10 border border-black/5 dark:border-white/10 text-center">
              <Loader2 size={32} className="mx-auto animate-spin text-brand-600 mb-3"/>
              <p className="font-bold">Analisando produto e gerando campanhas...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-10 border border-black/5 dark:border-white/10 text-center">
              <TrendingUp size={40} className="mx-auto text-[#CBD5E1] mb-4"/>
              <p className="font-black text-lg text-[#0F172A] dark:text-white">Preencha os dados do produto</p>
              <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto">
                Nossa IA vai gerar 5 variantes de copy, 3 públicos, orçamento ideal e dicas de thumbnail
                para reduzir seu CPA no {platform.toUpperCase()}.
              </p>
            </div>
          )}

          {result && (
            <>
              {/* Score Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className={`font-display font-black text-6xl ${scoreColor(result.score)}`}>{result.score}</p>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">Score do produto</p>
                  </div>
                  <div className="text-center border-x border-black/5 dark:border-white/10">
                    <p className="font-display font-black text-3xl text-[#0F172A] dark:text-white">R$ {result.estimatedCPA.toFixed(2)}</p>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">CPA estimado</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-black text-3xl text-[#0F172A] dark:text-white">{result.estimatedROAS.toFixed(1)}x</p>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">ROAS estimado</p>
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }} transition={{ duration: 1 }}
                    className={`h-full ${scoreBg(result.score)}`} />
                </div>
              </motion.div>

              {/* Diagnostics */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><AlertTriangle size={18}/> Diagnóstico</h3>
                <div className="space-y-2">
                  {result.diagnostics.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2 p-3 rounded-xl ${
                      d.type === 'good' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                      d.type === 'warn' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' :
                      'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'}`}>
                      {d.type === 'good' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0"/> : <AlertTriangle size={16} className="mt-0.5 shrink-0"/>}
                      <p className="text-sm font-semibold">{d.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Budget */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><DollarSign size={18}/> Orçamento recomendado</h3>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-brand-50 dark:bg-brand-500/10 p-4">
                    <p className="text-[10px] font-black uppercase text-brand-700">Diário</p>
                    <p className="font-display font-black text-2xl text-brand-700">R$ {result.budget.dailyRecommended}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-white/10 p-4">
                    <p className="text-[10px] font-black uppercase text-[#64748B]">Teste por</p>
                    <p className="font-display font-black text-2xl">{result.budget.testDays} dias</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.budget.split.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="font-black">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Variantes */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Zap size={18}/> 5 Criativos prontos</h3>
                <div className="space-y-3">
                  {result.variants.map((v, i) => (
                    <div key={i} className="rounded-2xl border border-black/5 dark:border-white/10 p-4 hover:border-brand-500/50 transition">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">#{i+1}</span>
                        <button onClick={() => copy(`${v.headline}\n\n${v.primaryText}\n\nCTA: ${v.cta}`)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><Copy size={14}/></button>
                      </div>
                      <p className="font-black text-[#0F172A] dark:text-white">{v.headline}</p>
                      <p className="text-sm text-[#64748B] mt-1">{v.primaryText}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-600 text-white text-[10px] font-black">
                        {v.cta} <ChevronRight size={10}/>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Públicos */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Target size={18}/> Públicos-alvo</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {result.audiences.map((a, i) => (
                    <div key={i} className="rounded-2xl bg-[#FAFAFA] dark:bg-black/20 p-4">
                      <p className="font-black text-sm text-[#0F172A] dark:text-white">{a.name}</p>
                      <p className="text-xs text-[#64748B] mt-1">Idade: {a.ageRange}</p>
                      {a.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.interests.slice(0,4).map(inte => (
                            <span key={inte} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">{inte}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Thumbnails */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2"><ImageIcon size={18}/> Dicas de thumbnail</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.thumbnailHints.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 text-sm">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0"/>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
                <Link href="/agentes/bannerforge" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-brand-600 hover:underline">
                  Gerar thumbnail no BannerForge →
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
