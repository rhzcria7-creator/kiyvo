'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileBadge } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"nome":"","codigo":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/referralbadge", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nome: form.nome===''?undefined:form.nome,codigo: form.codigo===''?undefined:form.codigo}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"ReferralBadge"} tagline={"Selo SVG \"Eu recomendo\" para afiliados"} icone={<FileBadge className="w-7 h-7"/>} cor={"bg-gradient-to-br from-blue-500 to-indigo-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className="bg-slate-900 rounded-2xl p-6 flex justify-center" dangerouslySetInnerHTML={{__html:result.svg}}/><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Código embed</div><pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs overflow-auto whitespace-pre-wrap break-all">{result.htmlEmbed}</pre></div></div>)}>
      <Field label={"Seu nome"}><input className={inputClass} value={form.nome as string} onChange={e=>setForm({...form,nome:e.target.value})} placeholder={"João"}/></Field>
      <Field label={"Código de indicação"}><input className={inputClass} value={form.codigo as string} onChange={e=>setForm({...form,codigo:e.target.value})} placeholder={"JOAO10"}/></Field>
    </AgentShell>
  )
}
