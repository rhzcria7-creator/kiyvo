'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ListChecks } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"tipo":"produto_novo","dias":"","nicho":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/launchchecklist", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"LaunchChecklist"} tagline={"Checklist COMPLETO de lançamento do D-14 ao D+7"} icone={<ListChecks className="w-7 h-7" />} cor={"bg-gradient-to-br from-blue-500 to-cyan-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">{result.titulo}</div><div className="flex gap-4 mt-2"><div><div className="text-2xl font-black">{result.totalTarefas}</div><div className="text-xs opacity-80">tarefas</div></div></div></div>
          <div className="space-y-2">{result.checklist.map((c: any, i: number) => <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${c.obrigatorio?'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900':'border-slate-200 bg-slate-50 dark:bg-slate-800/30 dark:border-slate-700'}`}><input type="checkbox" className="mt-1 w-4 h-4" /><div className="flex-1"><div className="font-bold text-sm flex items-center gap-2">{c.tarefa}{c.obrigatorio && <span className="text-[9px] font-black uppercase text-red-500">obrigatório</span>}{c.dia!=null && <span className="text-[10px] font-black uppercase text-slate-400">D{c.dia}</span>}</div><div className="text-xs text-slate-500 mt-0.5">💡 {c.dica}</div></div></div>)}</div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs"><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="font-black text-lg">{result.metricasAlvo.vendas}</div><div className="text-slate-500">vendas alvo</div></div><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="font-black text-lg">R$ {result.metricasAlvo.faturamento}</div><div className="text-slate-500">faturamento</div></div></div>
        </div>
      )}>
      <Field label={"Tipo de lançamento"}><select className={selectClass} value={form.tipo as string} onChange={e => setForm({...form, tipo: e.target.value})}><option value={"produto_novo"}>produto_novo</option><option value={"relancamento"}>relancamento</option><option value={"blackfriday"}>blackfriday</option><option value={"evergreen"}>evergreen</option></select></Field>
      <Field label={"Dias até o lançamento"}><input type="number" className={inputClass} value={form.dias as string} onChange={e => setForm({...form, dias: e.target.value})} placeholder={"14"} /></Field>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing"} /></Field>
    </AgentShell>
  )
}
