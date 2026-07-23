'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, AlertTriangle, XCircle, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Resultado {
  aprovado: boolean
  score: number
  flags: Array<{ tipo: string; severidade: string; trecho: string; motivo: string }>
  versaoLimpa?: string
  recomendacao: 'aprovar' | 'revisar' | 'rejeitar'
}

export default function ReviewShieldPage() {
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [r, setR] = useState<Resultado | null>(null)

  async function verificar() {
    if (!texto.trim()) return
    setLoading(true)
    try {
      const resp = await fetch('/api/agents/reviewshield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })
      setR(await resp.json())
    } finally { setLoading(false) }
  }

  const scoreColor = r && r.score < 25 ? 'text-emerald-500' : r && r.score < 60 ? 'text-amber-500' : 'text-red-500'
  const bgColor = r && r.aprovado ? 'from-emerald-500 to-teal-500' : r && r.recomendacao === 'revisar' ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-600'

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/agentes" className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] mb-3 inline-flex">← Voltar</Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">ReviewShield</h1>
              <p className="text-sm font-bold text-[#64748B] mt-1">Moderação anti-fraude, anti-spam e anti-IA. 100% grátis.</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-7 shadow-sm border border-black/5 dark:border-white/5 mb-6">
          <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Cole o texto para verificar</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={8}
            placeholder="Cole aqui a descrição do produto, review, comentário ou mensagem..."
            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-4 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] resize-none" />
          <button onClick={verificar} disabled={loading || !texto.trim()}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] text-white font-black px-6 py-4 text-sm hover:scale-[1.01] transition-transform disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? 'Analisando...' : 'Verificar conteúdo'}
          </button>
        </div>

        {r && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className={`rounded-[2rem] p-6 bg-gradient-to-br ${bgColor} text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {r.aprovado ? <CheckCircle2 size={36} /> : r.recomendacao === 'revisar' ? <AlertTriangle size={36} /> : <XCircle size={36} />}
                  <div>
                    <div className="text-sm font-bold opacity-80">Pontuação de risco</div>
                    <div className={`text-5xl font-black ${scoreColor}`} style={{ textShadow: 'none' }}>{r.score}/100</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80">Recomendação</div>
                  <div className="text-2xl font-black uppercase">{r.recomendacao}</div>
                </div>
              </div>
            </div>

            {r.flags.length === 0 && (
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 font-bold">
                ✅ Nenhuma flag detectada. Conteúdo seguro para publicação.
              </div>
            )}

            {r.flags.map((f, i) => (
              <div key={i} className={`bg-white dark:bg-[#0F172A] rounded-2xl p-5 border-l-4 ${
                f.severidade === 'alta' ? 'border-red-500' : f.severidade === 'media' ? 'border-amber-500' : 'border-slate-400'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 bg-red-500/10 text-red-600">{f.tipo}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 ${
                    f.severidade === 'alta' ? 'bg-red-500/10 text-red-600' : f.severidade === 'media' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-500/10 text-slate-600'
                  }`}>{f.severidade}</span>
                </div>
                <p className="text-sm text-[#0F172A] dark:text-slate-200 font-semibold mb-1">{f.motivo}</p>
                <code className="text-xs text-[#64748B] bg-slate-100 dark:bg-white/5 px-2 py-1 rounded block">"{f.trecho}"</code>
              </div>
            ))}

            {r.versaoLimpa && (
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-black/5 dark:border-white/5">
                <h3 className="font-black text-[#0F172A] dark:text-white text-sm mb-2">🧹 Versão limpa automática</h3>
                <p className="text-sm text-[#475569] dark:text-slate-300 whitespace-pre-wrap">{r.versaoLimpa}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
