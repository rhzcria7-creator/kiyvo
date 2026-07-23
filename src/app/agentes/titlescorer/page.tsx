'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Type, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { AgentShell, Field, inputClass, textareaClass } from '@/components/agents/AgentShell'

interface ScorerResult {
  pontuacao: number
  nota: string
  forcas: string[]
  fraquezas: string[]
  variantesMelhoradas: string[]
  checklist: Array<{ item: string; ok: boolean }>
}

export default function Page() {
  const [titulo, setTitulo] = useState('')
  const [nicho, setNicho] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScorerResult | null>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/titlescorer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, nicho }) })
      setResult(await r.json())
    } catch { setResult(null) } finally { setLoading(false) }
  }
  const corNota = result?.nota === 'excelente' ? 'text-emerald-500' : result?.nota === 'bom' ? 'text-sky-500' : result?.nota === 'regular' ? 'text-amber-500' : 'text-red-500'
  return (
    <AgentShell titulo="TitleScorer" tagline="Pontua títulos de 0 a 100 e sugere variantes que convertem mais" icone={<Type className="w-7 h-7" />} cor="bg-gradient-to-br from-violet-500 to-fuchsia-500" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A]">
            <div className="text-5xl font-black text-brand-500">{result.pontuacao}</div>
            <div>
              <div className={`text-xl font-black uppercase ${corNota}`}>{result.nota}</div>
              <div className="text-xs text-slate-500">de 100</div>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Checklist</h3>
            <div className="space-y-2">
              {result.checklist.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {c.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <span className={c.ok ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}>{c.item}</span>
                </div>
              ))}
            </div>
          </div>
          {result.forcas.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">✅ Pontos fortes</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {result.forcas.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          {result.fraquezas.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">⚠ Pontos a melhorar</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {result.fraquezas.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Variantes otimizadas</h3>
            <div className="space-y-2">
              {result.variantesMelhoradas.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-sm font-medium text-violet-900 dark:text-violet-200">{v}</motion.div>
              ))}
            </div>
          </div>
        </div>
      )}>
      <Field label="Título para analisar"><textarea className={textareaClass} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Curso de marketing digital que ensina tudo" /></Field>
      <Field label="Nicho (opcional)"><input className={inputClass} value={nicho} onChange={e => setNicho(e.target.value)} placeholder="marketing digital" /></Field>
    </AgentShell>
  )
}
