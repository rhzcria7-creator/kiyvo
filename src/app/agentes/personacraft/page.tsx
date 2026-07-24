'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCircle } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"nicho":"","produto":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/personacraft", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"PersonaCraft"} tagline={"Cria personas completas e anti-personas com dores, desejos e objeções"} icone={<UserCircle className="w-7 h-7" />} cor={"bg-gradient-to-br from-fuchsia-500 to-pink-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-5">
          {result.personas.map((p: any, i: number) => <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="p-5 rounded-[2rem] bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 border border-fuchsia-200 dark:border-fuchsia-800"><div className="flex items-center gap-4 mb-3"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black">{p.nome.charAt(0)}</div><div><div className="text-xl font-black">{p.nome}</div><div className="text-sm text-slate-600 dark:text-slate-400">{p.idade} anos · {p.profissao} · {p.cidade}</div><div className="text-xs text-slate-500">Renda: {p.rendaMensal}</div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><div><div className="text-[10px] font-black uppercase text-red-500 mb-1">😣 Dores</div><ul className="space-y-1 text-slate-700 dark:text-slate-300">{p.dores.map((d: string, j: number) => <li key={j}>• {d}</li>)}</ul></div><div><div className="text-[10px] font-black uppercase text-emerald-600 mb-1">✨ Desejos</div><ul className="space-y-1 text-slate-700 dark:text-slate-300">{p.desejos.map((d: string, j: number) => <li key={j}>• {d}</li>)}</ul></div></div><blockquote className="mt-3 p-3 rounded-xl bg-white/60 dark:bg-black/20 italic text-sm border-l-4 border-fuchsia-500">"{p.fraseRepresentativa}"</blockquote><div className="mt-2 text-xs font-bold">🎁 Oferta ideal: <span className="text-fuchsia-700 dark:text-fuchsia-300">{p.ofertaIdeal}</span></div></motion.div>)}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">⛔ ANTI-PERSONA (NÃO é cliente)</div>{result.antiPersonas.slice(0,1).map((p: any, i: number) => <div key={i} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 text-sm"><b>{p.nome}</b> — {p.ofertaIdeal}</div>)}</div>
        </div>
      )}>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing digital"} /></Field>
      <Field label={"Produto"}><input className={inputClass} value={form.produto as string} onChange={e => setForm({...form, produto: e.target.value})} placeholder={"Curso Completo"} /></Field>
    </AgentShell>
  )
}
