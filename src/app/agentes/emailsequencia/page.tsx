'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"produto":"","nicho":"","publico":"","preco":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/emailsequencia", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({produto: form.produto===''?undefined:form.produto,nicho: form.nicho===''?undefined:form.nicho,publico: form.publico===''?undefined:form.publico,preco: form.preco===''?undefined:Number(form.preco)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"EmailSequencia"} tagline={"Sequência completa de e-mails de 7 dias"} icone={<Mail className="w-7 h-7"/>} cor={"bg-gradient-to-br from-cyan-500 to-blue-600"} onGerar={gerar} loading={loading}
      output={result && (<div><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">Sequência de {result.sequencia.length} emails</h3><div className="space-y-3">{result.sequencia.map((e:any,i:number)=><div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700"><div className="flex justify-between items-baseline mb-2"><span className="text-[10px] font-black uppercase tracking-widest text-brand-500">Dia {e.dia}</span><span className="text-sm font-bold">{e.assunto}</span></div><p className="text-sm whitespace-pre-line text-slate-600 dark:text-slate-300">{e.corpo}</p></div>)}</div></div>)}>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={""}/></Field>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e=>setForm({...form,nicho:e.target.value})} placeholder={"marketing"}/></Field>
      <Field label={"Público"}><input className={inputClass} value={form.publico as string} onChange={e=>setForm({...form,publico:e.target.value})} placeholder={"amigo"}/></Field>
      <Field label={"Preço (R$)"}><input type="number" className={inputClass} value={form.preco as string} onChange={e=>setForm({...form,preco:e.target.value})} placeholder={"97"}/></Field>
    </AgentShell>
  )
}
