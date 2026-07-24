'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"texto":"","tom":"amigavel"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/voiceclonepreview", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"VoicePrep"} tagline={"Prepara roteiros para narração em áudio/voz (tom, pausas, velocidade)"} icone={<Mic className="w-7 h-7" />} cor={"bg-gradient-to-br from-teal-500 to-emerald-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20"><div className="flex justify-between items-center"><div><div className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-300">Tom recomendado</div><div className="text-sm font-bold mt-1">{result.tomRecomendado}</div></div><div className="text-right"><div className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-300">Velocidade</div><div className="text-2xl font-black">{result.velocidade}x</div></div><div className="text-right"><div className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-300">Duração</div><div className="text-2xl font-black">{result.duracaoEstimadaSec}s</div></div></div></div>
          <div className="space-y-1">{result.segmentos.map((s: any, i: number) => s.tipo==='fala'||s.tipo==='enfase' ? <div key={i} className={`p-2 px-3 rounded-lg text-sm ${s.tipo==='enfase'?'bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 font-black':''}`}>{s.conteudo}</div> : <div key={i} className="text-center text-xs text-slate-400">— pausa {s.duracaoMs}ms —</div>)}</div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas de locução</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.dicasLocucao.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Roteiro para narrar"}><textarea className={textareaClass} value={form.texto as string} onChange={e => setForm({...form, texto: e.target.value})} placeholder={"Cole aqui o texto..."} /></Field>
      <Field label={"Tom de voz"}><select className={selectClass} value={form.tom as string} onChange={e => setForm({...form, tom: e.target.value})}><option value={"amigavel"}>amigavel</option><option value={"autoridade"}>autoridade</option><option value={"urgente"}>urgente</option><option value={"calmo"}>calmo</option><option value={"vendedor"}>vendedor</option></select></Field>
    </AgentShell>
  )
}
