'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Type } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"nicho":"","produto":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/headlineanalyzer", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nicho: form.nicho===''?undefined:form.nicho,produto: form.produto===''?undefined:form.produto}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"HeadlineAnalyzer"} tagline={"10 fórmulas clássicas de headlines que vendem"} icone={<Type className="w-7 h-7"/>} cor={"bg-gradient-to-br from-red-500 to-rose-600"} onGerar={gerar} loading={loading}
      output={result && (<div><h3 className="font-black text-sm mb-3">Títulos ({result.titulos.length})</h3><div className="space-y-2">{result.titulos.map((t:any,i:number)=><motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] text-sm font-bold">{t}</motion.div>)}</div></div>)}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e=>setForm({...form,nicho:e.target.value})} placeholder={"marketing"}/></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={"Curso X"}/></Field>
    </AgentShell>
  )
}
