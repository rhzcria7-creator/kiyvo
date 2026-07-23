'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserX } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"totalCompras":"","diasCompra":"","diasLogin":"","abandonos":"","plano":"free"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/churnpredictor", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"ChurnPredictor"} tagline={"Prediz risco de evasão de usuários e cria ações de retenção"} icone={<UserX className="w-7 h-7" />} cor={"bg-gradient-to-br from-orange-500 to-red-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl text-white ${result.risco==='critico'?'bg-gradient-to-br from-red-600 to-rose-600':result.risco==='alto'?'bg-gradient-to-br from-orange-500 to-red-500':result.risco==='medio'?'bg-gradient-to-br from-amber-500 to-orange-500':'bg-gradient-to-br from-emerald-500 to-green-600'}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">Risco de evasão</div>
            <div className="text-3xl font-black uppercase mt-1">{result.risco}</div>
            <div className="text-sm mt-1 opacity-90">Score: {result.score}/100</div>
            <p className="mt-3 text-sm">{result.mensagemKiya}</p>
          </div>
          {(result.ofertaKD || result.ofertaCupom) && <div className="flex gap-2">{result.ofertaCupom && <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-xs font-black">🎟️ Cupom {result.ofertaCupom}</span>}{result.ofertaKD ? <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-black">⭐ {result.ofertaKD} KD Points</span> : null}</div>}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Ações recomendadas</div><ul className="space-y-1 text-sm">{result.acoesRecomendadas.map((a: string, i: number) => <li key={i} className="flex gap-2"><span>→</span><span>{a}</span></li>)}</ul></div>
        </div>
      )}>
      <Field label={"Total de compras"}><input type="number" className={inputClass} value={form.totalCompras as string} onChange={e => setForm({...form, totalCompras: e.target.value})} placeholder={"3"} /></Field>
      <Field label={"Dias desde última compra"}><input type="number" className={inputClass} value={form.diasCompra as string} onChange={e => setForm({...form, diasCompra: e.target.value})} placeholder={"45"} /></Field>
      <Field label={"Dias desde último login"}><input type="number" className={inputClass} value={form.diasLogin as string} onChange={e => setForm({...form, diasLogin: e.target.value})} placeholder={"10"} /></Field>
      <Field label={"Abandonos de carrinho"}><input type="number" className={inputClass} value={form.abandonos as string} onChange={e => setForm({...form, abandonos: e.target.value})} placeholder={"2"} /></Field>
      <Field label={"Plano"}><select className={selectClass} value={form.plano as string} onChange={e => setForm({...form, plano: e.target.value})}><option value={"free"}>free</option><option value={"plus"}>plus</option><option value={"pro"}>pro</option><option value={"vendor_pro"}>vendor_pro</option></select></Field>
    </AgentShell>
  )
}
