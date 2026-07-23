'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Smile } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"texto":"","qtd":"","posicao":"bullet"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/emojipicker", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"EmojiPicker"} tagline={"Escolhe emojis relevantes para o seu texto e formata bullets"} icone={<Smile className="w-7 h-7" />} cor={"bg-gradient-to-br from-yellow-400 to-orange-500"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">{result.emojis.map((e: string, i: number) => <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.05}} className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-3xl">{e}</motion.div>)}</div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Texto formatado</div><pre className="whitespace-pre-wrap text-sm font-sans">{result.textoFormatado}</pre></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas</div><ul className="space-y-1 text-sm">{result.dicas.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Texto"}><textarea className={textareaClass} value={form.texto as string} onChange={e => setForm({...form, texto: e.target.value})} placeholder={"Checklist de lançamento para novos produtores"} /></Field>
      <Field label={"Qtd emojis"}><input type="number" className={inputClass} value={form.qtd as string} onChange={e => setForm({...form, qtd: e.target.value})} placeholder={"3"} /></Field>
      <Field label={"Posição"}><select className={selectClass} value={form.posicao as string} onChange={e => setForm({...form, posicao: e.target.value})}><option value={"bullet"}>bullet</option><option value={"inicio"}>inicio</option><option value={"final"}>final</option></select></Field>
    </AgentShell>
  )
}
