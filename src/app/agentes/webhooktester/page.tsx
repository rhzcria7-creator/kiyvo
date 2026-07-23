'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Webhook } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"evento":"compra_aprovada","produto":"","valor":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/webhooktester", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"WebhookTester"} tagline={"Gera payloads de teste e comando curl para webhooks"} icone={<Webhook className="w-7 h-7" />} cor={"bg-gradient-to-br from-slate-600 to-slate-800"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="flex gap-2"><span className="px-2 py-1 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-black">{result.method}</span><span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">{result.evento}</span></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Payload</div><pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs overflow-auto">{JSON.stringify(result.body, null, 2)}</pre></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Curl de teste</div><pre className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs overflow-auto whitespace-pre-wrap">{result.curl}</pre></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Boas práticas</div><ul className="space-y-1 text-sm">{result.dicas.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Evento"}><select className={selectClass} value={form.evento as string} onChange={e => setForm({...form, evento: e.target.value})}><option value={"compra_aprovada"}>compra_aprovada</option><option value={"compra_recusada"}>compra_recusada</option><option value={"reembolso"}>reembolso</option><option value={"pix_gerado"}>pix_gerado</option><option value={"pix_pago"}>pix_pago</option><option value={"cupom_usado"}>cupom_usado</option><option value={"novo_lead"}>novo_lead</option><option value={"review_novo"}>review_novo</option></select></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e => setForm({...form, produto: e.target.value})} placeholder={"Produto Teste"} /></Field>
      <Field label={"Valor (R$)"}><input type="number" className={inputClass} value={form.valor as string} onChange={e => setForm({...form, valor: e.target.value})} placeholder={"97"} /></Field>
    </AgentShell>
  )
}
