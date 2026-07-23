'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"produto":"","precoBase":"","valorPercebido":"","nicho":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/offerstacker", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
    if (k==='itensJSON') return ['itens', (() => { try { return JSON.parse(v as string || '[]'); } catch { return []; } })()];
    if (k==='concorrentesJSON') return ['concorrentes', (() => { try { return JSON.parse(v as string || '[]'); } catch { return []; } })()];
    if (['visitas','cart','checkout','compras','receita','reembolsos','preco','precoBase','custo','estoque','views','vendas','qtd','vendas','totalAtual','valor','dias','diasCompra','diasLogin','abandonos','imagens','seuPreco'].includes(k) && v !== '' ) return [k, Number(v)];
    if (['visitou','addCart','checkout','comprou','temCTA','temDepoimentos','temGarantia','temFAQ','temEscassez','temTermos','temPolitica'].includes(k)) return [k, v === 'true'];
    if (v === '' && ['precoBase','custo','estoque','views','vendas','valor','dias','diasCompra','diasLogin','abandonos','qtd','seuPreco','preco','totalAtual','visitas','cart','checkout','compras','receita','reembolsos','imagens','vagas'].includes(k)) return [k, undefined];
    return [k, v === '' ? undefined : v];
  }))}) })
      setResult(await r.json())
    } catch { setResult(null) } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"OfferStacker"} tagline={"Monta a stack completa de ofertas: lead magnet → front-end → bump → upsell → downsell"} icone={<Layers className="w-7 h-7" />} cor={"bg-gradient-to-br from-amber-500 to-orange-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">Ticket médio estimado</div><div className="text-2xl font-black text-amber-700 dark:text-amber-200">R$ {result.ticketMedioEstimado.toFixed(2)}</div></div><div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-300">LTV estimado</div><div className="text-2xl font-black text-emerald-700 dark:text-emerald-200">R$ {result.ltvEstimado.toFixed(2)}</div></div></div>
          <div className="space-y-2"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Stack de ofertas</div>{result.ofertas.map((o: any, i: number) => <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="flex justify-between items-start"><div><div className="text-[10px] font-black uppercase text-brand-500">{o.tipo}</div><div className="font-bold text-sm mt-0.5">{o.nome}</div><p className="text-xs text-slate-500 mt-1">{o.descricao}</p></div><div className="text-right"><div className="font-black text-lg">{o.preco===0?'GRÁTIS':'R$ '+o.preco.toFixed(2)}</div><div className="text-xs text-emerald-600">Valor: R$ {o.valor.toFixed(2)}</div></div></div></div>)}</div>
        </div>
      )}>
      <Field label={"Nome do produto"}><input className={inputClass} value={form.produto as string} onChange={e => setForm({...form, produto: e.target.value})} placeholder={"Curso de Marketing Digital"} /></Field>
      <Field label={"Preço base (R$)"}><input type="number" className={inputClass} value={form.precoBase as string} onChange={e => setForm({...form, precoBase: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Valor percebido (R$)"}><input type="number" className={inputClass} value={form.valorPercebido as string} onChange={e => setForm({...form, valorPercebido: e.target.value})} placeholder={"997"} /></Field>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing"} /></Field>
    </AgentShell>
  )
}
