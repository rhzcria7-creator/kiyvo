'use client'; import { useState } from 'react'; import { MessageCircle } from 'lucide-react'; import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell';
export default function Page(){const[tipo,setTipo]=useState<any>('vendas');const[nome,setNome]=useState('');const[produto,setProduto]=useState('');const[preco,setPreco]=useState('');const[vendedor,setVendedor]=useState('KIYVO');const[link,setLink]=useState('https://kiyvo.com.br');const[loading,setLoading]=useState(false);const[out,setOut]=useState<any>(null);
const gerar=async()=>{setLoading(true);try{const r=await fetch('/api/agents/whatsappforge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo,nomeCliente:nome,produto,preco:preco?Number(preco):undefined,nomeVendedor:vendedor,link})});const d=await r.json();if(d.error)return alert(d.error);setOut(d)}catch{alert('Erro')}finally{setLoading(false)}}
return(<AgentShell titulo="WhatsAppForge" tagline="Sequências de mensagens WhatsApp que VENDEM (com delays naturais)" icone={<MessageCircle className="w-7 h-7"/>} cor="bg-gradient-to-br from-green-500 to-emerald-600" labelBotao="Gerar sequência" onGerar={gerar} loading={loading} output={out && (
<div className="space-y-3">
<div className="bg-emerald-500 text-white rounded-xl p-3 text-sm font-bold">Taxa de resposta esperada: {out.taxaConversaoEstimada}</div>
<div className="bg-[#E5DDD5] dark:bg-[#0B141A] rounded-2xl p-4 space-y-2">
{out.mensagens.map((m:any,i:number)=>(
<div key={i} className="flex flex-col gap-1">
<div className="bg-white dark:bg-[#202C33] rounded-lg rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
<p className="text-sm text-[#0F172A] dark:text-white whitespace-pre-wrap">{m.texto}</p>
<p className="text-[10px] text-slate-500 mt-0.5">{m.delay}</p>
</div></div>))}
</div>
{out.scriptAudio && <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-xs"><p className="font-black text-purple-700">🎙️ Roteiro de áudio:</p><p className="mt-1">{out.scriptAudio}</p></div>}
<details className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-xs"><summary className="font-bold">✅ Dicas</summary><ul className="mt-2 space-y-1">{out.dicas.map((d:string,i:number)=><li key={i}>{d}</li>)}</ul></details>
<details className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-xs"><summary className="font-bold text-red-700">🚫 Não faça isso</summary><ul className="mt-2 space-y-1">{out.naoFazer.map((d:string,i:number)=><li key={i}>{d}</li>)}</ul></details>
</div>)}>
<Field label="Tipo de sequência"><select className={selectClass} value={tipo} onChange={e=>setTipo(e.target.value)}>
<option value="vendas">Vendas diretas</option><option value="saudacao">Saudação/boas-vindas</option><option value="abordagem_fria">Abordagem fria</option><option value="followup">Follow-up</option><option value="recuperacao_carrinho">Recuperação de carrinho</option><option value="pos_venda">Pós-venda</option><option value="oferta_relampago">Oferta relâmpago</option><option value="lembrete_live">Lembrete de live</option><option value="aniversario">Aniversário</option><option value="pesquisa_satisfacao">Pesquisa NPS</option>
</select></Field>
<Field label="Nome do cliente"><input className={inputClass} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: João"/></Field>
<Field label="Produto"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex: Pack Reels Pro"/></Field>
<Field label="Preço R$"><input className={inputClass} type="number" value={preco} onChange={e=>setPreco(e.target.value)}/></Field>
<Field label="Seu nome"><input className={inputClass} value={vendedor} onChange={e=>setVendedor(e.target.value)}/></Field>
<Field label="Link"><input className={inputClass} value={link} onChange={e=>setLink(e.target.value)}/></Field>
</AgentShell>)}
