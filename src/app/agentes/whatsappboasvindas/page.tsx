'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"nome":"","nicho":"","produto":"","tom":"amigavel"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/whatsappboasvindas", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome: form.nome===''?undefined:form.nome,nicho: form.nicho===''?undefined:form.nicho,produto: form.produto===''?undefined:form.produto,tom: form.tom===''?undefined:form.tom}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"WhatsAppBoasVindas"} tagline={"Fluxo automático de boas-vindas para WhatsApp/IG"} icone={<MessageCircle className="w-7 h-7"/>} cor={"bg-gradient-to-br from-green-500 to-emerald-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-3 bg-[#e5ddd5] dark:bg-[#0b141a] p-4 rounded-2xl"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Fluxo de boas-vindas</div>{result.sequencia.map((m:any,i:number)=><motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[90%] shadow-sm"><div>{m.mensagem}</div><div className="text-right text-[10px] text-slate-400 mt-1">{m.delay}</div></motion.div>)}</div>)}>
      <Field label={"Nome lead"}><input className={inputClass} value={form.nome as string} onChange={e=>setForm({...form,nome:e.target.value})} placeholder={"Maria"}/></Field>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e=>setForm({...form,nicho:e.target.value})} placeholder={"marketing"}/></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={""}/></Field>
      <Field label={"Tom"}><select className={selectClass} value={form.tom as string} onChange={e=>setForm({...form,tom:e.target.value})}><option value={"amigavel"}>amigavel</option><option value={"profissional"}>profissional</option><option value={"descontraido"}>descontraido</option></select></Field>
    </AgentShell>
  )
}
