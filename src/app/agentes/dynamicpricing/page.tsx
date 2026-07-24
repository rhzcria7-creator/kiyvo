'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"precoBase":"","custo":"","estoque":"","views":"","vendas":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/dynamicpricing", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"DynamicPricing"} tagline={"Preço dinâmico inteligente baseado em oferta, demanda e horário"} icone={<LineChart className="w-7 h-7" />} cor={"bg-gradient-to-br from-blue-500 to-indigo-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">Preço Sugerido</div><div className="text-2xl font-black text-blue-700 dark:text-blue-200">R$ {result.precoPsicologico.toFixed(2)}</div></div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Margem</div><div className="text-2xl font-black text-emerald-700 dark:text-emerald-200">{result.margemLiquida}%</div></div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">Faixa</div><div className="text-sm font-bold text-amber-700 dark:text-amber-200">R$ {result.precoMinimo.toFixed(2)} - R$ {result.precoMaximo.toFixed(2)}</div></div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Estratégia</div><p className="font-bold text-sm">{result.estrategia}</p><ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">{result.razoes.map((r: string, i: number) => <li key={i}>• {r}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Preço base (R$)"}><input type="number" className={inputClass} value={form.precoBase as string} onChange={e => setForm({...form, precoBase: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Custo (opcional)"}><input type="number" className={inputClass} value={form.custo as string} onChange={e => setForm({...form, custo: e.target.value})} placeholder={"20"} /></Field>
      <Field label={"Estoque"}><input type="number" className={inputClass} value={form.estoque as string} onChange={e => setForm({...form, estoque: e.target.value})} placeholder={"50"} /></Field>
      <Field label={"Views últimos 7 dias"}><input type="number" className={inputClass} value={form.views as string} onChange={e => setForm({...form, views: e.target.value})} placeholder={"300"} /></Field>
      <Field label={"Vendas últimos 7 dias"}><input type="number" className={inputClass} value={form.vendas as string} onChange={e => setForm({...form, vendas: e.target.value})} placeholder={"12"} /></Field>
    </AgentShell>
  )
}
