'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"titulo":"","descricao":"","preco":"","imagens":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/contentauditor", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"ContentAuditor"} tagline={"Auditor LGPD/CDC/SEO em produtos e páginas — detecta promessas ilegais"} icone={<ShieldCheck className="w-7 h-7" />} cor={"bg-gradient-to-br from-slate-700 to-slate-900"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl text-white ${result.aprovado?'bg-gradient-to-br from-emerald-500 to-green-600':'bg-gradient-to-br from-red-500 to-rose-600'}`}><div className="text-xs font-black uppercase tracking-widest opacity-80">Auditoria</div><div className="text-4xl font-black mt-1">{result.pontuacaoGeral}/100</div><div className="text-sm mt-1">{result.aprovado?'✅ APROVADO para publicação':'🚫 Precisa corrigir antes de publicar'}</div></div>
          {result.problemas.length > 0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">Problemas ({result.problemas.length})</div><div className="space-y-2">{result.problemas.map((p: any, i: number) => <div key={i} className={`p-3 rounded-xl text-sm border ${p.severidade==='critico'?'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300':p.severidade==='alta'?'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300':'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'}`}><span className="text-[10px] font-black uppercase mr-2">{p.severidade}</span>{p.mensagem}</div>)}</div></div>}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">LGPD Checklist</div><div className="space-y-1">{result.checklistLGPD.map((c: any, i: number) => <div key={i} className="flex items-center gap-2 text-sm">{c.ok ? <span className="text-emerald-600">✅</span> : <span className="text-red-500">⚠️</span>}<span className={c.ok?'':'text-slate-500'}>{c.item}</span></div>)}</div></div>
        </div>
      )}>
      <Field label={"Título"}><input className={inputClass} value={form.titulo as string} onChange={e => setForm({...form, titulo: e.target.value})} placeholder={"Curso de Marketing Digital"} /></Field>
      <Field label={"Descrição"}><textarea className={textareaClass} value={form.descricao as string} onChange={e => setForm({...form, descricao: e.target.value})} placeholder={"Descrição completa..."} /></Field>
      <Field label={"Preço (R$)"}><input type="number" className={inputClass} value={form.preco as string} onChange={e => setForm({...form, preco: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Qtd imagens"}><input type="number" className={inputClass} value={form.imagens as string} onChange={e => setForm({...form, imagens: e.target.value})} placeholder={"3"} /></Field>
    </AgentShell>
  )
}
