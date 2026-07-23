'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"visitou":"true","addCart":"false","checkout":"false","comprou":"false","valor":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/retargetpredictor", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"RetargetPredictor"} tagline={"Qual lead precisa de retargeting, canal ideal e oferta perfeita"} icone={<Target className="w-7 h-7" />} cor={"bg-gradient-to-br from-cyan-500 to-blue-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl text-white ${result.deveRetarget?'bg-gradient-to-br from-red-600 to-orange-500':'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">Retargeting</div>
            <div className="text-3xl font-black uppercase mt-1">{result.deveRetarget ? 'ATIVAR' : 'NÃO ATIVAR'}</div>
            <div className="text-sm mt-1 opacity-90">Prioridade: {result.prioridade}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Melhor canal</div><div className="text-lg font-black uppercase">{result.melhorCanal}</div></div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">Timing</div><div className="text-lg font-black">em {result.timingHoras}h</div></div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20"><div className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300 mb-1">Oferta</div><div className="text-sm font-bold">{result.oferta.tipo} — {result.oferta.texto}</div><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">"{result.mensagem}"</p></div>
        </div>
      )}>
      <Field label={"Visitou o produto?"}><select className={selectClass} value={form.visitou as string} onChange={e => setForm({...form, visitou: e.target.value})}><option value={"true"}>true</option><option value={"false"}>false</option></select></Field>
      <Field label={"Adicionou no carrinho?"}><select className={selectClass} value={form.addCart as string} onChange={e => setForm({...form, addCart: e.target.value})}><option value={"false"}>false</option><option value={"true"}>true</option></select></Field>
      <Field label={"Iniciou checkout?"}><select className={selectClass} value={form.checkout as string} onChange={e => setForm({...form, checkout: e.target.value})}><option value={"false"}>false</option><option value={"true"}>true</option></select></Field>
      <Field label={"Comprou?"}><select className={selectClass} value={form.comprou as string} onChange={e => setForm({...form, comprou: e.target.value})}><option value={"false"}>false</option><option value={"true"}>true</option></select></Field>
      <Field label={"Valor carrinho (R$)"}><input type="number" className={inputClass} value={form.valor as string} onChange={e => setForm({...form, valor: e.target.value})} placeholder={"97"} /></Field>
    </AgentShell>
  )
}
