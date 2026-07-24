'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Timer, Copy, CheckCircle2 } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'

interface Result { dias: number; horas: number; minutos: number; segundos: number; tailwindExemplo: string; htmlBasico: string; frases: string[] }
export default function Page() {
  const hoje = new Date(); hoje.setDate(hoje.getDate()+3)
  const [dataAlvo, setDataAlvo] = useState(hoje.toISOString().slice(0,16))
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState('')
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/contadorregressivo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dataAlvo: new Date(dataAlvo).toISOString() }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  const copiar = async (txt: string, id: string) => { await navigator.clipboard.writeText(txt); setCopied(id); setTimeout(()=>setCopied(''),1500) }
  return (
    <AgentShell titulo="ContadorRegressivo" tagline="Contadores regressivos prontos em HTML/Tailwind para ofertas e lançamentos" icone={<Timer className="w-7 h-7" />} cor="bg-gradient-to-br from-red-500 to-orange-500" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white text-center">
            <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Tempo restante</div>
            <div className="flex items-center justify-center gap-4 font-black">
              <div><div className="text-4xl">{result.dias}</div><div className="text-xs opacity-80">dias</div></div>
              <div className="text-2xl">:</div>
              <div><div className="text-4xl">{String(result.horas).padStart(2,'0')}</div><div className="text-xs opacity-80">h</div></div>
              <div className="text-2xl">:</div>
              <div><div className="text-4xl">{String(result.minutos).padStart(2,'0')}</div><div className="text-xs opacity-80">min</div></div>
              <div className="text-2xl">:</div>
              <div><div className="text-4xl">{String(result.segundos).padStart(2,'0')}</div><div className="text-xs opacity-80">s</div></div>
            </div>
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Exemplo Tailwind</div>
            <div className="relative"><pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs overflow-auto whitespace-pre-wrap">{result.tailwindExemplo}</pre>
              <button onClick={()=>copiar(result.tailwindExemplo,'tw')} className="absolute top-2 right-2 p-1.5 rounded bg-white/10 text-white">{copied==='tw'?<CheckCircle2 className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</button>
            </div>
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Frases de urgência</div>
            <div className="space-y-1">{result.frases.map((f,i)=><div key={i} className="p-2 px-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-sm font-bold">{f}</div>)}</div>
          </div>
        </div>
      )}>
      <Field label="Data alvo"><input type="datetime-local" className={inputClass} value={dataAlvo} onChange={e=>setDataAlvo(e.target.value)}/></Field>
    </AgentShell>
  )
}
