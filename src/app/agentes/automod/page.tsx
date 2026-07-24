'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"texto":"","contexto":"comentario"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/automod", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"AutoMod"} tagline={"Moderação automática de comentários, reviews e mensagens em tempo real"} icone={<Shield className="w-7 h-7" />} cor={"bg-gradient-to-br from-red-500 to-rose-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl ${result.aprovado ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <div className="text-2xl font-black ${result.aprovado ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}">
              {result.aprovado ? '✅ APROVADO' : '🚫 BLOQUEADO'}
            </div>
            <div className="text-sm mt-1 text-slate-600 dark:text-slate-400">Score de risco: {result.score}/100</div>
            {result.motivoBloqueio && <div className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">{result.motivoBloqueio}</div>}
          </div>
          {result.categorias.length > 0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Categorias detectadas</div><div className="flex flex-wrap gap-2">{result.categorias.map((c: string, i: number) => <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">{c}</span>)}</div></div>}
          {result.sugestao && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Sugestão limpa</div><div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] text-sm">{result.sugestao}</div></div>}
        </div>
      )}>
      <Field label={"Texto para analisar"}><textarea className={textareaClass} value={form.texto as string} onChange={e => setForm({...form, texto: e.target.value})} placeholder={"Digite ou cole o comentário/mensagem..."} /></Field>
      <Field label={"Contexto"}><select className={selectClass} value={form.contexto as string} onChange={e => setForm({...form, contexto: e.target.value})}><option value={"comentario"}>comentario</option><option value={"review"}>review</option><option value={"mensagem"}>mensagem</option><option value={"perfil"}>perfil</option><option value={"anuncio"}>anuncio</option></select></Field>
    </AgentShell>
  )
}
