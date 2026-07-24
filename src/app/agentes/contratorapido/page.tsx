'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollText } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"tipo":"freelance","contratante":"","contratado":"","valor":"","prazo":"","escopo":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/contratorapido", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tipo: form.tipo===''?undefined:form.tipo,contratante: form.contratante===''?undefined:form.contratante,contratado: form.contratado===''?undefined:form.contratado,valor: form.valor===''?undefined:Number(form.valor),prazo: form.prazo===''?undefined:form.prazo,escopo: form.escopo===''?undefined:form.escopo}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"ContratoRápido"} tagline={"Minutas básicas (freelance, afiliado, parceria, licença)"} icone={<ScrollText className="w-7 h-7"/>} cor={"bg-gradient-to-br from-slate-700 to-slate-900"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-3"><div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-bold">⚠️ {result.aviso}</div><div><div className="text-xl font-black mb-2">{result.titulo}</div></div><pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs whitespace-pre-wrap">{result.clausulas.join("\n\n")}</pre></div>)}>
      <Field label={"Tipo"}><select className={selectClass} value={form.tipo as string} onChange={e=>setForm({...form,tipo:e.target.value})}><option value={"prestacao"}>prestacao</option><option value={"afiliado"}>afiliado</option><option value={"parceria"}>parceria</option><option value={"licenca"}>licenca</option><option value={"freelance"}>freelance</option></select></Field>
      <Field label={"Contratante"}><input className={inputClass} value={form.contratante as string} onChange={e=>setForm({...form,contratante:e.target.value})} placeholder={""}/></Field>
      <Field label={"Contratado"}><input className={inputClass} value={form.contratado as string} onChange={e=>setForm({...form,contratado:e.target.value})} placeholder={""}/></Field>
      <Field label={"Valor (R$)"}><input type="number" className={inputClass} value={form.valor as string} onChange={e=>setForm({...form,valor:e.target.value})} placeholder={"1000"}/></Field>
      <Field label={"Prazo"}><input className={inputClass} value={form.prazo as string} onChange={e=>setForm({...form,prazo:e.target.value})} placeholder={"30 dias"}/></Field>
      <Field label={"Escopo"}><input className={inputClass} value={form.escopo as string} onChange={e=>setForm({...form,escopo:e.target.value})} placeholder={""}/></Field>
    </AgentShell>
  )
}
