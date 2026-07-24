'use client'
import { useState } from 'react'
import { Hash } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [nicho, setNicho] = useState('')
  const [produto, setProduto] = useState('')
  const [rede, setRede] = useState<any>('instagram')
  const [qtd, setQtd] = useState('20')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/hashtagger', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nicho, produto, rede, qtd: Number(qtd) }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="Hashtagger" tagline="Hashtags otimizadas para Instagram, TikTok, YouTube — mistura grandes, médias e nichadas"
      icone={<Hash className="w-7 h-7" />} cor="bg-gradient-to-br from-blue-500 to-cyan-500" labelBotao="Gerar hashtags"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {out.hashtags.map((h:any,i:number) => (
              <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-bold ${h.tamanho==='grande'?'bg-red-100 text-red-700':h.tamanho==='media'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                {h.tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">🔴 grande · 🟠 média · 🟢 nichada</p>
          <details className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-4">
            <summary className="font-bold text-sm cursor-pointer">Legendas prontas para copiar</summary>
            <div className="mt-3 space-y-2">
              {out.legendas.map((l:string,i:number)=><pre key={i} className="whitespace-pre-wrap text-xs bg-white dark:bg-[#111] p-3 rounded-lg font-sans">{l}</pre>)}
            </div>
          </details>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3"><p className="font-black text-blue-700">Melhor horário</p><p className="mt-1 text-slate-700 dark:text-slate-300">{out.melhorHorario.join(' • ')}</p></div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3"><p className="font-black text-purple-700">Frequência</p><p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">{out.frequenciaPostagem}</p></div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs"><ul className="space-y-1">{out.dicas.map((d:string,i:number)=><li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital, fitness, beleza..." /></Field>
      <Field label="Produto/tema (opcional)"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} /></Field>
      <Field label="Rede social"><select className={selectClass} value={rede} onChange={e=>setRede(e.target.value)}>
        <option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="geral">Geral</option>
      </select></Field>
      <Field label="Quantidade de hashtags"><input className={inputClass} type="number" min="5" max="40" value={qtd} onChange={e=>setQtd(e.target.value)} /></Field>
    </AgentShell>
  )
}
