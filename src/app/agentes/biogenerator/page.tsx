'use client'
import { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [nome, setNome] = useState('')
  const [nicho, setNicho] = useState('')
  const [publico, setPublico] = useState('')
  const [tom, setTom] = useState('criador')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/biogenerator', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nome, nicho, publico, tom, link }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="BioGenerator" tagline="Bios otimizadas para Instagram, TikTok, YouTube, LinkedIn e X"
      icone={<UserCircle className="w-7 h-7" />} cor="bg-gradient-to-br from-fuchsia-500 to-pink-600" labelBotao="Gerar bios"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-3">
          {Object.entries(out.plataformas).map(([plataforma, v]:any)=>(
            <div key={plataforma} className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-black">{plataforma}</p>
                <button onClick={()=>navigator.clipboard?.writeText(v.bio)} className="text-xs font-bold text-brand-600">Copiar</button>
              </div>
              <pre className="whitespace-pre-wrap text-sm font-sans bg-slate-50 dark:bg-[#111] p-3 rounded-lg">{v.bio}</pre>
              <p className="text-[10px] text-slate-500 mt-2">{v.dicas.join(' • ')}</p>
            </div>
          ))}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 mb-2">Sugestões de username</p>
            <div className="flex flex-wrap gap-1.5">{out.usernameSugestoes.map((u:string,i:number)=><span key={i} className="bg-white dark:bg-[#0B0F1A] rounded-full px-2.5 py-1 text-xs font-bold">@{u}</span>)}</div>
          </div>
        </div>
      )}>
      <Field label="Seu nome/nome de marca"><input className={inputClass} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: Maria Silva" /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital" /></Field>
      <Field label="Público (opcional)"><input className={inputClass} value={publico} onChange={e=>setPublico(e.target.value)} placeholder="Ex: afiliados iniciantes" /></Field>
      <Field label="Estilo/tom"><select className={selectClass} value={tom} onChange={e=>setTom(e.target.value)}>
        <option value="criador">Criador de conteúdo</option><option value="influencer">Influencer</option><option value="profissional">Profissional</option><option value="ceo">CEO/Especialista</option><option value="descontraido">Descontraído</option><option value="luxo">Luxo/Premium</option>
      </select></Field>
      <Field label="Link (opcional)"><input className={inputClass} value={link} onChange={e=>setLink(e.target.value)} placeholder="linktr.ee/..." /></Field>
    </AgentShell>
  )
}
