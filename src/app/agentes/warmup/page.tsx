'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownToLine } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"dominio":"","dias":"","vol":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/warmup", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({dominio: form.dominio===''?undefined:form.dominio,dias: form.dias===''?undefined:Number(form.dias),vol: form.vol===''?undefined:Number(form.vol)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"WarmupPlan"} tagline={"Plano de aquecimento de domínio para email marketing"} icone={<ArrowDownToLine className="w-7 h-7"/>} cor={"bg-gradient-to-br from-teal-500 to-emerald-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-teal-600">Taxa de entrega esperada</div><div className="text-2xl font-black text-teal-700 dark:text-teal-300">{result.taxaEsperadaEntrega}%</div></div><div className="space-y-1">{result.plano.map((p:any,i:number)=><div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-[#0B0F1A] text-sm"><span className="font-mono text-xs text-slate-500 w-12">D{p.dia}</span><span className="flex-1">{p.lista}</span><span className="font-black text-teal-600">{p.enviar}/dia</span></div>)}</div></div>)}>
      <Field label={"Domínio"}><input className={inputClass} value={form.dominio as string} onChange={e=>setForm({...form,dominio:e.target.value})} placeholder={"seudominio.com"}/></Field>
      <Field label={"Dias"}><input type="number" className={inputClass} value={form.dias as string} onChange={e=>setForm({...form,dias:e.target.value})} placeholder={"14"}/></Field>
      <Field label={"Volume inicial/dia"}><input type="number" className={inputClass} value={form.vol as string} onChange={e=>setForm({...form,vol:e.target.value})} placeholder={"10"}/></Field>
    </AgentShell>
  )
}
