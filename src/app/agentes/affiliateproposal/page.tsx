'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Handshake } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"produto":"","afiliado":"","preco":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/affiliateproposal", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({produto: form.produto===''?undefined:form.produto,afiliado: form.afiliado===''?undefined:form.afiliado,preco: form.preco===''?undefined:Number(form.preco)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"AffiliateProposal"} tagline={"DM + email de proposta de parceria com afiliados"} icone={<Handshake className="w-7 h-7"/>} cor={"bg-gradient-to-br from-violet-500 to-purple-700"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">DM curta</div><div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-sm whitespace-pre-line">{result.mensagemDM}</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Proposta completa</div><pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 text-xs overflow-auto whitespace-pre-wrap">{result.propostaCompleta}</pre></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Comissão</div><div className="text-3xl font-black text-violet-600">{result.comissaoSugerida}%</div></div></div>)}>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={""}/></Field>
      <Field label={"Afiliado"}><input className={inputClass} value={form.afiliado as string} onChange={e=>setForm({...form,afiliado:e.target.value})} placeholder={"Criador"}/></Field>
      <Field label={"Preço (R$)"}><input type="number" className={inputClass} value={form.preco as string} onChange={e=>setForm({...form,preco:e.target.value})} placeholder={"97"}/></Field>
    </AgentShell>
  )
}
