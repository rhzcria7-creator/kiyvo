'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"nicho":"","produto":"","qtd":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/quizfunnel", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"QuizFunnel"} tagline={"Cria funis de quiz em minutos para segmentar leads e vender mais"} icone={<HelpCircle className="w-7 h-7" />} cor={"bg-gradient-to-br from-emerald-500 to-green-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">Quiz de {result.perguntas.length} perguntas</div><div className="text-xl font-black mt-1">{result.titulo}</div><p className="mt-2 text-sm opacity-90">{result.subtitulo}</p></div>
          <div className="space-y-2">{result.perguntas.map((p: any, i: number) => <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="font-bold text-sm mb-2">{i+1}. {p.pergunta}</div><div className="space-y-1">{p.opcoes.map((o: any, j: number) => <div key={j} className="text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">○ {o.texto}</div>)}</div></div>)}</div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300 mb-1">Taxa de conversão estimada</div><div className="text-3xl font-black text-amber-700 dark:text-amber-300">{result.taxasConversaoEstimada}%</div></div>
        </div>
      )}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing digital"} /></Field>
      <Field label={"Produto a recomendar"}><input className={inputClass} value={form.produto as string} onChange={e => setForm({...form, produto: e.target.value})} placeholder={"Curso Completo"} /></Field>
      <Field label={"Quantas perguntas"}><input type="number" className={inputClass} value={form.qtd as string} onChange={e => setForm({...form, qtd: e.target.value})} placeholder={"5"} /></Field>
    </AgentShell>
  )
}
