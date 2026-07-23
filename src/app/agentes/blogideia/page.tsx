'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"nicho":"","qtd":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/blogideia", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nicho: form.nicho===''?undefined:form.nicho,qtd: form.qtd===''?undefined:Number(form.qtd)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"BlogIdeia"} tagline={"15 ideias de posts para blog com ângulos e palavras-chave"} icone={<Newspaper className="w-7 h-7"/>} cor={"bg-gradient-to-br from-indigo-500 to-violet-600"} onGerar={gerar} loading={loading}
      output={result && (<div><h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">{result.posts.length} ideias de posts</h3><div className="space-y-2">{result.posts.map((p:any,i:number)=><motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20"><div className="font-bold text-sm">{i+1}. {p.titulo}</div><div className="text-xs text-slate-500 mt-1">Ângulo: {p.angulo} · Leitura: {p.duracaoLeitura}min</div></motion.div>)}</div></div>)}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e=>setForm({...form,nicho:e.target.value})} placeholder={""}/></Field>
      <Field label={"Quantidade"}><input type="number" className={inputClass} value={form.qtd as string} onChange={e=>setForm({...form,qtd:e.target.value})} placeholder={"15"}/></Field>
    </AgentShell>
  )
}
