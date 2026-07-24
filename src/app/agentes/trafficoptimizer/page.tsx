'use client'
import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [orcamento, setOrcamento] = useState('1000')
  const [objetivo, setObjetivo] = useState<any>('vendas')
  const [nicho, setNicho] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/trafficoptimizer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orcamento: Number(orcamento), nicho, objetivo }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  const brl = (v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
  return (
    <AgentShell titulo="TrafficOptimizer" tagline="Distribui orçamento de anúncios entre canais com maior ROI"
      icone={<BarChart3 className="w-7 h-7" />} cor="bg-gradient-to-br from-yellow-500 to-orange-600" labelBotao="Otimizar orçamento"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3"><p className="text-[10px] font-black text-emerald-700">ROAS est.</p><p className="text-xl font-black text-emerald-600">{out.roasEstimado.toFixed(1)}x</p></div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3"><p className="text-[10px] font-black text-red-700">CPA est.</p><p className="text-xl font-black text-red-600">{brl(out.cpaEstimado)}</p></div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3"><p className="text-[10px] font-black text-blue-700">CTR médio</p><p className="text-xl font-black text-blue-600">{out.ctrMedio.toFixed(1)}%</p></div>
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Distribuição por canal</p>
          <div className="space-y-2">
            {out.distribuicao.map((c:any,i:number)=>(
              <div key={i}>
                <div className="flex justify-between text-xs"><span className="font-bold">{c.canal}</span><span className="font-black">{c.orcamentoPct.toFixed(0)}% • {brl(c.orcamento)}</span></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${c.orcamentoPct}%` }}/></div>
                <p className="text-[10px] text-slate-500 mt-0.5">💡 {c.acao}</p>
              </div>
            ))}
          </div>
          {out.avisos.length>0 && <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3"><p className="text-[10px] font-black text-red-700 mb-1">Alertas</p><ul className="text-xs space-y-1 text-red-700 dark:text-red-400">{out.avisos.map((a:string,i:number)=><li key={i}>{a}</li>)}</ul></div>}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3"><p className="text-[10px] font-black text-amber-700 mb-1">Dicas dos experts</p><ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">{out.dicas.map((d:string,i:number)=><li key={i}>{d}</li>)}</ul></div>
        </div>
      )}>
      <Field label="Orçamento total R$"><input className={inputClass} type="number" value={orcamento} onChange={e=>setOrcamento(e.target.value)} /></Field>
      <Field label="Objetivo"><select className={selectClass} value={objetivo} onChange={e=>setObjetivo(e.target.value)}>
        <option value="vendas">Vendas</option><option value="leads">Leads</option><option value="audiencia">Audiência</option><option value="remarketing">Remarketing</option>
      </select></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: fitness, moda, beleza" /></Field>
    </AgentShell>
  )
}
