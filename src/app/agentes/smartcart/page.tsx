'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"totalAtual":"","itensJSON":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/smartcart", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"SmartCart"} tagline={"Carrinho inteligente com upsell, cross-sell e descontos automáticos"} icone={<ShoppingCart className="w-7 h-7" />} cor={"bg-gradient-to-br from-emerald-500 to-teal-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Subtotal</div><div className="text-lg font-black">R$ {result.subtotal.toFixed(2)}</div></div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-300">Desc. KD</div><div className="text-lg font-black text-emerald-700 dark:text-emerald-300">-R$ {result.descontoKD.toFixed(2)}</div></div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">Combo</div><div className="text-lg font-black text-amber-700 dark:text-amber-300">-R$ {result.descontoBundle.toFixed(2)}</div></div>
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20"><div className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-300">Final</div><div className="text-lg font-black text-brand-700 dark:text-brand-300">R$ {result.totalFinal.toFixed(2)}</div></div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300 text-sm font-bold">🎉 Você economizou R$ {result.economiaTotal.toFixed(2)}</div>
          {result.upsellRecomendados.length > 0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">⬆️ Upsell</div><div className="space-y-2">{result.upsellRecomendados.map((u: any, i: number) => <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center"><div><div className="text-sm font-bold">{u.titulo}</div><div className="text-xs text-slate-500">{u.razao}</div></div><div className="font-black text-brand-500">R$ {u.preco.toFixed(2)}</div></div>)}</div></div>}
        </div>
      )}>
      <Field label={"Total atual (R$)"}><input type="number" className={inputClass} value={form.totalAtual as string} onChange={e => setForm({...form, totalAtual: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Itens (JSON array)"}><textarea className={textareaClass} value={form.itensJSON as string} onChange={e => setForm({...form, itensJSON: e.target.value})} placeholder={"[{&quot;titulo&quot;:&quot;Curso X&quot;,&quot;preco&quot;:97,&quot;categoria&quot;:&quot;marketing&quot;}]"} /></Field>
    </AgentShell>
  )
}
