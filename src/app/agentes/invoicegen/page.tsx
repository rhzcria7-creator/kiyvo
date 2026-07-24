'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"clienteNome":"","produto":"","preco":"","pagamento":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/invoicegen", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({clienteNome: form.clienteNome===''?undefined:form.clienteNome,produto: form.produto===''?undefined:form.produto,preco: form.preco===''?undefined:Number(form.preco),pagamento: form.pagamento===''?undefined:form.pagamento}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"InvoiceGen"} tagline={"Recibos/NF em HTML prontos para imprimir"} icone={<Receipt className="w-7 h-7"/>} cor={"bg-gradient-to-br from-slate-600 to-slate-900"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-3"><iframe className="w-full h-[500px] rounded-2xl border" srcDoc={result.html}/><div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Totais</div><div className="flex justify-between py-1 text-sm"><span>Subtotal</span><span>R$ {result.subtotal.toFixed(2).replace('.',',')}</span></div>{result.desconto>0&&<div className="flex justify-between py-1 text-sm text-red-500"><span>Desconto</span><span>- R$ {result.desconto.toFixed(2).replace('.',',')}</span></div>}<div className="flex justify-between py-2 font-black border-t">TOTAL R$ {result.total.toFixed(2).replace('.',',')}</div></div></div>)}>
      <Field label={"Nome cliente"}><input className={inputClass} value={form.clienteNome as string} onChange={e=>setForm({...form,clienteNome:e.target.value})} placeholder={""}/></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e=>setForm({...form,produto:e.target.value})} placeholder={"Curso"}/></Field>
      <Field label={"Valor (R$)"}><input type="number" className={inputClass} value={form.preco as string} onChange={e=>setForm({...form,preco:e.target.value})} placeholder={"97"}/></Field>
      <Field label={"Pagamento"}><input className={inputClass} value={form.pagamento as string} onChange={e=>setForm({...form,pagamento:e.target.value})} placeholder={"PIX"}/></Field>
    </AgentShell>
  )
}
