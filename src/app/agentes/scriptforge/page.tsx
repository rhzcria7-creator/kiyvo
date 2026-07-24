'use client'
import { useState } from 'react'
import { Video } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
import type { ScriptForgeOutput } from '@/lib/agents/scriptforge'

export default function Page() {
  const [produto, setProduto] = useState('')
  const [nicho, setNicho] = useState('marketing digital')
  const [dur, setDur] = useState<'15'|'30'|'60'|'90'>('30')
  const [tom, setTom] = useState('influencer')
  const [formato, setFormato] = useState('reels')
  const [objetivo, setObjetivo] = useState('vender')
  const [preco, setPreco] = useState('')
  const [publico, setPublico] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<ScriptForgeOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/scriptforge', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, nicho, duracao: Number(dur), tom, formato, objetivo, preco: preco ? Number(preco) : undefined, publico }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="ScriptForge" tagline="Roteiros prontos para Reels/TikTok/Shorts com hook, CTA e hashtag"
      icone={<Video className="w-7 h-7" />} cor="bg-gradient-to-br from-pink-500 to-rose-600" labelBotao="Gerar roteiro"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Título</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{out.titulo}</h3>
            </div>
            <div className="flex gap-2">
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full px-3 py-1 text-xs font-bold">{out.duracaoSeg}s</span>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-3 py-1 text-xs font-bold">🔥 {out.scoreViral}/100 viral</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">🎬 Hook de 3s (não pode falhar!)</p>
            <p className="text-lg font-black mt-1">{out.hook}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Cenas:</p>
            {out.cenas.map((c, i) => (
              <div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3 border-l-4 border-pink-500">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-pink-600 tracking-widest">{c.segundo}</p>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{c.texto}</p>
                <p className="text-xs text-slate-500 mt-1">🎥 {c.visual}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">CTA final</p>
            <p className="text-sm font-bold mt-1">{out.cta}</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hashtags</p>
            <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">{out.hashtags.join(' ')}</p>
          </div>
          <details className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-sm">
            <summary className="font-bold text-indigo-700 dark:text-indigo-400 cursor-pointer">🎵 Legenda completa + dicas de gravação</summary>
            <pre className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 mt-3 font-sans">{out.legendaCompleta}</pre>
            <p className="text-xs font-bold mt-3 text-indigo-700 dark:text-indigo-400">Música sugerida:</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">{out.musicaSugerida}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-300">{out.dicasGravacao.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </details>
        </div>
      )}>
      <Field label="Produto"><input className={inputClass} value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="Ex: Curso de Reels" /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={(e)=>setNicho(e.target.value)} /></Field>
      <Field label="Público"><input className={inputClass} value={publico} onChange={(e)=>setPublico(e.target.value)} placeholder="Ex: afiliados iniciantes" /></Field>
      <Field label="Preço (opcional)"><input className={inputClass} type="number" value={preco} onChange={(e)=>setPreco(e.target.value)} placeholder="R$" /></Field>
      <Field label="Duração"><select className={selectClass} value={dur} onChange={(e)=>setDur(e.target.value as any)}>
        <option value="15">15 segundos</option><option value="30">30 segundos</option><option value="60">60 segundos</option><option value="90">90 segundos</option>
      </select></Field>
      <Field label="Tom"><select className={selectClass} value={tom} onChange={(e)=>setTom(e.target.value)}>
        <option value="influencer">Influencer</option><option value="amigo">Amigo</option><option value="ceo">CEO / Especialista</option><option value="urgente">Urgente</option><option value="tutorial">Tutorial</option>
      </select></Field>
      <Field label="Formato"><select className={selectClass} value={formato} onChange={(e)=>setFormato(e.target.value)}>
        <option value="reels">Reels Instagram</option><option value="tiktok">TikTok</option><option value="shorts">YouTube Shorts</option><option value="vsl">VSL</option><option value="stories">Stories</option>
      </select></Field>
      <Field label="Objetivo"><select className={selectClass} value={objetivo} onChange={(e)=>setObjetivo(e.target.value)}>
        <option value="vender">Vender</option><option value="engajar">Engajar</option><option value="leads">Gerar leads/DM</option><option value="audiencia">Crescer audiência</option>
      </select></Field>
    </AgentShell>
  )
}
