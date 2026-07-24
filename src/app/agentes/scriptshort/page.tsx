'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"nicho":"","topico":"","duracao":"15s","tom":"curioso"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/scriptshort", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"ScriptShort"} tagline={"Roteiros prontos para TikTok / Reels / Shorts em 15s, 30s ou 60s"} icone={<Video className="w-7 h-7" />} cor={"bg-gradient-to-br from-fuchsia-500 to-purple-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">{result.duracao} · {result.titulo}</div><p className="mt-2 font-bold">{result.hook}</p></div>
          <div className="space-y-3">{result.cenas.map((c: any, i: number) => <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A] border-l-4 border-fuchsia-500"><div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-1"><span>{c.tempo}</span></div><p className="text-sm font-medium">{c.falas}</p>{c.textoTela && <div className="mt-2 text-xs font-black uppercase bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 rounded-lg px-2 py-1 inline-block">{c.textoTela}</div>}<div className="text-xs text-slate-500 mt-2">🎬 {c.visual}</div></motion.div>)}</div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300 mb-1">CTA final</div><p className="text-sm font-bold">{result.callToAction}</p><div className="mt-2 flex flex-wrap gap-1">{result.hashtags.map((h: string, i: number) => <span key={i} className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-semibold">{h}</span>)}</div></div>
        </div>
      )}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing digital"} /></Field>
      <Field label={"Tópico específico"}><input className={inputClass} value={form.topico as string} onChange={e => setForm({...form, topico: e.target.value})} placeholder={"vender no instagram"} /></Field>
      <Field label={"Duração"}><select className={selectClass} value={form.duracao as string} onChange={e => setForm({...form, duracao: e.target.value})}><option value={"15s"}>15s</option><option value={"30s"}>30s</option><option value={"60s"}>60s</option></select></Field>
      <Field label={"Tom"}><select className={selectClass} value={form.tom as string} onChange={e => setForm({...form, tom: e.target.value})}><option value={"curioso"}>curioso</option><option value={"iniciante"}>iniciante</option><option value={"urgente"}>urgente</option><option value={"divertido"}>divertido</option><option value={"autoridade"}>autoridade</option></select></Field>
    </AgentShell>
  )
}
