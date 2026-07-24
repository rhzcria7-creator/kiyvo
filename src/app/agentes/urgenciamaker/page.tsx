'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"tipo":"tempo","estoque":"","vagas":"","bonus":"","promocaoAte":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/urgenciamaker", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"UrgenciaMaker"} tagline={"Linhas honestas de urgência e escassez (estoque, timer, vagas)"} icone={<Flame className="w-7 h-7" />} cor={"bg-gradient-to-br from-red-500 to-orange-500"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">🔥 Urgência</div><div className="text-2xl font-black mt-1">{result.principal}</div><p className="text-sm mt-2 opacity-90">{result.secundaria}</p></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Variações</div><div className="space-y-2">{result.linhas.map((l: string, i: number) => <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] text-sm font-bold">{l}</div>)}</div></div>
          <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">⚠️ {result.honestidade[0]}</div>
        </div>
      )}>
      <Field label={"Tipo"}><select className={selectClass} value={form.tipo as string} onChange={e => setForm({...form, tipo: e.target.value})}><option value={"tempo"}>tempo</option><option value={"estoque"}>estoque</option><option value={"vagas"}>vagas</option><option value={"bonus"}>bonus</option></select></Field>
      <Field label={"Estoque atual"}><input type="number" className={inputClass} value={form.estoque as string} onChange={e => setForm({...form, estoque: e.target.value})} placeholder={"5"} /></Field>
      <Field label={"Vagas"}><input type="number" className={inputClass} value={form.vagas as string} onChange={e => setForm({...form, vagas: e.target.value})} placeholder={"20"} /></Field>
      <Field label={"Bônus exclusivo"}><input className={inputClass} value={form.bonus as string} onChange={e => setForm({...form, bonus: e.target.value})} placeholder={"Mentoria 1:1"} /></Field>
      <Field label={"Promoção até (data ISO)"}><input className={inputClass} value={form.promocaoAte as string} onChange={e => setForm({...form, promocaoAte: e.target.value})} placeholder={"2026-07-22"} /></Field>
    </AgentShell>
  )
}
