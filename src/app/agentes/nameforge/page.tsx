'use client'; import { useState } from 'react'; import { Sparkles } from 'lucide-react'; import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell';
export default function Page(){const[nicho,setNicho]=useState('');const[palavra,setPalavra]=useState('');const[estilo,setEstilo]=useState('moderno');const[loading,setLoading]=useState(false);const[out,setOut]=useState<any>(null);
const gerar=async()=>{setLoading(true);try{const r=await fetch('/api/agents/nameforge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nicho,palavraChave:palavra,estilo})});const d=await r.json();if(d.error)return alert(d.error);setOut(d)}catch{alert('Erro')}finally{setLoading(false)}}
return(<AgentShell titulo="NameForge" tagline="Nomes de marcas e produtos com slogan + verificação de domínio/Instagram" icone={<Sparkles className="w-7 h-7"/>} cor="bg-gradient-to-br from-purple-500 to-pink-600" labelBotao="Gerar nomes" onGerar={gerar} loading={loading} output={out && (
<div className="space-y-3">
{out.nomes.map((n:any,i:number)=>(
<div key={i} className={`rounded-2xl p-4 border ${i===0?'border-brand-500 bg-brand-50 dark:bg-brand-900/20':'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F1A]'}`}>
{i===0 && <p className="text-[10px] font-black uppercase text-brand-600 mb-1">🏆 Top pick</p>}
<p className="text-2xl font-black text-[#0F172A] dark:text-white">{n.nome}</p>
<p className="text-sm text-slate-600 dark:text-slate-400 italic mt-1">{n.slogan}</p>
<div className="flex flex-wrap gap-2 mt-2 text-[10px]">
<span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{n.estilo}</span>
<span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">.com.br</span>
<span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">@{n.disponibilidade.instagram.replace('@','')}</span>
</div></div>))}
<div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs"><ul>{out.dicas.map((d:string,i:number)=><li key={i}>• {d}</li>)}</ul></div>
</div>)}>
<Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital"/></Field>
<Field label="Palavra-chave (opcional)"><input className={inputClass} value={palavra} onChange={e=>setPalavra(e.target.value)} placeholder="Ex: Reels"/></Field>
<Field label="Estilo"><select className={selectClass} value={estilo} onChange={e=>setEstilo(e.target.value)}><option value="moderno">Moderno</option><option value="premium">Premium</option><option value="descontraido">Descontraído</option><option value="tech">Tech</option><option value="brasileiro">Brasileiro</option><option value="memoravel">Memorável</option></select></Field>
</AgentShell>)}
