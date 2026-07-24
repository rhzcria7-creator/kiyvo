'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"valor":"","idadeEmail":"","falhas":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/riskscore", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({valor: form.valor===''?undefined:Number(form.valor),idadeEmail: form.idadeEmail===''?undefined:Number(form.idadeEmail),falhas: form.falhas===''?undefined:Number(form.falhas)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"RiskScore"} tagline={"Score de risco antifraude para pedidos"} icone={<ShieldAlert className="w-7 h-7"/>} cor={"bg-gradient-to-br from-red-600 to-rose-700"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className={`p-6 rounded-2xl text-white text-center ${result.decisao==='aprovar'?'bg-gradient-to-br from-emerald-500 to-green-600':result.decisao==='revisao'?'bg-gradient-to-br from-amber-500 to-orange-500':'bg-gradient-to-br from-red-500 to-rose-600'}`}><div className="text-xs font-black uppercase tracking-widest opacity-80">Decisão</div><div className="text-3xl font-black uppercase my-1">{result.decisao}</div><div className="text-sm opacity-90">Score: {result.score}/100</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Fatores</div><ul className="space-y-1 text-sm">{result.fatores.map((f:string,i:number)=><li key={i} className="text-amber-700 dark:text-amber-400">⚠️ {f}</li>)}{result.fatores.length===0 && <li className="text-emerald-600">✅ Sem sinais de risco</li>}</ul></div></div>)}>
      <Field label={"Valor (R$)"}><input type="number" className={inputClass} value={form.valor as string} onChange={e=>setForm({...form,valor:e.target.value})} placeholder={"297"}/></Field>
      <Field label={"Idade do email (dias)"}><input type="number" className={inputClass} value={form.idadeEmail as string} onChange={e=>setForm({...form,idadeEmail:e.target.value})} placeholder={"30"}/></Field>
      <Field label={"Tentativas falhas"}><input type="number" className={inputClass} value={form.falhas as string} onChange={e=>setForm({...form,falhas:e.target.value})} placeholder={"0"}/></Field>
    </AgentShell>
  )
}
