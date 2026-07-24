'use client'; import { useState } from 'react'; import { Link as IconLink } from 'lucide-react'; import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell';
export default function Page(){const[url,setUrl]=useState('');const[fonte,setFonte]=useState('facebook');const[campanha,setCampanha]=useState('lancamento');const[conteudo,setConteudo]=useState('');const[termo,setTermo]=useState('');const[loading,setLoading]=useState(false);const[out,setOut]=useState<any>(null);
const gerar=async()=>{setLoading(true);try{const r=await fetch('/api/agents/urltracker',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({urlBase:url,fonte,campanha,conteudo,termo})});const d=await r.json();if(d.error)return alert(d.error);setOut(d)}catch{alert('Erro')}finally{setLoading(false)}}
return(<AgentShell titulo="URLTracker" tagline="Gera links com UTM pra rastrear todas as campanhas de tráfego" icone={<IconLink className="w-7 h-7"/>} cor="bg-gradient-to-br from-cyan-500 to-blue-600" labelBotao="Gerar link rastreado" onGerar={gerar} loading={loading} output={out && (
<div className="space-y-3">
<div className="bg-slate-900 text-white rounded-2xl p-4 font-mono text-xs break-all">{out.url}</div>
<button onClick={()=>navigator.clipboard?.writeText(out.url)} className="bg-brand-600 text-white rounded-full px-4 py-2 text-xs font-bold">Copiar link</button>
<details><summary className="font-bold text-sm cursor-pointer">Links para cada plataforma</summary><div className="mt-2 space-y-1">{out.urlsPlataformas.map((p:any,i:number)=><div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-lg p-2 text-[11px]"><strong className="block">{p.plataforma}</strong><code className="break-all text-[10px]">{p.url}</code></div>)}</div></details>
<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs"><p className="font-black uppercase text-blue-700 mb-1">Entenda os parâmetros</p><ul>{Object.entries(out.explicacao).map(([k,v]:any,i)=><li key={i}><strong>{k}:</strong> {v}</li>)}</ul></div>
</div>)}>
<Field label="URL base"><input className={inputClass} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://kiyvo.com.br/produto/nome"/></Field>
<Field label="Fonte (source)"><select className={selectClass} value={fonte} onChange={e=>setFonte(e.target.value)}><option value="facebook">Facebook/Meta</option><option value="tiktok">TikTok</option><option value="google">Google</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option><option value="afiliado">Afiliado</option></select></Field>
<Field label="Nome da campanha"><input className={inputClass} value={campanha} onChange={e=>setCampanha(e.target.value)} placeholder="black_friday_2025"/></Field>
<Field label="Conteúdo (opcional)"><input className={inputClass} value={conteudo} onChange={e=>setConteudo(e.target.value)} placeholder="video_a_vs_b"/></Field>
<Field label="Termo/palavra-chave (opcional)"><input className={inputClass} value={termo} onChange={e=>setTermo(e.target.value)} placeholder="marketing digital"/></Field>
</AgentShell>)}
