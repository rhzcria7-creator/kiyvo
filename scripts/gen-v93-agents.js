// Gera tudo para 12 agentes v9.3
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const agents = [
  { file: 'pitchvenda', fn: 'runPitchVenda', iface: 'PitchVendaInput', title: 'Pitch de Vendas', tagline: '30s/1min/DM/Reels', icon: '🗣️', color: 'from-orange-500 to-red-600', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'nicho',type:'text',label:'Nicho'},{k:'dor',type:'text',label:'Dor principal'},{k:'resultado',type:'text',label:'Resultado entregue'},{k:'preco',type:'number',label:'Preço (R$)',ph:'97'},
  ]},
  { file: 'chargedefense', fn: 'runRecuperaChargeback', iface: 'RecuperaChargebackInput', title: 'Defesa Chargeback', tagline: 'Recupera disputa e evita multas', icon: '⚖️', color: 'from-red-700 to-black', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'valor',type:'number',label:'Valor (R$)'},{k:'dataCompra',type:'text',label:'Data da compra',ph:'DD/MM/AAAA'},
  ]},
  { file: 'reviewreply', fn: 'runReviewResponder', iface: 'ReviewResponderInput', title: 'Respondedor de Reviews', tagline: 'Responde 1-5 estrelas com tom certo', icon: '⭐', color: 'from-amber-500 to-yellow-600', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'estrelas',type:'select',label:'Nota',opts:['5','4','3','2','1']},{k:'textoReview',type:'text',label:'Texto da review (opcional)'},
  ]},
  { file: 'precodinamico', fn: 'runPrecificacaoDinamica', iface: 'PrecificacaoDinamicaInput', title: 'Precificação Dinâmica', tagline: 'Preço em 7 cenários diferentes', icon: '📊', color: 'from-teal-500 to-cyan-700', fields: [
    {k:'precoBase',type:'number',label:'Preço base (R$)'},
  ]},
  { file: 'hookcriador', fn: 'runCriadorHook', iface: 'CriadorHookInput', title: 'Hook de Anúncio', tagline: '10 hooks que param o scroll', icon: '🎣', color: 'from-pink-500 to-red-600', fields: [
    {k:'nicho',type:'text',label:'Nicho'},{k:'dor',type:'text',label:'Dor'},
  ]},
  { file: 'criativoads', fn: 'runCriadorCriativo', iface: 'CriadorCriativoInput', title: 'Criativo de Anúncio', tagline: 'Roteiro 35seg + thumbs + legenda', icon: '🎬', color: 'from-purple-500 to-fuchsia-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'publico',type:'text',label:'Público'},{k:'dor',type:'text',label:'Dor'},{k:'resultado',type:'text',label:'Resultado'},{k:'preco',type:'number',label:'Preço (R$)'},
  ]},
  { file: 'pitchdeck', fn: 'runPitchDeck', iface: 'PitchDeckInput', title: 'Pitch Deck', tagline: '10 slides pra parceria/investidor', icon: '📑', color: 'from-indigo-500 to-blue-700', fields: [
    {k:'empresaNome',type:'text',label:'Nome empresa/produto'},{k:'produtoNome',type:'text',label:'Nome produto'},{k:'nicho',type:'text',label:'Nicho/mercado'},{k:'publico',type:'number',label:'Público potencial (n°)'},{k:'receita',type:'number',label:'Receita atual (R$)',ph:'0'},
  ]},
  { file: 'contratoafiliado', fn: 'runContratoAfiliado', iface: 'ContratoAfiliadoInput', title: 'Minuta Afiliado', tagline: '10 cláusulas essenciais', icon: '📝', color: 'from-slate-600 to-slate-900', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'comissaoPercent',type:'number',label:'Comissão %',ph:'50'},{k:'cookieDias',type:'number',label:'Cookie dias',ph:'30'},
  ]},
  { file: 'npsfollow', fn: 'runNPSFollowUp', iface: 'NPSFollowUpInput', title: 'NPS Follow-Up', tagline: 'Pesquisa e ação por nota', icon: '📮', color: 'from-cyan-500 to-teal-600', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'diasAposCompra',type:'number',label:'Dias pós-compra',ph:'7'},
  ]},
  { file: 'posvenda', fn: 'runSequenciaPosVenda', iface: 'SequenciaPosVendaInput', title: 'Sequência Pós-Venda', tagline: '8 contatos que reduzem refund 40%', icon: '💙', color: 'from-blue-500 to-indigo-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço (R$)'},
  ]},
  { file: 'bonusmaker', fn: 'runGeradorBonus', iface: 'GeradorBonusInput', title: 'Gerador de Bônus', tagline: 'Bônus de alto valor sem custo', icon: '🎁', color: 'from-rose-500 to-pink-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'nicho',type:'text',label:'Nicho'},
  ]},
  { file: 'valorpercebido', fn: 'runCalculadoraValorPercebido', iface: 'CalculadoraValorPercebidoInput', title: 'Valor Percebido', tagline: 'Calcula valor x preço da oferta', icon: '💎', color: 'from-violet-500 to-purple-700', fields: [
    {k:'preco',type:'number',label:'Preço (R$)'},{k:'valorBonusTotal',type:'number',label:'Valor dos bônus (R$)',ph:'0'},{k:'horasConteudo',type:'number',label:'Horas de conteúdo',ph:'10'},{k:'horasSessao',type:'number',label:'Horas de sessão',ph:'0'},
  ]},
];

// lib shims
const libDir = path.join(root, 'src', 'lib', 'agents');
for (const a of agents) {
  fs.writeFileSync(path.join(libDir, a.file + '.ts'), `// Re-export (em ./v93-monetization)\nexport { ${a.fn} } from './v93-monetization'\nexport type { ${a.iface} } from './v93-monetization'\n`);
}
const barrel = path.join(libDir, 'index.ts');
let b = fs.readFileSync(barrel, 'utf8');
if (!b.includes('./v93-monetization')) b = b.trimEnd() + "\nexport * from './v93-monetization'\n";
fs.writeFileSync(barrel, b);
console.log('✅ shims');

// APIs
const apiDir = path.join(root, 'src', 'app', 'api', 'agents');
for (const a of agents) {
  const f = path.join(apiDir, a.file);
  fs.mkdirSync(f, { recursive: true });
  fs.writeFileSync(path.join(f, 'route.ts'), `// POST /api/agents/${a.file}
import { NextRequest, NextResponse } from 'next/server'
import { ${a.fn} } from '@/lib/agents/v93-monetization'
import { getPlanForUser } from '@/lib/agents/plans'
import { getUsage, setUsage, trackUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    let userId = 'anon', userPlano = 'free'
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        userId = data.user.id
        const { data: p } = await supabase.from('profiles').select('plano,role').eq('id', userId).single()
        userPlano = (p as any)?.plano || 'free'
      }
    } catch {}
    const input = await request.json()
    const result = await ${a.fn}(input, { userId, plan: getPlanForUser({ plano: userPlano as any }) } as any)
    if (userId !== 'anon') { try { const u = getUsage(userId); u.copiesHoje=(u.copiesHoje||0)+1; setUsage(userId,u); trackUsage(userId,'${a.file}') } catch {} }
    return NextResponse.json(result)
  } catch (e: any) { return NextResponse.json({ok:false,error:e?.message||'Erro'},{status:500})}
}
`);
}
console.log('✅ APIs');

// Pages
const pagesDir = path.join(root, 'src', 'app', 'agentes');
function renderField(f) {
  if (f.type === 'select') {
    return `<Field label="${f.label}">
          <select value={input.${f.k} ?? ''} onChange={e => setInput({ ...input, ${f.k}: e.target.value })} className={selectClass}>
            <option value="">Selecione...</option>
            ${f.opts.map(o => `<option value="${o}">${o}</option>`).join('\n            ')}
          </select>
        </Field>`;
  }
  return `<Field label="${f.label}">
        <input type="${f.type}" value={input.${f.k} ?? ''} onChange={e => setInput({ ...input, ${f.k}: e.target.valueAsNumber || e.target.value })} placeholder="${f.ph||''}" className={inputClass} />
      </Field>`;
}
for (const a of agents) {
  const f = path.join(pagesDir, a.file);
  fs.mkdirSync(f, { recursive: true });
  const fields = a.fields.map(renderField).join('\n      ');
  fs.writeFileSync(path.join(f, 'page.tsx'), `'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [input, setInput] = useState<any>({ ${a.fields.map(f=>`${f.k}: undefined`).join(', ')} })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  async function gerar() {
    setLoading(true); setResult(null)
    try { const res = await fetch('/api/agents/${a.file}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}); setResult(await res.json()) } finally { setLoading(false) }
  }
  function copiar() { const t = typeof result?.data==='object'?JSON.stringify(result.data,null,2):String(result?.data||''); navigator.clipboard.writeText(t).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})}
  function rv(v: any, d=0): React.ReactNode {
    if (v==null) return <span className="text-slate-400">—</span>
    if (typeof v!=='object') return <span className="text-slate-800 dark:text-slate-100">{String(v)}</span>
    if (Array.isArray(v)) return <ul className={d===0?'space-y-3':'ml-4 space-y-1 mt-1'}>{v.map((it,i)=><li key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{typeof it==='object'?<div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">{Object.entries(it).map(([k,val])=><div key={k} className="flex gap-2 items-start mb-1"><span className="text-[11px] font-black uppercase tracking-wider text-brand-600 min-w-[90px] pt-0.5">{fmt(k)}</span><span className="flex-1">{rv(val,d+1)}</span></div>)}</div>:<span className="mr-1">•</span>}{typeof it==='object'?'':rv(it,d+1)}</li>)}</ul>
    return <div className={d===0?'space-y-3':'space-y-1 mt-1'}>{Object.entries(v).map(([k,val])=><div key={k} className={d===0?'bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800':'flex gap-2 items-start'}><div className={d===0?'text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2':'text-[11px] font-black uppercase tracking-wider text-slate-500 min-w-[90px] pt-0.5'}>{fmt(k)}</div><div className={d===0?'':'flex-1'}>{rv(val,d+1)}</div></div>)}</div>
  }
  return (<AgentShell titulo="${a.title}" tagline="${a.tagline}" icone={<span className="text-2xl">${a.icon}</span>} cor="${a.color}" onGerar={gerar} loading={loading} labelBotao="Gerar com IA" output={result?.ok?(<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4"><div className="flex items-center justify-between"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">✅ Pronto</div><button onClick={copiar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold">{copied?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}{copied?'Copiado!':'Copiar'}</button></div>{rv(result.data)}</motion.div>):result?.error?(<div className="py-12 text-center"><p className="text-red-500 font-semibold text-sm">{result.error}</p></div>):null} >${fields}</AgentShell>)
}
function fmt(k:string){return k.replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\\b\\w/g,c=>c.toUpperCase())}
`);
}
console.log('✅ Pages');

// Middleware
const mwPath = path.join(root, 'src', 'middleware.ts');
let mw = fs.readFileSync(mwPath, 'utf8');
if (!mw.includes("/agentes/" + agents[0].file)) {
  const routes = agents.map(a => `  '/agentes/${a.file}', '/api/agents/${a.file}',`).join('\n');
  // depois de custosreais
  const after = "'/agentes/custosreais', '/api/agents/custosreais',";
  mw = mw.replace(after, after + '\n' + routes);
  fs.writeFileSync(mwPath, mw);
}
console.log('✅ Middleware');

// Hub
const hubPath = path.join(root, 'src', 'app', 'agentes', 'page.tsx');
let hub = fs.readFileSync(hubPath, 'utf8');
if (!hub.includes("id: '" + agents[0].file + "'")) {
  const blocks = agents.map(a => `  { id: '${a.file}', nome: ${JSON.stringify(a.title)}, tagline: ${JSON.stringify(a.tagline)}, icone: Sparkles, cor: '${a.color.replace('from-','').replace(' to-',' ')}', descricao: ${JSON.stringify(a.tagline)}, ilimitado: false, href: '/agentes/${a.file}', cta: 'Usar', emBreve: false },`).join('\n');
  // insere após último agente v9.2 (perguntasfechamento)
  hub = hub.replace(/(id: 'perguntasfechamento'[^]+?emBreve: false \},\s*\])/m, (m) => m.replace(/\]$/, blocks + '\n]'));
  fs.writeFileSync(hubPath, hub);
  console.log('✅ Hub');
}

console.log('\n🎉 v9.3 completo!');
