'use client'

import { useState } from 'react'
import { BarChart4 } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'

interface Result { npsScore: number; classificacao: string; totalRespostas: number; pctPromotores: number; pctNeutros: number; pctDetratores: number; acoes: string[]; alertas: string[]; comoMelhorar: string[] }
export default function Page() {
  const [promotores, setPromotores] = useState('')
  const [neutros, setNeutros] = useState('')
  const [detratores, setDetratores] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/npsanalyzer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ promotores: Number(promotores||0), neutros: Number(neutros||0), detratores: Number(detratores||0) }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  const corNPS = result && result.npsScore>=50?'from-emerald-500 to-green-600':result && result.npsScore>=0?'from-amber-500 to-orange-500':'from-red-500 to-rose-600'
  return (
    <AgentShell titulo="NPSAnalyzer" tagline="Calcula NPS (Net Promoter Score) e diz exatamente o que fazer com promotores, neutros e detratores" icone={<BarChart4 className="w-7 h-7" />} cor="bg-gradient-to-br from-emerald-500 to-teal-600" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl bg-gradient-to-br ${corNPS} text-white text-center`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">NPS Score</div>
            <div className="text-6xl font-black my-2">{result.npsScore}</div>
            <div className="text-sm font-bold uppercase tracking-wider opacity-90">{result.classificacao.replace('_',' ')}</div>
          </div>
          <div className="flex gap-2 h-6 rounded-full overflow-hidden">
            <div className="bg-emerald-500 text-white text-xs flex items-center justify-center font-black" style={{width:result.pctPromotores+'%'}}>{result.pctPromotores}%</div>
            <div className="bg-amber-500 text-white text-xs flex items-center justify-center font-black" style={{width:result.pctNeutros+'%'}}>{result.pctNeutros}%</div>
            <div className="bg-red-500 text-white text-xs flex items-center justify-center font-black" style={{width:result.pctDetratores+'%'}}>{result.pctDetratores}%</div>
          </div>
          <div className="grid grid-cols-3 text-center text-xs">
            <div className="text-emerald-600 font-black">Promotores (9-10)</div>
            <div className="text-amber-600 font-black">Neutros (7-8)</div>
            <div className="text-red-600 font-black">Detratores (0-6)</div>
          </div>
          {result.alertas.length>0 && <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">{result.alertas.map((a,i)=><div key={i} className="text-sm text-red-700 dark:text-red-300">🚨 {a}</div>)}</div>}
          {result.acoes.length>0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Ações prioritárias</div><ul className="space-y-1 text-sm">{result.acoes.map((a,i)=><li key={i}>→ {a}</li>)}</ul></div>}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Como melhorar</div><ul className="space-y-1 text-sm">{result.comoMelhorar.map((a,i)=><li key={i}>• {a}</li>)}</ul></div>
        </div>
      )}>
      <Field label="Promotores (notas 9-10)"><input type="number" className={inputClass} value={promotores} onChange={e=>setPromotores(e.target.value)} placeholder="30"/></Field>
      <Field label="Neutros (notas 7-8)"><input type="number" className={inputClass} value={neutros} onChange={e=>setNeutros(e.target.value)} placeholder="10"/></Field>
      <Field label="Detratores (notas 0-6)"><input type="number" className={inputClass} value={detratores} onChange={e=>setDetratores(e.target.value)} placeholder="5"/></Field>
    </AgentShell>
  )
}
