'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"nicho":"","qtd":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/plrsearch", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nicho: form.nicho===''?undefined:form.nicho,qtd: form.qtd===''?undefined:Number(form.qtd)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"PLRSearch"} tagline={"Ideias de produtos PLR por nicho"} icone={<FileText className="w-7 h-7"/>} cor={"bg-gradient-to-br from-amber-500 to-orange-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-3"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold">💡 {result.aviso}</div><div className="space-y-2">{result.produtos.map((p:any,i:number)=><div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex justify-between items-center"><div><div className="text-sm font-bold">{p.titulo}</div><div className="text-xs text-slate-500">{p.formato} · {p.idioma}</div></div><div className="text-right"><div className="font-black text-amber-600">R$ {p.precoSugerido.toFixed(2)}</div><div className="text-xs text-slate-400">VP: R$ {p.valorPercebido.toFixed(0)}</div></div></div>)}</div></div>)}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e=>setForm({...form,nicho:e.target.value})} placeholder={""}/></Field>
      <Field label={"Quantidade"}><input type="number" className={inputClass} value={form.qtd as string} onChange={e=>setForm({...form,qtd:e.target.value})} placeholder={"10"}/></Field>
    </AgentShell>
  )
}
