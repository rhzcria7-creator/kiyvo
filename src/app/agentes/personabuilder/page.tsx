'use client'
import { useState } from 'react'
import { Users } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [nicho,setNicho]=useState(''); const [produto,setProduto]=useState(''); const [faixa,setFaixa]=useState('25-35'); const [regiao,setRegiao]=useState('Brasil'); const [loading,setLoading]=useState(false); const [out,setOut]=useState<any>(null)
  const gerar=async()=>{setLoading(true);try{const r=await fetch('/api/agents/personabuilder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nicho,produto,faixaEtaria:faixa,regiao})});const d=await r.json();if(d.error){alert(d.error);return}setOut(d)}catch{alert('Erro')}finally{setLoading(false)}}
  return(<AgentShell titulo="PersonaBuilder" tagline="Cria personas completas para você vender melhor (Jobs To Be Done)" icone={<Users className="w-7 h-7"/>} cor="bg-gradient-to-br from-pink-500 to-rose-600" labelBotao="Gerar personas" onGerar={gerar} loading={loading} output={out && (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">{out.estrategia.split('\n').map((l:string,i:number)=><span key={i}>{l}<br/></span>)}</p>
      <div className="grid md:grid-cols-3 gap-3">
        {out.personas.map((p:any,i:number)=>(
          <div key={i} className="bg-white dark:bg-[#0B0F1A] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-sm">
            <div className="flex items-center gap-3 mb-2"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-black text-lg">{p.nome[0]}</div><div><p className="font-black">{p.nome}</p><p className="text-xs text-slate-500">{p.idade} anos • {p.cidade}</p></div></div>
            <p className="text-xs"><strong>Profissão:</strong> {p.profissao}</p>
            <p className="text-xs"><strong>Renda:</strong> {p.renda}</p>
            <p className="text-xs mt-2"><strong>😤 Frustrações:</strong></p><ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc pl-4">{p.frustracoes.slice(0,3).map((f:any,j:number)=><li key={j}>{f}</li>)}</ul>
            <p className="text-xs mt-1"><strong>✨ Desejos:</strong></p><ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc pl-4">{p.desejos.slice(0,3).map((d:any,j:number)=><li key={j}>{d}</li>)}</ul>
            <p className="mt-2 text-xs italic bg-slate-50 dark:bg-[#111] rounded-lg p-2">"{p.citacao}"</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4"><p className="font-black text-blue-700 dark:text-blue-400 text-xs mb-1">🥶 Público FRIO</p><p className="text-sm">Isca: {out.publicoFrio.ofertaIdeal}<br/>Gatilho: {out.publicoFrio.gatilho}</p></div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4"><p className="font-black text-red-700 dark:text-red-400 text-xs mb-1">🔥 Público QUENTE</p><p className="text-sm">Oferta: {out.publicoQuente.ofertaIdeal}<br/>Gatilho: {out.publicoQuente.gatilho}</p></div>
      </div>
    </div>
  )}>
    <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital"/></Field>
    <Field label="Produto"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex: Método ReelsPro"/></Field>
    <Field label="Faixa etária"><input className={inputClass} value={faixa} onChange={e=>setFaixa(e.target.value)} placeholder="25-35"/></Field>
    <Field label="Região"><input className={inputClass} value={regiao} onChange={e=>setRegiao(e.target.value)} placeholder="Brasil"/></Field>
  </AgentShell>)
}
