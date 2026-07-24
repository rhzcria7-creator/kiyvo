'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { AgentShell, Field, inputClass, textareaClass } from '@/components/agents/AgentShell'
import type { DescFetcherOutput } from '@/lib/agents/descfetcher'

export default function Page() {
  const [desc, setDesc] = useState('')
  const [titulo, setTitulo] = useState('')
  const [precoC, setPrecoC] = useState('')
  const [seu, setSeu] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<DescFetcherOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/descfetcher', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricaoConcorrente: desc, tituloConcorrente: titulo, precoConcorrente: precoC ? Number(precoC) : undefined, seuProduto: seu || 'seu produto' }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="DescFetcher" tagline="Espia a descrição do concorrente e recebe uma versão 10x melhor"
      icone={<Search className="w-7 h-7" />} cor="bg-gradient-to-br from-slate-700 to-slate-900" labelBotao="Analisar & Melhorar"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">Score concorrente: {out.scoreConcorrente}/100</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">Preço sugerido: R$ {out.precoSugerido.toFixed(2).replace('.',',')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">✅ Pontos fortes</p>
              <ul className="mt-1 text-xs space-y-1 text-slate-700 dark:text-slate-300">{out.pontosFortes.map((p, i) => <li key={i}>• {p}</li>)}</ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-red-700 dark:text-red-400">❌ Pontos fracos (ataque!)</p>
              <ul className="mt-1 text-xs space-y-1 text-slate-700 dark:text-slate-300">{out.pontosFracos.length ? out.pontosFracos.map((p, i) => <li key={i}>• {p}</li>) : <li>• Nenhum ponto fraco óbvio</li>}</ul>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">🔑 Palavras-chave</p>
            <div className="flex flex-wrap gap-1.5 mt-1">{out.palavrasChave.map((w, i) => <span key={i} className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 px-2 py-1 rounded-full text-xs font-bold">#{w}</span>)}</div>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">📝 Sua descrição melhorada (copie!)</p>
            <pre className="whitespace-pre-wrap text-sm mt-2 font-sans">{out.descricaoMelhorada}</pre>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Títulos alternativos</p>
            <ul className="space-y-1 text-sm">{out.titulosAlternativos.map((t, i) => <li key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-lg px-3 py-2">{t}</li>)}</ul>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Bullets matadores</p>
            <ul className="space-y-1 text-sm">{out.bulletsMatadores.map((b, i) => <li key={i} className="text-slate-700 dark:text-slate-300">{b}</li>)}</ul>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs">
            <p className="font-black text-amber-700 dark:text-amber-400">⚠️ Objeções não respondidas pelo concorrente (responda VOCÊ):</p>
            <ul className="mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">{out.objecoesNaoRespondidas.map((o, i) => <li key={i}>• {o}</li>)}</ul>
          </div>
        </div>
      )}>
      <Field label="Descrição do concorrente"><textarea className={textareaClass} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Cole aqui a descrição completa do concorrente..." /></Field>
      <Field label="Título dele (opcional)"><input className={inputClass} value={titulo} onChange={(e)=>setTitulo(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço dele (opcional)"><input className={inputClass} type="number" value={precoC} onChange={(e)=>setPrecoC(e.target.value)} placeholder="R$" /></Field>
        <Field label="Seu produto"><input className={inputClass} value={seu} onChange={(e)=>setSeu(e.target.value)} /></Field>
      </div>
    </AgentShell>
  )
}
