'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"nicho":"","produto":"","preco":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/faqauto", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nicho: form.nicho===''?undefined:form.nicho,produto: form.produto===''?undefined:form.produto,preco: form.preco===''?undefined:Number(form.preco)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"FAQAuto"} tagline={"FAQ automática baseada em nicho e objeções"} icone={<HelpCircle className="w-7 h-7"/>} cor={"bg-gradient-to-br from-teal-500 to-cyan-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-2">{result.faq.map((f:any,i:number)=><details key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 group"><summary className="font-bold text-sm cursor-pointer list-none flex items-center justify-between">{f.pergunta}<span className="transition group-open:rotate-45 text-xl font-thin">+</span></summary><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.resposta}</p></details>)}</div>)}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e=>setForm({...form,nicho:e.target.value})} placeholder={""}/></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={""}/></Field>
      <Field label={"Preço (R$)"}><input type="number" className={inputClass} value={form.preco as string} onChange={e=>setForm({...form,preco:e.target.value})} placeholder={"97"}/></Field>
    </AgentShell>
  )
}
