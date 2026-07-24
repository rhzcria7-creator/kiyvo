// Gera tudo para 12 agentes v9.2
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const agents = [
  { file: 'custosreais', fn: 'runCustosReaisVenda', iface: 'CustosReaisVendaInput', title: 'Custos Reais de Venda', tagline: 'Todos os custos abertos (gateway+plataforma+impostos)', icon: '🧾', color: 'from-slate-600 to-slate-900', fields: [
    {k:'preco',type:'number',label:'Preço de venda (R$)',ph:'97'},
    {k:'meioPagamento',type:'select',label:'Meio de pagamento',opts:['pix','cartao','boleto']},
    {k:'planoVendedor',type:'select',label:'Seu plano',opts:['free','plus','pro','vendor_pro']},
    {k:'comissaoAfiliado',type:'number',label:'Comissão afiliado %',ph:'0'},
    {k:'custoProduto',type:'number',label:'Custo do produto (R$)',ph:'0'},
    {k:'cac',type:'number',label:'CAC/custo de anúncio (R$)',ph:'0'},
  ]},
  { file: 'bumpcriador', fn: 'runCriadorBump', iface: 'CriadorBumpInput', title: 'Criador de Order Bump', tagline: 'Bump de checkout que converte 25-40%', icon: '☑️', color: 'from-amber-500 to-orange-600', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço (R$)',ph:'97'}
  ]},
  { file: 'otosequencia', fn: 'runOTOSequencia', iface: 'OTOSequenciaInput', title: 'Sequência de OTO/Upsell', tagline: 'Bump + OTO + Downsell + Sub', icon: '🎢', color: 'from-pink-500 to-purple-600', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço (R$)'}
  ]},
  { file: 'scriptspn', fn: 'runScriptSPN', iface: 'ScriptSPNInput', title: 'Script Venda SPN', tagline: 'Sofrimento → Ponte → Nova Vida', icon: '🎭', color: 'from-violet-500 to-indigo-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'dor',type:'text',label:'Dor principal'},{k:'sonho',type:'text',label:'Sonho do cliente'}
  ]},
  { file: 'refunddesescalador', fn: 'runRefundDesescalador', iface: 'RefundDesescaladorInput', title: 'Desescalador de Reembolso', tagline: 'Reduz refund SEM negar devolução', icon: '🤝', color: 'from-emerald-500 to-green-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'motivo',type:'text',label:'Motivo do reembolso'}
  ]},
  { file: 'profitfirst', fn: 'runProfitFirstSimulator', iface: 'ProfitFirstSimulatorInput', title: 'Profit First (Lucro Primeiro)', tagline: '50/30/10/10 adaptado pra Brasil', icon: '🏦', color: 'from-green-500 to-teal-700', fields: [
    {k:'receitaMensal',type:'number',label:'Receita mensal (R$)',ph:'5000'},
  ]},
  { file: 'giftcardcriador', fn: 'runGiftCardCreator', iface: 'GiftCardCreatorInput', title: 'Criador de Gift Card', tagline: 'Vale-presente promocional', icon: '🎁', color: 'from-pink-500 to-rose-600', fields: [
    {k:'valor',type:'number',label:'Valor (R$)',ph:'50'},{k:'bonusPercent',type:'number',label:'Bônus % (opcional)',ph:'10'}
  ]},
  { file: 'cashbackcalc', fn: 'runCashbackEngine', iface: 'CashbackEngineInput', title: 'Calculadora Cashback KD', tagline: 'Calcula KD Points da compra', icon: '🪙', color: 'from-yellow-400 to-amber-600', fields: [
    {k:'preco',type:'number',label:'Preço produto (R$)'},{k:'plano',type:'select',label:'Plano',opts:['free','plus','pro','vendor_pro']}
  ]},
  { file: 'leadmagnetpro', fn: 'runCriadorLeadMagnet', iface: 'CriadorLeadMagnetInput', title: 'Lead Magnet Pro', tagline: '7 ideias de isca com estimativa de conversão', icon: '🧲', color: 'from-cyan-500 to-blue-700', fields: [
    {k:'nicho',type:'text',label:'Nicho'}
  ]},
  { file: 'aumentarticket', fn: 'runTicketMedioAumento', iface: 'TicketMedioAumentoInput', title: 'Aumentar Ticket Médio', tagline: '10 estratégias de AOV com ganho%', icon: '📈', color: 'from-indigo-500 to-blue-700', fields: [
    {k:'ticketAtual',type:'number',label:'Ticket médio atual (R$)'}
  ]},
  { file: 'webinarroteiro', fn: 'runScriptWebinarRoteiro', iface: 'ScriptWebinarRoteiroInput', title: 'Roteiro de Webinar', tagline: 'Webinar de 90 min que converte 8-15%', icon: '🎥', color: 'from-red-500 to-rose-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço webinar (R$)'},{k:'dor',type:'text',label:'Dor principal'}
  ]},
  { file: 'perguntasfechamento', fn: 'runCriadorPerguntas', iface: 'CriadorPerguntasInput', title: '12 Perguntas que Fecham Venda', tagline: 'Perguntas que levam ao SIM', icon: '❓', color: 'from-fuchsia-500 to-pink-700', fields: [
    {k:'produtoNome',type:'text',label:'Produto'}
  ]},
];

// lib shims
const libDir = path.join(root, 'src', 'lib', 'agents');
for (const a of agents) {
  const src = `// Re-export (em ./v92-monetization)\nexport { ${a.fn} } from './v92-monetization'\nexport type { ${a.iface} } from './v92-monetization'\n`;
  fs.writeFileSync(path.join(libDir, a.file + '.ts'), src);
}
// Barrel
const barrelPath = path.join(libDir, 'index.ts');
let b = fs.readFileSync(barrelPath, 'utf8');
if (!b.includes('./v92-monetization')) {
  b = b.replace(/\n$/, '') + "\nexport * from './v92-monetization'\n";
  fs.writeFileSync(barrelPath, b);
}
console.log('✅ shims + barrel');

// API routes
const apiDir = path.join(root, 'src', 'app', 'api', 'agents');
for (const a of agents) {
  const folder = path.join(apiDir, a.file);
  fs.mkdirSync(folder, { recursive: true });
  const code = `// POST /api/agents/${a.file}
import { NextRequest, NextResponse } from 'next/server'
import { ${a.fn} } from '@/lib/agents/v92-monetization'
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
        const { data: profile } = await supabase.from('profiles').select('plano,role').eq('id', userId).single()
        userPlano = (profile as any)?.plano || 'free'
      }
    } catch {}
    const input = await request.json()
    const plan = getPlanForUser({ plano: userPlano as any })
    const result = await ${a.fn}(input, { userId, plan } as any)
    if (userId !== 'anon') {
      try { const u = getUsage(userId); u.copiesHoje = (u.copiesHoje||0)+1; setUsage(userId, u); trackUsage(userId, '${a.file}') } catch {}
    }
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro interno' }, { status: 500 })
  }
}
`;
  fs.writeFileSync(path.join(folder, 'route.ts'), code);
}
console.log('✅ APIs');

// Pages
const pagesDir = path.join(root, 'src', 'app', 'agentes');
for (const a of agents) {
  const folder = path.join(pagesDir, a.file);
  fs.mkdirSync(folder, { recursive: true });
  const fieldsCode = a.fields.map(f => {
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
  }).join('\n      ');

  const code = `'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [input, setInput] = useState<any>({ ${a.fields.map(f => `${f.k}: undefined`).join(', ')} })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  async function gerar() {
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/agents/${a.file}', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      setResult(await res.json())
    } finally { setLoading(false) }
  }
  function copiarTudo() {
    const t = typeof result?.data === 'object' ? JSON.stringify(result.data, null, 2) : String(result?.data || '')
    navigator.clipboard.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  function renderValor(v: any, depth = 0): React.ReactNode {
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>
    if (typeof v !== 'object') return <span className="text-slate-800 dark:text-slate-100">{String(v)}</span>
    if (Array.isArray(v)) {
      return (
        <ul className={depth === 0 ? 'space-y-3' : 'ml-4 space-y-1 mt-1'}>
          {v.map((it, i) => (
            <li key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {typeof it === 'object' ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  {Object.entries(it).map(([k, val]) => (
                    <div key={k} className="flex gap-2 items-start mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 min-w-[90px] pt-0.5">{formatar(k)}</span>
                      <span className="flex-1">{renderValor(val, depth+1)}</span>
                    </div>
                  ))}
                </div>
              ) : <span className="mr-1">•</span>}
              {typeof it === 'object' ? '' : renderValor(it, depth+1)}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <div className={depth === 0 ? 'space-y-3' : 'space-y-1 mt-1'}>
        {Object.entries(v).map(([k, val]) => (
          <div key={k} className={depth === 0 ? 'bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800' : 'flex gap-2 items-start'}>
            <div className={depth === 0 ? 'text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2' : 'text-[11px] font-black uppercase tracking-wider text-slate-500 min-w-[90px] pt-0.5'}>{formatar(k)}</div>
            <div className={depth === 0 ? '' : 'flex-1'}>{renderValor(val, depth+1)}</div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <AgentShell
      titulo="${a.title}" tagline="${a.tagline}"
      icone={<span className="text-2xl">${a.icon}</span>} cor="${a.color}"
      onGerar={gerar} loading={loading} labelBotao="Gerar com IA"
      output={result?.ok ? (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">✅ Pronto</div>
            <button onClick={copiarTudo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold">{copied?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}{copied?'Copiado!':'Copiar'}</button>
          </div>
          {renderValor(result.data)}
        </motion.div>
      ) : result?.error ? (<div className="py-12 text-center"><p className="text-red-500 font-semibold text-sm">{result.error}</p></div>) : null}
    >
      ${fieldsCode}
    </AgentShell>
  )
}
function formatar(k: string) { return k.replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\\b\\w/g,c=>c.toUpperCase()) }
`;
  fs.writeFileSync(path.join(folder, 'page.tsx'), code);
}
console.log('✅ Páginas');

// Middleware
const mwPath = path.join(root, 'src', 'middleware.ts');
let mw = fs.readFileSync(mwPath, 'utf8');
if (!mw.includes("/agentes/" + agents[0].file)) {
  const routes = agents.map(a => `  '/agentes/${a.file}', '/api/agents/${a.file}',`).join('\n');
  const marker = "'/agentes/copysniper', '/api/agents/copysniper',";
  mw = mw.replace(marker, marker + '\n' + routes);
  fs.writeFileSync(mwPath, mw);
  console.log('✅ Middleware');
}

// Hub
const hubPath = path.join(root, 'src', 'app', 'agentes', 'page.tsx');
let hub = fs.readFileSync(hubPath, 'utf8');
if (!hub.includes("id: '" + agents[0].file + "'")) {
  const hubBlocks = agents.map(a => `  { id: '${a.file}', nome: ${JSON.stringify(a.title)}, desc: ${JSON.stringify(a.tagline)}, icone: ${JSON.stringify(a.icon)}, cor: 'bg-gradient-to-br ' + a.color.split(' ').slice(1).join(' '), categoria: 'Monetização', rota: '/agentes/${a.file}' },`).join('\n');
  const hubMarker = "// === FIM DOS AGENTES ===";
  hub = hub.replace(hubMarker, hubBlocks + '\n' + hubMarker);
  fs.writeFileSync(hubPath, hub);
  console.log('✅ Hub');
}

console.log('\n🎉 v9.2 completo!');
