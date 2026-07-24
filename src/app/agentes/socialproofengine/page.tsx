'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"produtoNome":"","produtoPreco":"","cenario":"produto"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/socialproofengine", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"SocialProofEngine"} tagline={"Mensagens de prova social automáticas (\"fulano comprou há 2 min\")"} icone={<Users className="w-7 h-7" />} cor={"bg-gradient-to-br from-pink-500 to-rose-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="space-y-2">{result.mensagens.slice(0,6).map((m: any, i: number) => <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}} className={`p-3 rounded-xl text-sm font-medium ${m.tipo==='compra'?'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800':m.tipo==='review'?'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800':'bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700'}`}>👤 {m.texto}</motion.div>)}</div>
          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800"><div className="text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-300 mb-1">🔒 Badge de confiança</div><p className="text-sm font-semibold">{result.badgeConfianca}</p><div className="flex gap-3 mt-2 text-xs text-slate-500"><span>🟢 {result.contagemVivas.online} online</span><span>🛒 {result.contagemVivas.comprandoAgora} comprando agora</span></div></div>
        </div>
      )}>
      <Field label={"Produto"}><input className={inputClass} value={form.produtoNome as string} onChange={e => setForm({...form, produtoNome: e.target.value})} placeholder={"Curso X"} /></Field>
      <Field label={"Preço (R$)"}><input type="number" className={inputClass} value={form.produtoPreco as string} onChange={e => setForm({...form, produtoPreco: e.target.value})} placeholder={"97"} /></Field>
      <Field label={"Cenário"}><select className={selectClass} value={form.cenario as string} onChange={e => setForm({...form, cenario: e.target.value})}><option value={"produto"}>produto</option><option value={"carrinho"}>carrinho</option><option value={"checkout"}>checkout</option><option value={"home"}>home</option></select></Field>
    </AgentShell>
  )
}
