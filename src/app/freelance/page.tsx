'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Briefcase, Clock, DollarSign, Zap, Plus, Search, User,
  ChevronRight, X, Send, CheckCircle2,
} from 'lucide-react'
import { CATEGORIAS_FREELA } from '@/lib/agents/freelancematch'

interface Job {
  id: string; titulo: string; categoria: string; descricao: string;
  orcamentoMin: number; orcamentoMax: number; prazoDias: number;
  contratanteNome: string; urgente: boolean; habilidades: string[]; createdAt: string
}

interface Bid {
  id: string; price?: number; valor?: number; days?: number; prazoDias?: number;
  message?: string; mensagem?: string; status: string;
  created_at?: string; createdAt?: string;
}

export default function FreelancePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState<string>('todas')
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', categoria: 'design', descricao: '', orcMin: '50', orcMax: '200', prazo: '7', urgente: false, habs: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [bidForm, setBidForm] = useState({ price: '', days: '7', message: '' })
  const [bidding, setBidding] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/freelance/jobs?categoria=${cat}&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .finally(() => setLoading(false))
  }, [cat, q])

  async function criarJob(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const resp = await fetch('/api/freelance/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo, categoria: form.categoria, descricao: form.descricao,
          orcamentoMin: Number(form.orcMin), orcamentoMax: Number(form.orcMax), prazoDias: Number(form.prazo),
          urgente: form.urgente, habilidades: form.habs.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      })
      const d = await resp.json().catch(() => ({}))
      if (resp.ok) {
        toast.success('Job publicado!')
        setShowForm(false)
        setForm({ titulo: '', categoria: 'design', descricao: '', orcMin: '50', orcMax: '200', prazo: '7', urgente: false, habs: '' })
        fetch(`/api/freelance/jobs?categoria=${cat}`).then((r) => r.json()).then((d) => setJobs(d.jobs || []))
      } else {
        toast.error(d.error || 'Erro ao publicar')
      }
    } finally { setSubmitting(false) }
  }

  async function openBid(job: Job) {
    setActiveJob(job)
    setBidForm({ price: String(Math.round((job.orcamentoMin + job.orcamentoMax) / 2)), days: String(job.prazoDias), message: '' })
    setBids([])
    try {
      const r = await fetch(`/api/freelance/bids?job_id=${job.id}`)
      if (r.ok) {
        const d = await r.json()
        setBids(d.bids || [])
      }
    } catch { /* sem bids */ }
  }

  async function enviarBid(e: React.FormEvent) {
    e.preventDefault()
    if (!activeJob) return
    setBidding(true)
    try {
      const resp = await fetch('/api/freelance/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: activeJob.id,
          price: Number(bidForm.price),
          days: Number(bidForm.days),
          message: bidForm.message,
        }),
      })
      const d = await resp.json().catch(() => ({}))
      if (resp.ok) {
        toast.success('Proposta enviada! O cliente será notificado.')
        setBids(prev => [d.bid, ...prev])
        setBidForm({ price: '', days: '7', message: '' })
      } else {
        toast.error(d.error || 'Erro ao enviar proposta')
      }
    } finally { setBidding(false) }
  }

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg">
              <Briefcase size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">Freelance Marketplace</h1>
              <p className="text-sm font-bold text-[#64748B] mt-1">Contrate ou ofereça serviços digitais com escrow da KIYVO</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] text-white font-black px-5 py-3 text-sm hover:scale-105 transition-transform">
              <Plus size={16} /> Publicar job
            </button>
          </div>
        </motion.div>

        {showForm && (
          <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={criarJob}
            className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-7 border border-black/5 dark:border-white/5 mb-8 space-y-4">
            <h2 className="font-black text-[#0F172A] dark:text-white text-lg">Publicar novo job</h2>
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título do job (mínimo 8 caracteres)" required
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold focus:outline-none focus:border-[#2563EB]" />
            <div className="grid md:grid-cols-3 gap-3">
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold focus:outline-none focus:border-[#2563EB]">
                {CATEGORIAS_FREELA.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
              </select>
              <input type="number" min={20} value={form.orcMin} onChange={(e) => setForm({ ...form, orcMin: e.target.value })} placeholder="Orçamento mínimo (R$)"
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold focus:outline-none focus:border-[#2563EB]" />
              <input type="number" min={20} value={form.orcMax} onChange={(e) => setForm({ ...form, orcMax: e.target.value })} placeholder="Orçamento máximo (R$)"
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold focus:outline-none focus:border-[#2563EB]" />
            </div>
            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva o que você precisa (mínimo 30 caracteres)" rows={5}
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-4 focus:outline-none focus:border-[#2563EB] resize-none" />
            <div className="grid md:grid-cols-2 gap-3">
              <input type="number" min={1} value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} placeholder="Prazo em dias"
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold focus:outline-none focus:border-[#2563EB]" />
              <input value={form.habs} onChange={(e) => setForm({ ...form, habs: e.target.value })} placeholder="Habilidades necessárias (separadas por vírgula)"
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3 font-bold focus:outline-none focus:border-[#2563EB]" />
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#0F172A] dark:text-white">
              <input type="checkbox" checked={form.urgente} onChange={(e) => setForm({ ...form, urgente: e.target.checked })} />
              <Zap size={14} className="text-amber-500" /> Job urgente (destaque)
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-full bg-slate-100 dark:bg-white/5 font-black px-5 py-3 text-sm">Cancelar</button>
              <button type="submit" disabled={submitting} className="flex-1 rounded-full bg-[#0F172A] text-white font-black px-5 py-3 text-sm disabled:opacity-50">
                {submitting ? 'Publicando...' : 'Publicar job'}
              </button>
            </div>
          </motion.form>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setCat('todas')} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide ${cat === 'todas' ? 'bg-[#2563EB] text-white' : 'bg-white dark:bg-[#0F172A] text-[#64748B] border border-black/5'}`}>Todas</button>
          {CATEGORIAS_FREELA.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide ${cat === c.id ? 'bg-[#2563EB] text-white' : 'bg-white dark:bg-[#0F172A] text-[#64748B] border border-black/5'}`}>
              {c.emoji} {c.nome}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar jobs..."
            className="w-full rounded-full bg-white dark:bg-[#0F172A] border border-black/5 dark:border-white/5 pl-12 pr-5 py-3.5 font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]" />
        </div>

        {loading && <div className="text-center text-[#64748B] py-10 font-bold">Carregando jobs...</div>}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#0F172A] rounded-[2rem] border border-black/5 dark:border-white/5">
            <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-[#64748B]">Nenhum job aberto nessa categoria. Seja o primeiro a publicar!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job, i) => {
            const catInfo = CATEGORIAS_FREELA.find((c) => c.id === job.categoria)
            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-6 border border-black/5 dark:border-white/5 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1">
                    {catInfo?.emoji} {catInfo?.nome || job.categoria}
                  </span>
                  {job.urgente && <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full flex items-center gap-1"><Zap size={10} /> URGENTE</span>}
                </div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white mb-2 leading-tight">{job.titulo}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 mb-4 line-clamp-3">{job.descricao}</p>
                <div className="flex items-center gap-4 text-xs text-[#64748B] mb-4 flex-wrap">
                  <span className="flex items-center gap-1"><DollarSign size={14} /> {fmtBRL(job.orcamentoMin)} - {fmtBRL(job.orcamentoMax)}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {job.prazoDias} dias</span>
                  <span className="flex items-center gap-1"><User size={14} /> {job.contratanteNome}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.habilidades.slice(0, 4).map((h) => (
                    <span key={h} className="text-[10px] font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-1 rounded-lg">{h}</span>
                  ))}
                </div>
                <button onClick={() => openBid(job)} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] text-white font-black px-5 py-3 text-sm hover:scale-[1.02] transition-transform">
                  Enviar proposta <Send size={14} />
                </button>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-sky-700 p-8 text-white">
          <h3 className="text-xl md:text-2xl font-black mb-2">🛡️ Escrow em todos os jobs</h3>
          <p className="text-white/80 mb-4">O dinheiro só é liberado para o freelancer quando o trabalho é aprovado. Disputas são mediadas pela equipe KIYVO. Taxa: apenas 8% do valor do job (menor que 99% dos marketplaces do Brasil).</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/planos" className="inline-flex items-center gap-2 rounded-full bg-white text-sky-700 font-black px-5 py-2.5 text-sm hover:scale-105">Quero ser freelancer</Link>
            <Link href="/agentes" className="inline-flex items-center gap-2 rounded-full bg-white/10 font-black px-5 py-2.5 text-sm hover:bg-white/20">Ver agentes</Link>
          </div>
        </div>
      </div>

      {/* Modal de proposta */}
      <AnimatePresence>
        {activeJob && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setActiveJob(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-2xl bg-[#FAFAFA] dark:bg-[#0F172A] rounded-t-[2rem] md:rounded-[2rem] max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#FAFAFA] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5 p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-brand-600">Enviar proposta</p>
                  <h3 className="font-black text-lg text-[#0F172A] dark:text-white line-clamp-1">{activeJob.titulo}</h3>
                </div>
                <button onClick={() => setActiveJob(null)} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10">
                  <X size={18}/>
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white dark:bg-white/5 rounded-2xl p-3">
                    <p className="text-[10px] font-black uppercase text-[#94A3B8]">Orçamento</p>
                    <p className="font-black text-sm">{fmtBRL(activeJob.orcamentoMin)} - {fmtBRL(activeJob.orcamentoMax)}</p>
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-2xl p-3">
                    <p className="text-[10px] font-black uppercase text-[#94A3B8]">Prazo</p>
                    <p className="font-black text-sm">{activeJob.prazoDias} dias</p>
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-2xl p-3">
                    <p className="text-[10px] font-black uppercase text-[#94A3B8]">Propostas</p>
                    <p className="font-black text-sm">{bids.length}</p>
                  </div>
                </div>

                <form onSubmit={enviarBid} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Sua proposta (R$)</label>
                      <input
                        type="number"
                        min={Math.max(30, Math.round(activeJob.orcamentoMin * 0.5))}
                        max={Math.min(50000, Math.round(activeJob.orcamentoMax * 2))}
                        step="0.01"
                        required
                        value={bidForm.price}
                        onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                        className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Mín: R$ {Math.max(30, Math.round(activeJob.orcamentoMin * 0.5)).toFixed(2).replace('.', ',')} •
                        Máx: R$ {Math.min(50000, Math.round(activeJob.orcamentoMax * 2)).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Prazo (dias)</label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        required
                        value={bidForm.days}
                        onChange={(e) => setBidForm({ ...bidForm, days: e.target.value })}
                        className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-1">Mensagem (mín 15 caracteres)</label>
                    <textarea
                      value={bidForm.message}
                      onChange={(e) => setBidForm({ ...bidForm, message: e.target.value.slice(0, 500) })}
                      rows={4}
                      placeholder="Explique por que você é o melhor freelancer para esse job, seu portfólio e como vai entregar..."
                      className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 focus:outline-none focus:border-brand-500 resize-none text-sm"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 text-right">{bidForm.message.length}/500</p>
                  </div>
                  {/* Selos de segurança */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl">
                    🔒 Pagamento por escrow • Você só recebe após entrega
                  </div>
                  <button type="submit" disabled={bidding} className="w-full rounded-full bg-[#0F172A] hover:bg-brand-600 dark:bg-white dark:text-black text-white font-black py-3.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg">
                    {bidding ? 'Enviando...' : <>Enviar proposta <Send size={14}/></>}
                  </button>
                </form>

                {bids.length > 0 && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2">Propostas recentes</p>
                    <div className="space-y-2">
                      {bids.slice(0, 5).map((b) => (
                        <div key={b.id} className="bg-white dark:bg-white/5 rounded-2xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">{fmtBRL(Number(b.price ?? b.valor ?? 0))}</p>
                            <p className="text-xs text-[#64748B]">{b.days ?? b.prazoDias ?? '?'} dias</p>
                            {(b.message || b.mensagem) && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{b.message || b.mensagem}</p>
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10}/> Enviada
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-[#94A3B8] text-center pt-2 border-t border-black/5 dark:border-white/5">
                  🔒 Escrow: o cliente deposita o valor antes do trabalho começar.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
