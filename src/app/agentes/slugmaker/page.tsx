'use client'

import { useState } from 'react'
import { Link as IconLink, Copy, CheckCircle2 } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'

interface Result { slug: string; slugComId: string; url: string; alternativos: string[] }
export default function Page() {
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState('')
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/slugmaker', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ titulo, categoria }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  const copiar = async (txt: string, id: string) => { await navigator.clipboard.writeText(txt); setCopied(id); setTimeout(()=>setCopied(''),1500) }
  return (
    <AgentShell titulo="SlugMaker" tagline="Gera URLs/slugs otimizados para SEO (sem acentos, com ID curto e alternativas)" icone={<IconLink className="w-7 h-7" />} cor="bg-gradient-to-br from-cyan-500 to-blue-600" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-sm flex items-center gap-2">
            <span className="flex-1 break-all">{result.url}</span>
            <button onClick={()=>copiar(result.url,'url')} className="p-1.5 rounded bg-white/10">{copied==='url'?<CheckCircle2 className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</button>
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Slug puro</div><div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 font-mono text-sm flex items-center gap-2"><span className="flex-1 break-all">{result.slug}</span><button onClick={()=>copiar(result.slug,'s')} className="p-1.5 rounded bg-white/60 dark:bg-black/20">{copied==='s'?<CheckCircle2 className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</button></div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Slug com ID (recomendado)</div><div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 font-mono text-sm">{result.slugComId}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Alternativos</div><div className="space-y-1">{result.alternativos.map((a,i)=><div key={i} className="p-2 px-3 rounded-lg bg-slate-50 dark:bg-[#0B0F1A] text-sm font-mono">{a}</div>)}</div></div>
        </div>
      )}>
      <Field label="Título"><input className={inputClass} value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Como ganhar dinheiro na internet"/></Field>
      <Field label="Categoria (opcional)"><input className={inputClass} value={categoria} onChange={e=>setCategoria(e.target.value)} placeholder="marketing"/></Field>
    </AgentShell>
  )
}
