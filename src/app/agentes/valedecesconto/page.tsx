'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"tema":"","desconto":"","tipo":"boasvindas"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/valedecesconto", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tema: form.tema===''?undefined:form.tema,desconto: form.desconto===''?undefined:Number(form.desconto),tipo: form.tipo===''?undefined:form.tipo}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"ValeDesconto"} tagline={"Gera códigos de cupom criativos por tipo"} icone={<Ticket className="w-7 h-7"/>} cor={"bg-gradient-to-br from-pink-500 to-rose-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className="p-6 rounded-2xl border-4 border-dashed border-pink-500 text-center bg-pink-50 dark:bg-pink-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300 mb-2">Cupom</div><div className="text-4xl font-black font-mono text-pink-700 dark:text-pink-300 tracking-widest">{result.codigo}</div><div className="text-xs text-pink-600 dark:text-pink-300 mt-2">{result.descricao} · Válido {result.validade}</div></div><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Alternativos</div><div className="flex gap-2 flex-wrap">{result.alternativos.map((a:string,i:number)=><code key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-mono">{a}</code>)}</div></div></div>)}>
      <Field label={"Tema"}><input className={inputClass} value={form.tema as string} onChange={e=>setForm({...form,tema:e.target.value})} placeholder={"KIYVO"}/></Field>
      <Field label={"Desconto (%)"}><input type="number" className={inputClass} value={form.desconto as string} onChange={e=>setForm({...form,desconto:e.target.value})} placeholder={"10"}/></Field>
      <Field label={"Tipo"}><select className={selectClass} value={form.tipo as string} onChange={e=>setForm({...form,tipo:e.target.value})}><option value={"boasvindas"}>boasvindas</option><option value={"lancamento"}>lancamento</option><option value={"parceiro"}>parceiro</option><option value={"recuperacao"}>recuperacao</option><option value={"aniversario"}>aniversario</option><option value={"blackfriday"}>blackfriday</option></select></Field>
    </AgentShell>
  )
}
