'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircleWarning } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"texto":"","nota":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/feedbackinterpreter", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({texto: form.texto===''?undefined:form.texto,nota: form.nota===''?undefined:Number(form.nota)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"FeedbackInterpreter"} tagline={"Interpreta feedbacks, detecta sentimento e prioridade"} icone={<MessageCircleWarning className="w-7 h-7"/>} cor={"bg-gradient-to-br from-orange-500 to-red-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className={`p-4 rounded-2xl ${result.sentimento==='positivo'?'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300':result.sentimento==='negativo'?'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300':'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'}`}><div className="text-[10px] font-black uppercase tracking-widest">{result.sentimento} · prioridade {result.prioridade}</div><div className="flex gap-1 mt-1 flex-wrap">{result.categorias.map((c:any,i:number)=><span key={i} className="px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-black uppercase">{c}</span>)}</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Resposta automática</div><p className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm">{result.respostaAutomatica}</p></div></div>)}>
      <Field label={"Texto feedback"}><textarea className={textareaClass} value={form.texto as string} onChange={e=>setForm({...form,texto:e.target.value})} placeholder={""}/></Field>
      <Field label={"Nota (1-5)"}><input type="number" className={inputClass} value={form.nota as string} onChange={e=>setForm({...form,nota:e.target.value})} placeholder={"5"}/></Field>
    </AgentShell>
  )
}
