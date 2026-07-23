'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutTemplate } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"heroTitulo":"","heroSubtitulo":"","preco":"","temCTA":"true","temDepoimentos":"true","temGarantia":"true","temFAQ":"false","publico":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/landingchecker", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"LandingChecker"} tagline={"Audita sua landing page com nota A+ a E e mostra exatamente o que corrigir"} icone={<LayoutTemplate className="w-7 h-7" />} cor={"bg-gradient-to-br from-indigo-500 to-blue-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-5 rounded-2xl" style={{background:result.cor+'22', borderLeft:'6px solid '+result.cor}}><div className="text-5xl font-black" style={{color:result.cor}}>{result.nota}</div><div><div className="text-[10px] font-black uppercase tracking-widest" style={{color:result.cor}}>Nota da landing</div><div className="text-2xl font-black" style={{color:result.cor}}>{result.pontuacao}/100</div></div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">Pontos fracos</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.pontosFracos.map((f: string, i: number) => <li key={i}>⚠️ {f}</li>)}</ul></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Pontos fortes</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.pontosFortes.map((f: string, i: number) => <li key={i}>✅ {f}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Título hero"}><input className={inputClass} value={form.heroTitulo as string} onChange={e => setForm({...form, heroTitulo: e.target.value})} placeholder={"Aprenda marketing digital em 30 dias"} /></Field>
      <Field label={"Subtítulo hero"}><input className={inputClass} value={form.heroSubtitulo as string} onChange={e => setForm({...form, heroSubtitulo: e.target.value})} placeholder={"Mesmo que você seja iniciante..."} /></Field>
      <Field label={"Preço (R$)"}><input type="number" className={inputClass} value={form.preco as string} onChange={e => setForm({...form, preco: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Tem CTA acima da dobra?"}><select className={selectClass} value={form.temCTA as string} onChange={e => setForm({...form, temCTA: e.target.value})}><option value={"true"}>true</option><option value={"false"}>false</option></select></Field>
      <Field label={"Tem depoimentos?"}><select className={selectClass} value={form.temDepoimentos as string} onChange={e => setForm({...form, temDepoimentos: e.target.value})}><option value={"true"}>true</option><option value={"false"}>false</option></select></Field>
      <Field label={"Tem garantia?"}><select className={selectClass} value={form.temGarantia as string} onChange={e => setForm({...form, temGarantia: e.target.value})}><option value={"true"}>true</option><option value={"false"}>false</option></select></Field>
      <Field label={"Tem FAQ?"}><select className={selectClass} value={form.temFAQ as string} onChange={e => setForm({...form, temFAQ: e.target.value})}><option value={"false"}>false</option><option value={"true"}>true</option></select></Field>
      <Field label={"Público alvo"}><input className={inputClass} value={form.publico as string} onChange={e => setForm({...form, publico: e.target.value})} placeholder={"iniciantes em marketing"} /></Field>
    </AgentShell>
  )
}
