'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"dor":"","publico":"","solucao":"","produto":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/problemaagitacao", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({dor: form.dor===''?undefined:form.dor,publico: form.publico===''?undefined:form.publico,solucao: form.solucao===''?undefined:form.solucao,produto: form.produto===''?undefined:form.produto}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"PAS Copy"} tagline={"Copy com fórmula Problema-Agitação-Solução"} icone={<Flame className="w-7 h-7"/>} cor={"bg-gradient-to-br from-red-500 to-orange-500"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white"><div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Headline</div><h3 className="text-xl font-black">{result.headline}</h3></div><div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Hook</h4><p className="text-sm">{result.hook}</p></div><div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Corpo</h4><p className="text-sm whitespace-pre-line">{result.corpo}</p></div><div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Bullets</h4><ul className="space-y-1 text-sm">{result.bullets.map((b:string,i:number)=><li key={i}>{b}</li>)}</ul></div><div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold">👉 {result.cta}</div></div>)}>
      <Field label={"Dor principal"}><input className={inputClass} value={form.dor as string} onChange={e=>setForm({...form,dor:e.target.value})} placeholder={"não consegue vender"}/></Field>
      <Field label={"Público"}><input className={inputClass} value={form.publico as string} onChange={e=>setForm({...form,publico:e.target.value})} placeholder={"iniciantes"}/></Field>
      <Field label={"Solução"}><input className={inputClass} value={form.solucao as string} onChange={e=>setForm({...form,solucao:e.target.value})} placeholder={"meu método"}/></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={""}/></Field>
    </AgentShell>
  )
}
