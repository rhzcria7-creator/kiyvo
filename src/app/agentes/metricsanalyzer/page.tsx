'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"visitas":"","cart":"","checkout":"","compras":"","receita":"","reembolsos":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/metricsanalyzer", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"MetricsAnalyzer"} tagline={"Diagnóstico completo de métricas com ações prioritárias"} icone={<BarChart3 className="w-7 h-7" />} cor={"bg-gradient-to-br from-indigo-500 to-purple-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20"><div className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-300">Conversão</div><div className="text-xl font-black text-brand-700 dark:text-brand-300">{result.taxaConversao}%</div></div>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20"><div className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-300">Add cart</div><div className="text-xl font-black text-sky-700 dark:text-sky-300">{result.taxaCart}%</div></div>
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><div className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-300">Checkout</div><div className="text-xl font-black text-violet-700 dark:text-violet-300">{result.taxaCheckout}%</div></div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">AOV</div><div className="text-xl font-black text-amber-700 dark:text-amber-300">R$ {result.aov.toFixed(2)}</div></div>
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Diagnóstico</div><div className="space-y-2">{result.diagnostico.map((d: any, i: number) => <div key={i} className={`p-3 rounded-xl text-sm border ${d.severidade==='critica'?'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300':d.severidade==='atencao'?'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300':'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'}`}><div className="font-black uppercase text-[10px] mb-0.5">{d.metrica} · {d.valor}</div>{d.recomendacao}</div>)}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-brand-500 mb-2">🎯 Ações prioritárias</div><ol className="space-y-1 text-sm list-decimal list-inside">{result.acoesPrioritarias.map((a: string, i: number) => <li key={i}>{a}</li>)}</ol></div>
        </div>
      )}>
      <Field label={"Visitas"}><input type="number" className={inputClass} value={form.visitas as string} onChange={e => setForm({...form, visitas: e.target.value})} placeholder={"1000"} /></Field>
      <Field label={"Add ao carrinho"}><input type="number" className={inputClass} value={form.cart as string} onChange={e => setForm({...form, cart: e.target.value})} placeholder={"80"} /></Field>
      <Field label={"Checkouts iniciados"}><input type="number" className={inputClass} value={form.checkout as string} onChange={e => setForm({...form, checkout: e.target.value})} placeholder={"40"} /></Field>
      <Field label={"Compras"}><input type="number" className={inputClass} value={form.compras as string} onChange={e => setForm({...form, compras: e.target.value})} placeholder={"15"} /></Field>
      <Field label={"Receita (R$)"}><input type="number" className={inputClass} value={form.receita as string} onChange={e => setForm({...form, receita: e.target.value})} placeholder={"1455"} /></Field>
      <Field label={"Reembolsos"}><input type="number" className={inputClass} value={form.reembolsos as string} onChange={e => setForm({...form, reembolsos: e.target.value})} placeholder={"1"} /></Field>
    </AgentShell>
  )
}
