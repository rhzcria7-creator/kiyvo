'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareText } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>({"nota":"1","comentario":"","nome":"","tom":"amigavel"})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/reviewreplier", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...Object.fromEntries(Object.entries(form).map(([k,v]) => {
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
    <AgentShell titulo={"ReviewReplier"} tagline={"Respostas prontas e personalizadas para avaliações (1★ a 5★)"} icone={<MessageSquareText className="w-7 h-7" />} cor={"bg-gradient-to-br from-sky-500 to-blue-600"} onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800"><div className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-300 mb-2">Resposta sugerida ({result.nota}★)</div><p className="text-sm font-medium">{result.resposta}</p></div>
          {result.pedirParaAtualizar && <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><div className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300 mb-2">Reavaliação</div><p className="text-sm">{result.pedirParaAtualizar}</p></div>}
        </div>
      )}>
      <Field label={"Nota recebida"}><select className={selectClass} value={form.nota as string} onChange={e => setForm({...form, nota: e.target.value})}><option value={"1"}>1</option><option value={"2"}>2</option><option value={"3"}>3</option><option value={"4"}>4</option><option value={"5"}>5</option></select></Field>
      <Field label={"Comentário do cliente"}><textarea className={textareaClass} value={form.comentario as string} onChange={e => setForm({...form, comentario: e.target.value})} placeholder={"O cliente escreveu..."} /></Field>
      <Field label={"Nome do cliente"}><input className={inputClass} value={form.nome as string} onChange={e => setForm({...form, nome: e.target.value})} placeholder={"Maria Silva"} /></Field>
      <Field label={"Tom"}><select className={selectClass} value={form.tom as string} onChange={e => setForm({...form, tom: e.target.value})}><option value={"amigavel"}>amigavel</option><option value={"profissional"}>profissional</option><option value={"formal"}>formal</option><option value={"carismático"}>carismático</option></select></Field>
    </AgentShell>
  )
}
