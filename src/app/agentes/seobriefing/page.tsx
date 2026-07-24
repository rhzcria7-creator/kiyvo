'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"palavraChave":"","nicho":"","tipo":"blog"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/seobriefing", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"SEOBriefing"} tagline={"Briefing completo de SEO com headings, FAQs, schema e tamanho ideal"} icone={<Search className="w-7 h-7" />} cor={"bg-gradient-to-br from-green-500 to-emerald-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white"><div className="text-[10px] font-black uppercase tracking-widest opacity-80">Título SEO ({result.tituloSEO.length}/60)</div><div className="text-lg font-black mt-1">{result.tituloSEO}</div><div className="mt-3 text-[10px] font-black uppercase tracking-widest opacity-80">Meta description ({result.metaDescription.length}/160)</div><p className="text-sm opacity-95">{result.metaDescription}</p><div className="mt-2 text-xs opacity-80">🔗 {result.urlSugerida}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Estrutura (headings)</div><div className="space-y-1">{result.estruturaConteudo.map((e: any, i: number) => <div key={i} className="text-sm"><div className="font-bold">H2. {e.h2}</div>{e.h3 && <div className="ml-4 text-slate-500 text-xs">{e.h3.map((h: string, j: number) => <div key={j}>↳ H3. {h}</div>)}</div>}</div>)}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Palavras relacionadas</div><div className="flex flex-wrap gap-1">{result.palavrasChaveRelacionadas.map((k: string, i: number) => <span key={i} className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">{k}</span>)}</div></div>
          <div className="grid grid-cols-2 gap-2 text-center"><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Palavras</div><div className="text-xl font-black">{result.tamanhoIdealPalavras}</div></div><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Leitura</div><div className="text-xl font-black">{result.duracaoLeituraMin}min</div></div></div>
        </div>
      )}>
      <Field label={"Palavra-chave principal"}><input className={inputClass} value={form.palavraChave as string} onChange={e => setForm({...form, palavraChave: e.target.value})} placeholder={"como ganhar dinheiro online"} /></Field>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing"} /></Field>
      <Field label={"Tipo de página"}><select className={selectClass} value={form.tipo as string} onChange={e => setForm({...form, tipo: e.target.value})}><option value={"blog"}>blog</option><option value={"pagina_produto"}>pagina_produto</option><option value={"landing"}>landing</option><option value={"categoria"}>categoria</option></select></Field>
    </AgentShell>
  )
}
