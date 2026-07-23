'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [input, setInput] = useState<any>({ produtoNome: undefined, estrelas: undefined, textoReview: undefined })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  async function gerar() {
    setLoading(true); setResult(null)
    try { const res = await fetch('/api/agents/reviewreply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}); setResult(await res.json()) } finally { setLoading(false) }
  }
  function copiar() { const t = typeof result?.data==='object'?JSON.stringify(result.data,null,2):String(result?.data||''); navigator.clipboard.writeText(t).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})}
  function rv(v: any, d=0): React.ReactNode {
    if (v==null) return <span className="text-slate-400">—</span>
    if (typeof v!=='object') return <span className="text-slate-800 dark:text-slate-100">{String(v)}</span>
    if (Array.isArray(v)) return <ul className={d===0?'space-y-3':'ml-4 space-y-1 mt-1'}>{v.map((it,i)=><li key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{typeof it==='object'?<div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">{Object.entries(it).map(([k,val])=><div key={k} className="flex gap-2 items-start mb-1"><span className="text-[11px] font-black uppercase tracking-wider text-brand-600 min-w-[90px] pt-0.5">{fmt(k)}</span><span className="flex-1">{rv(val,d+1)}</span></div>)}</div>:<span className="mr-1">•</span>}{typeof it==='object'?'':rv(it,d+1)}</li>)}</ul>
    return <div className={d===0?'space-y-3':'space-y-1 mt-1'}>{Object.entries(v).map(([k,val])=><div key={k} className={d===0?'bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800':'flex gap-2 items-start'}><div className={d===0?'text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2':'text-[11px] font-black uppercase tracking-wider text-slate-500 min-w-[90px] pt-0.5'}>{fmt(k)}</div><div className={d===0?'':'flex-1'}>{rv(val,d+1)}</div></div>)}</div>
  }
  return (<AgentShell titulo="Respondedor de Reviews" tagline="Responde 1-5 estrelas com tom certo" icone={<span className="text-2xl">⭐</span>} cor="from-amber-500 to-yellow-600" onGerar={gerar} loading={loading} labelBotao="Gerar com IA" output={result?.ok?(<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4"><div className="flex items-center justify-between"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">✅ Pronto</div><button onClick={copiar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold">{copied?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}{copied?'Copiado!':'Copiar'}</button></div>{rv(result.data)}</motion.div>):result?.error?(<div className="py-12 text-center"><p className="text-red-500 font-semibold text-sm">{result.error}</p></div>):null} ><Field label="Produto">
        <input type="text" value={input.produtoNome ?? ''} onChange={e => setInput({ ...input, produtoNome: e.target.valueAsNumber || e.target.value })} placeholder="" className={inputClass} />
      </Field>
      <Field label="Nota">
          <select value={input.estrelas ?? ''} onChange={e => setInput({ ...input, estrelas: e.target.value })} className={selectClass}>
            <option value="">Selecione...</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </Field>
      <Field label="Texto da review (opcional)">
        <input type="text" value={input.textoReview ?? ''} onChange={e => setInput({ ...input, textoReview: e.target.valueAsNumber || e.target.value })} placeholder="" className={inputClass} />
      </Field></AgentShell>)
}
function fmt(k:string){return k.replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\b\w/g,c=>c.toUpperCase())}
