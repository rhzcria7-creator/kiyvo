'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"titulo":"","nicho":"","estilo":"youtube"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/thumbnailmaker", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"ThumbnailMaker"} tagline={"Gera thumbnails SVG prontos para YouTube/TikTok/Reels"} icone={<ImageIcon className="w-7 h-7" />} cor={"bg-gradient-to-br from-pink-500 to-rose-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700" dangerouslySetInnerHTML={{__html: result.svg}} />
          <div className="grid grid-cols-4 gap-2"><div className="aspect-square rounded-xl" style={{background:result.paleta.fundo}} /><div className="aspect-square rounded-xl" style={{background:result.paleta.primaria}} /><div className="aspect-square rounded-xl" style={{background:result.paleta.secundaria}} /><div className="aspect-square rounded-xl" style={{background:result.paleta.texto}} /></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas profissionais</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.dicas.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label={"Título do vídeo"}><input className={inputClass} value={form.titulo as string} onChange={e => setForm({...form, titulo: e.target.value})} placeholder={"Como ganhar dinheiro online em 2026"} /></Field>
      <Field label={"Nicho"}><input className={inputClass} value={form.nicho as string} onChange={e => setForm({...form, nicho: e.target.value})} placeholder={"marketing"} /></Field>
      <Field label={"Formato"}><select className={selectClass} value={form.estilo as string} onChange={e => setForm({...form, estilo: e.target.value})}><option value={"youtube"}>youtube</option><option value={"tiktok"}>tiktok</option><option value={"instagram_reels"}>instagram_reels</option><option value={"curso"}>curso</option><option value={"produto"}>produto</option></select></Field>
    </AgentShell>
  )
}
