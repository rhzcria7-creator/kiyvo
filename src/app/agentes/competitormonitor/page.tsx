'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radar } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"seuProduto":"","seuPreco":"","concorrentesJSON":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/competitormonitor", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"CompetitorMonitor"} tagline={"Analisa concorrentes e mostra gaps de oportunidade e ameaças"} icone={<Radar className="w-7 h-7" />} cor={"bg-gradient-to-br from-violet-500 to-purple-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">Posição no mercado</div><div className="text-2xl font-black text-violet-700 dark:text-violet-300 uppercase">{result.posicaoMercado.replace('_',' ')}</div><div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs"><div><div className="font-black">R$ {result.precoMin.toFixed(2)}</div><div className="text-slate-500">Mínimo</div></div><div><div className="font-black">R$ {result.precoMedio.toFixed(2)}</div><div className="text-slate-500">Média</div></div><div><div className="font-black">R$ {result.precoMax.toFixed(2)}</div><div className="text-slate-500">Máximo</div></div></div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Comparação</div><div className="space-y-2">{result.comparacao.map((c: any, i: number) => <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] flex justify-between items-center"><div><div className="font-bold text-sm">{c.concorrente}</div><div className="text-xs text-slate-500">{c.observacao}</div></div><div className={`font-black ${c.diferencaPct<0?'text-emerald-600':'text-red-500'}`}>{c.diferencaPct>0?'+':''}{c.diferencaPct}%</div></div>)}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Oportunidades</div><ul className="space-y-1 text-sm">{result.gapOportunidade.map((g: string, i: number) => <li key={i}>🎯 {g}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Seu produto"}><input className={inputClass} value={form.seuProduto as string} onChange={e => setForm({...form, seuProduto: e.target.value})} placeholder={"Curso de Marketing"} /></Field>
      <Field label={"Seu preço (R$)"}><input type="number" className={inputClass} value={form.seuPreco as string} onChange={e => setForm({...form, seuPreco: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Concorrentes (JSON)"}><textarea className={textareaClass} value={form.concorrentesJSON as string} onChange={e => setForm({...form, concorrentesJSON: e.target.value})} placeholder={"[{&quot;nome&quot;:&quot;Hotmart X&quot;,&quot;preco&quot;:197,&quot;nota&quot;:4.5}]"} /></Field>
    </AgentShell>
  )
}
