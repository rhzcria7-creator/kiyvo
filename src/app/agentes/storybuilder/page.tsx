'use client'; import { useState } from 'react'; import { Instagram } from 'lucide-react'; import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell';
export default function Page(){const[nicho,setNicho]=useState('');const[produto,setProduto]=useState('');const[objetivo,setObjetivo]=useState<any>('engajar');const[loading,setLoading]=useState(false);const[out,setOut]=useState<any>(null);
const gerar=async()=>{setLoading(true);try{const r=await fetch('/api/agents/storybuilder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nicho,produto,objetivo})});const d=await r.json();if(d.error)return alert(d.error);setOut(d)}catch{alert('Erro')}finally{setLoading(false)}}
return(<AgentShell titulo="StoryBuilder" tagline="Sequência de stories com enquete, quiz, slider e CTA que ALCANÇA 3x mais" icone={<Instagram className="w-7 h-7"/>} cor="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500" labelBotao="Criar sequência" onGerar={gerar} loading={loading} output={out && (
<div className="space-y-3">
<p className="text-sm">{out.duracaoTotal} • {out.frames.length} stories • enquete: {out.hasPoll?'✅':'❌'} • pergunta: {out.hasQuestion?'✅':'❌'}</p>
<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
{out.frames.map((f:any,i:number)=>(
<div key={i} className="rounded-2xl aspect-[9/16] p-3 flex flex-col justify-end shadow-md" style={{background:f.fundo}}>
<p className="text-[10px] font-black text-white/80">#{f.ordem} • {f.tipo}</p>
<p className="text-white font-black text-sm whitespace-pre-wrap leading-tight">{f.texto}</p>
{f.adesivo && <p className="text-white/80 text-[10px] mt-1">adesivo: {f.adesivo}</p>}
</div>))}
</div>
<details className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs"><summary className="font-bold">💡 Ideias de enquetes</summary><ul className="mt-2 space-y-1">{out.ideiasEnquetes.map((d:string,i:number)=><li key={i}>• {d}</li>)}</ul></details>
<div className="bg-slate-900 text-white rounded-xl p-3 text-xs"><p className="font-black uppercase tracking-widest opacity-70 mb-1">Dicas</p><ul className="space-y-1">{out.dicas.map((d:string,i:number)=><li key={i}>{d}</li>)}</ul></div>
</div>)}>
<Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital"/></Field>
<Field label="Produto (opcional)"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)}/></Field>
<Field label="Objetivo"><select className={selectClass} value={objetivo} onChange={e=>setObjetivo(e.target.value)}><option value="engajar">Engajar</option><option value="vender">Vender</option><option value="audiencia">Crescer audiência</option><option value="enquete">Enquete/pergunta</option></select></Field>
</AgentShell>)}
