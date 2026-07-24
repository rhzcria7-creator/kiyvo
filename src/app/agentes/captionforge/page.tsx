'use client'
import { useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [produto, setProduto] = useState('')
  const [nicho, setNicho] = useState('')
  const [tom, setTom] = useState('influencer')
  const [rede, setRede] = useState('instagram')
  const [preco, setPreco] = useState('')
  const [objetivo, setObjetivo] = useState('vender')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/captionforge', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ produto, nicho, tom, rede, objetivo, preco: preco?Number(preco):undefined }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="CaptionForge" tagline="Legendas prontas para Instagram/TikTok/LI com hook, emojis e CTA"
      icone={<MessageSquareText className="w-7 h-7" />} cor="bg-gradient-to-br from-orange-500 to-red-500" labelBotao="Gerar legenda"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5"><pre className="whitespace-pre-wrap font-sans text-sm">{out.legenda}</pre></div>
          <button onClick={()=>navigator.clipboard?.writeText(out.legenda)} className="bg-brand-600 text-white rounded-full px-4 py-2 text-xs font-bold">Copiar legenda</button>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3"><p className="font-black text-slate-600 dark:text-slate-400">Hook</p><p className="mt-1">{out.hook}</p></div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3"><p className="font-black text-slate-600 dark:text-slate-400">Caracteres</p><p className="mt-1">{out.caracteres} ({out.tamanho})</p></div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs"><ul className="space-y-1">{out.dicas.map((d:string,i:number)=><li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label="Produto/tema"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex: pack de templates Canva" /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} /></Field>
      <Field label="Tom"><select className={selectClass} value={tom} onChange={e=>setTom(e.target.value)}>
        <option value="influencer">Influencer</option><option value="amigo">Amigo</option><option value="ceo">CEO/Especialista</option><option value="minimalista">Minimalista</option><option value="viral">Viral</option><option value="tutorial">Tutorial</option>
      </select></Field>
      <Field label="Rede"><select className={selectClass} value={rede} onChange={e=>setRede(e.target.value)}>
        <option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="youtube">YouTube</option>
      </select></Field>
      <Field label="Objetivo"><select className={selectClass} value={objetivo} onChange={e=>setObjetivo(e.target.value)}>
        <option value="vender">Vender</option><option value="engajar">Engajar</option><option value="audiencia">Crescer audiência</option>
      </select></Field>
      <Field label="Preço (opcional)"><input className={inputClass} type="number" value={preco} onChange={e=>setPreco(e.target.value)} /></Field>
    </AgentShell>
  )
}
