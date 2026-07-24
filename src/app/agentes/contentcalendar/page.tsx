'use client'
import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [nicho, setNicho] = useState('')
  const [produto, setProduto] = useState('')
  const [qtd, setQtd] = useState('30')
  const [rede, setRede] = useState('geral')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/contentcalendar', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nicho, produto, qtd: Number(qtd), rede }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  const tipoCor: Record<string,string> = { reel:'bg-pink-100 text-pink-700', post:'bg-blue-100 text-blue-700', story:'bg-purple-100 text-purple-700', live:'bg-red-100 text-red-700', carrossel:'bg-amber-100 text-amber-700', tutorial:'bg-emerald-100 text-emerald-700' }
  return (
    <AgentShell titulo="ContentCalendar" tagline="Calendário editorial de 30 dias pronto para Instagram/TikTok/YouTube"
      icone={<Calendar className="w-7 h-7" />} cor="bg-gradient-to-br from-indigo-500 to-purple-600" labelBotao="Gerar calendário"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase text-indigo-700">Resumo do plano</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{out.analise}</p>
            <p className="text-sm font-bold mt-2">Frequência: {out.frequenciaRecomendada}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {out.melhoresFormatos.map((f:any,i:number)=><div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3"><p className="text-xs font-bold">{f.formato}</p><p className="text-lg font-black text-brand-600">{f.percentual}%</p></div>)}
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Plano diário</p>
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
            {out.dias.map((d:any,i:number)=>(
              <div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-2.5 flex items-start gap-2 text-sm">
                <span className="text-[10px] font-black text-slate-400 w-10 shrink-0">Dia {d.dia}</span>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${tipoCor[d.tipo]||'bg-slate-200'}`}>{d.tipo}</span>
                <span className="flex-1"><strong className="text-slate-900 dark:text-white">{d.emoji} {d.tema}</strong><br/><span className="text-xs text-slate-500">Hook: {d.hook}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital" /></Field>
      <Field label="Produto (opcional)"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} /></Field>
      <Field label="Quantidade de dias"><input className={inputClass} type="number" min="7" max="90" value={qtd} onChange={e=>setQtd(e.target.value)} /></Field>
      <Field label="Rede principal"><select className={selectClass} value={rede} onChange={e=>setRede(e.target.value)}>
        <option value="geral">Geral</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option>
      </select></Field>
    </AgentShell>
  )
}
