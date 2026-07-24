'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MousePointerClick } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

interface Variante { texto: string; primaria: boolean }
interface Result { variantes: Variante[]; corPrimaria: { bg: string; texto: string }; dicas: string[] }
export default function Page() {
  const [acao, setAcao] = useState('Começar')
  const [tom, setTom] = useState('direto')
  const [produto, setProduto] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/ctamaker', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ acao, tom, produto }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="CTAMaker" tagline="Gera botões de call-to-action persuasivos em 5 tons diferentes" icone={<MousePointerClick className="w-7 h-7" />} cor="bg-gradient-to-br from-amber-500 to-orange-600" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="space-y-2">
            {result.variantes.map((v,i)=>(
              <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                className={`flex items-center justify-between p-4 rounded-2xl ${v.primaria?'bg-[#0F172A] text-white shadow-lg':'bg-slate-50 dark:bg-[#0B0F1A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                <button className={`font-black ${v.primaria?'text-base':'text-sm'}`}>{v.texto}</button>
                <span className={`text-[10px] font-black uppercase tracking-widest ${v.primaria?'text-emerald-400':'text-slate-400'}`}>{v.primaria?'PRIMÁRIA':'secundária'}</span>
              </motion.div>
            ))}
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas</div><ul className="space-y-1 text-sm">{result.dicas.map((d,i)=><li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}>
      <Field label="Verbo de ação"><input className={inputClass} value={acao} onChange={e=>setAcao(e.target.value)} placeholder="Começar, Comprar, Ver, Baixar..."/></Field>
      <Field label="Tom"><select className={selectClass} value={tom} onChange={e=>setTom(e.target.value)}><option value="direto">Direto</option><option value="curioso">Curioso</option><option value="beneficio">Benefício</option><option value="urgencia">Urgência</option><option value="humilde">Humilde</option></select></Field>
      <Field label="Produto (opcional)"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Curso Completo"/></Field>
    </AgentShell>
  )
}
