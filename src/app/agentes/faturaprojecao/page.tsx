'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"visitas":"","tx":"","aov":"","cpa":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/faturaprojecao", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({visitas: form.visitas===''?undefined:Number(form.visitas),tx: form.tx===''?undefined:Number(form.tx),aov: form.aov===''?undefined:Number(form.aov),cpa: form.cpa===''?undefined:Number(form.cpa)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"FaturaProjeção"} tagline={"Projeção de faturamento e lucro com cenários"} icone={<BarChart3 className="w-7 h-7"/>} cor={"bg-gradient-to-br from-emerald-500 to-green-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className="grid grid-cols-3 gap-3"><div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A] text-center"><div className="text-[10px] font-black uppercase tracking-widest text-red-500">Pior cenário</div><div className="text-lg font-black">R$ {result.piorCenario.faturamento.toFixed(0)}</div></div><div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-center"><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Realista</div><div className="text-lg font-black text-emerald-700 dark:text-emerald-300">R$ {result.resumo.faturamento.toFixed(0)}</div></div><div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-center"><div className="text-[10px] font-black uppercase tracking-widest text-brand-600">Melhor</div><div className="text-lg font-black text-brand-700 dark:text-brand-300">R$ {result.melhorCenario.faturamento.toFixed(0)}</div></div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Ações prioritárias</div><ul className="space-y-1 text-sm">{result.acoes.map((a:string,i:number)=><li key={i}>→ {a}</li>)}</ul></div></div>)}>
      <Field label={"Visitantes/mês"}><input type="number" className={inputClass} value={form.visitas as string} onChange={e=>setForm({...form,visitas:e.target.value})} placeholder={"1000"}/></Field>
      <Field label={"Taxa conversão (0.02 = 2%)"}><input type="number" className={inputClass} value={form.tx as string} onChange={e=>setForm({...form,tx:e.target.value})} placeholder={"0.02"}/></Field>
      <Field label={"Ticket médio (R$)"}><input type="number" className={inputClass} value={form.aov as string} onChange={e=>setForm({...form,aov:e.target.value})} placeholder={"97"}/></Field>
      <Field label={"CPA (R$)"}><input type="number" className={inputClass} value={form.cpa as string} onChange={e=>setForm({...form,cpa:e.target.value})} placeholder={"2"}/></Field>
    </AgentShell>
  )
}
