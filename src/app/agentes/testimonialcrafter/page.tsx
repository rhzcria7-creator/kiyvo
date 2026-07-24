'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookHeart } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"produto":"","qtd":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/testimonialcrafter", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({produto: form.produto===''?undefined:form.produto,qtd: form.qtd===''?undefined:Number(form.qtd)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"TestimonialCrafter"} tagline={"Exemplos de depoimentos para mock de layout (nunca usar em produção)"} icone={<BookHeart className="w-7 h-7"/>} cor={"bg-gradient-to-br from-rose-500 to-pink-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-3"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold">⚠️ {result.aviso}</div><div className="grid gap-3">{result.depoimentos.map((d:any,i:number)=><motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800"><div className="flex justify-between items-start mb-2"><div><div className="font-black text-sm">{d.nome}</div><div className="text-xs text-slate-500">{d.cidade} · {'⭐'.repeat(d.estrelas)}</div></div><div className="text-xs font-bold text-amber-600">{d.titulo}</div></div><p className="text-sm">{d.texto}</p></motion.div>)}</div></div>)}>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={""}/></Field>
      <Field label={"Quantidade"}><input type="number" className={inputClass} value={form.qtd as string} onChange={e=>setForm({...form,qtd:e.target.value})} placeholder={"5"}/></Field>
    </AgentShell>
  )
}
