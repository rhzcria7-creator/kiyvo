'use client'; import { useState } from 'react'; import { Target } from 'lucide-react'; import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell';
export default function Page(){const[site,setSite]=useState('');const[vendas,setVendas]=useState('10');const[ticket,setTicket]=useState('97');const[loading,setLoading]=useState(false);const[out,setOut]=useState<any>(null);
const gerar=async()=>{setLoading(true);try{const r=await fetch('/api/agents/pixelperfect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,vendasPorDia:Number(vendas),ticketMedio:Number(ticket)})});const d=await r.json();if(d.error)return alert(d.error);setOut(d)}catch{alert('Erro')}finally{setLoading(false)}}
const corScore=(s:number)=>s>=80?'text-emerald-600':s>=60?'text-amber-600':'text-red-600'
return(<AgentShell titulo="PixelPerfect" tagline="Diagnóstico de pixel/tracking e eventos para Meta/Google/TikTok" icone={<Target className="w-7 h-7"/>} cor="bg-gradient-to-br from-red-500 to-orange-600" labelBotao="Diagnosticar" onGerar={gerar} loading={loading} output={out && (
<div className="space-y-3">
<div className={`rounded-2xl p-6 text-white text-center`} style={{background:out.cor}}>
<p className="text-[11px] font-black uppercase tracking-widest opacity-80">Score de tracking</p>
<p className="text-5xl font-black">{out.score}/100</p>
<p className="text-sm mt-2 opacity-90">{out.receitaEstimadaAumento}</p></div>
<details open><summary className="font-bold text-sm cursor-pointer mb-2">Eventos recomendados ({out.eventosRecomendados.length})</summary>
<div className="space-y-1">{out.eventosRecomendados.map((e:any,i:number)=><div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-lg p-2 text-xs flex items-center justify-between"><span><strong>{e.nome}</strong> — {e.trigger}</span><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${e.importancia==='critico'?'bg-red-100 text-red-700':e.importancia==='importante'?'bg-amber-100 text-amber-700':'bg-slate-200 text-slate-700'}`}>{e.importancia}</span></div>)}</div></details>
{out.problemasEncontrados.length>0 && <div><p className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-1">Problemas</p>
<div className="space-y-1">{out.problemasEncontrados.map((p:any,i:number)=><div key={i} className={`rounded-lg p-2 text-xs ${p.severidade==='critica'?'bg-red-50 dark:bg-red-900/20 text-red-700':'bg-amber-50 dark:bg-amber-900/20 text-amber-700'}`}><strong>{p.severidade.toUpperCase()}:</strong> {p.descricao}<br/><em>{p.comoResolver}</em></div>)}</div></div>}
<details className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-xs"><summary className="font-bold text-emerald-700 cursor-pointer">✅ Checklist de implementação</summary><ul className="mt-2 space-y-1">{out.checklistImplementacao.map((d:string,i:number)=><li key={i}>{d}</li>)}</ul></details>
</div>)}>
<Field label="URL do site"><input className={inputClass} value={site} onChange={e=>setSite(e.target.value)} placeholder="https://seusite.com"/></Field>
<Field label="Vendas por dia"><input className={inputClass} type="number" value={vendas} onChange={e=>setVendas(e.target.value)}/></Field>
<Field label="Ticket médio R$"><input className={inputClass} type="number" value={ticket} onChange={e=>setTicket(e.target.value)}/></Field>
</AgentShell>)}
