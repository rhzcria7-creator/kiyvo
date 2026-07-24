'use client'
import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [categoria, setCategoria] = useState('')
  const [preco, setPreco] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/seooptimizer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ titulo, descricao: desc, categoria, preco: preco?Number(preco):undefined }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="SEOOptimizer" tagline="Meta tags, slug, JSON-LD e OG tags prontas em 1 clique"
      icone={<SearchIcon className="w-7 h-7" />} cor="bg-gradient-to-br from-emerald-500 to-green-600" labelBotao="Otimizar SEO"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-4 text-white ${out.scoreSEO>=80?'bg-emerald-500':out.scoreSEO>=50?'bg-amber-500':'bg-red-500'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Score SEO</p>
            <p className="text-4xl font-black">{out.scoreSEO}/100</p>
          </div>
          <div className="space-y-2 text-sm">
            <Field label="Meta Title ({length})"><div className="text-xs font-mono bg-slate-50 dark:bg-[#0B0F1A] p-2 rounded-lg text-blue-600">{out.metaTitle}</div></Field>
            <Field label="Meta Description"><div className="text-xs font-mono bg-slate-50 dark:bg-[#0B0F1A] p-2 rounded-lg text-slate-700 dark:text-slate-300">{out.metaDescription}</div></Field>
            <Field label="Slug sugerido"><code className="text-xs bg-slate-50 dark:bg-[#0B0F1A] p-2 rounded-lg block text-brand-600">{out.slug}</code></Field>
            <Field label="Canonical"><code className="text-xs bg-slate-50 dark:bg-[#0B0F1A] p-2 rounded-lg block">{out.canonicalSugestao}</code></Field>
          </div>
          <div className="flex flex-wrap gap-1.5">{out.palavrasChave.map((k:string,i:number)=><span key={i} className="text-[10px] font-bold bg-brand-50 text-brand-700 rounded-full px-2 py-1">{k}</span>)}</div>
          <details className="bg-slate-900 text-white rounded-xl p-4"><summary className="font-bold text-sm cursor-pointer">JSON-LD (copiar para &lt;head&gt;)</summary><pre className="whitespace-pre-wrap mt-2 text-xs font-mono overflow-x-auto">{JSON.stringify(out.jsonLd, null, 2)}</pre></details>
          {out.correcoes.length>0 && <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs"><p className="font-black text-amber-700 dark:text-amber-400 mb-1">Correções recomendadas</p><ul className="space-y-1">{out.correcoes.map((c:string,i:number)=><li key={i}>• {c}</li>)}</ul></div>}
        </div>
      )}>
      <Field label="Título do produto/página"><input className={inputClass} value={titulo} onChange={e=>setTitulo(e.target.value)} /></Field>
      <Field label="Descrição (atual)"><textarea className={inputClass+' min-h-[100px]'} value={desc} onChange={e=>setDesc(e.target.value)} /></Field>
      <Field label="Categoria"><input className={inputClass} value={categoria} onChange={e=>setCategoria(e.target.value)} placeholder="Ex: cursos" /></Field>
      <Field label="Preço (opcional)"><input className={inputClass} type="number" value={preco} onChange={e=>setPreco(e.target.value)} /></Field>
    </AgentShell>
  )
}
