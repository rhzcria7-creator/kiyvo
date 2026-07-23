'use client'
import { useState } from 'react'
import { Type } from 'lucide-react'
import { AgentShell, Field, inputClass, textareaClass } from '@/components/agents/AgentShell'
import type { TitleSplitOutput } from '@/lib/agents/titlesplit'

export default function Page() {
  const [produto, setProduto] = useState('')
  const [nicho, setNicho] = useState('')
  const [publico, setPublico] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [dor, setDor] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<TitleSplitOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/titlesplit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, nicho, publico, beneficio, dor }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="TitleSplit" tagline="6 títulos A/B testados com CTR estimado pela IA"
      icone={<Type className="w-7 h-7" />} cor="bg-gradient-to-br from-purple-500 to-indigo-600"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">🏆 Vencedor — fórmula {out.vencedor.formula}</p>
            <p className="text-xl md:text-2xl font-black mt-2 leading-tight">{out.vencedor.titulo}</p>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <span className="bg-white/20 rounded-full px-3 py-1 font-bold">CTR est. {out.vencedor.ctrEstimado}%</span>
              <span className="bg-white/20 rounded-full px-3 py-1 font-bold">{out.vencedor.canal}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Outras variantes (teste!):</p>
            {out.variantes.slice(1).map((v, i) => (
              <div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{v.titulo}</p>
                  <p className="text-xs text-slate-500 mt-1">{v.formula} • {v.canal}</p>
                </div>
                <span className="shrink-0 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-2.5 py-1 text-xs font-bold">{v.ctrEstimado}%</span>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 mb-2">Dicas da IA</p>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{out.dicas.map((d, i) => <li key={i}>• {d}</li>)}</ul>
          </div>
        </div>
      )}>
      <Field label="Nome do produto"><input className={inputClass} value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="Ex: Método REI dos Reels" /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={(e)=>setNicho(e.target.value)} placeholder="Ex: marketing digital" /></Field>
      <Field label="Público-alvo"><input className={inputClass} value={publico} onChange={(e)=>setPublico(e.target.value)} placeholder="Ex: afiliados iniciantes" /></Field>
      <Field label="Principal benefício"><input className={inputClass} value={beneficio} onChange={(e)=>setBeneficio(e.target.value)} placeholder="Ex: vender no orgânico sem aparecer" /></Field>
      <Field label="Dor principal (opcional)"><textarea className={textareaClass} value={dor} onChange={(e)=>setDor(e.target.value)} placeholder="Ex: não consegue vender nada e fica horas gravando..." /></Field>
    </AgentShell>
  )
}
