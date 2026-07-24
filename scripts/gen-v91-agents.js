// Gera páginas + API para agentes do v9-monetization + páginas da plataforma
const fs = require('fs');
const path = require('path');

const agents = [
  { file: 'saquesimulator', fn: 'runSaqueSimulator', iface: 'SaqueSimulatorInput', title: 'Simulador de Saque', tagline: 'Veja quanto chega na conta', icon: '💸', color: 'from-green-500 to-emerald-700', fields: [{k:'valorSaque',type:'number',label:'Valor do saque (R$)',ph:'100'}] },
  { file: 'precoassinatura', fn: 'runPrecificacaoAssinatura', iface: 'PrecificacaoAssinaturaInput', title: 'Preço de Assinatura', tagline: 'Mensal/trimestral/anual justo', icon: '🔁', color: 'from-blue-500 to-indigo-700', fields: [{k:'valorUnico',type:'number',label:'Valor do produto à vista (R$)',ph:'97'},{k:'nomeProduto',type:'text',label:'Nome do produto',ph:''}] },
  { file: 'upsellcarrinho', fn: 'runUpsellCarrinho', iface: 'UpsellCarrinhoInput', title: 'Upsell de Carrinho', tagline: 'Bump + upsell automático', icon: '🛒', color: 'from-purple-500 to-pink-600', fields: [{k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço (R$)'}] },
  { file: 'cupomrelampago', fn: 'runCupomRelampago', iface: 'CupomRelampagoInput', title: 'Cupom Relâmpago', tagline: 'Cupom KD urgente', icon: '⚡', color: 'from-yellow-500 to-orange-600', fields: [{k:'descontoPercent',type:'number',label:'Desconto %',ph:'15'},{k:'minimoValor',type:'number',label:'Mínimo (R$)',ph:'47'},{k:'horas',type:'number',label:'Validade horas',ph:'2'}] },
  { file: 'upgradeplano', fn: 'runPlanoUpgradeOferta', iface: 'PlanoUpgradeOfertaInput', title: 'Oferta de Upgrade', tagline: 'Argumento para subir de plano', icon: '🚀', color: 'from-emerald-500 to-teal-700', fields: [{k:'planoAtual',type:'select',label:'Plano atual',opts:['free','plus','pro']},{k:'planoDesejado',type:'select',label:'Plano desejado',opts:['plus','pro','vendor_pro']},{k:'valorPlano',type:'number',label:'Preço do plano desejado (R$)'}] },
  { file: 'vendacruzada', fn: 'runVendaCruzada', iface: 'VendaCruzadaInput', title: 'Venda Cruzada', tagline: 'Recomendações inteligentes', icon: '🔗', color: 'from-rose-500 to-pink-700', fields: [{k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço (R$)'}] },
  { file: 'boasvindas', fn: 'runPrimeiraCompra', iface: 'PrimeiraCompraInput', title: 'Boas-Vindas Primeira Compra', tagline: 'Mensagem pós-compra com bônus', icon: '🎉', color: 'from-pink-500 to-fuchsia-700', fields: [{k:'valorCompra',type:'number',label:'Valor da 1ª compra (R$)'}] },
  { file: 'roiads', fn: 'runCalculadoraROIAds', iface: 'CalculadoraROIAdsInput', title: 'Calculadora ROI de Anúncios', tagline: 'Veja se o tráfego pago dá lucro', icon: '📊', color: 'from-orange-500 to-red-700', fields: [{k:'precoProduto',type:'number',label:'Preço produto (R$)'},{k:'custoPorClique',type:'number',label:'CPC médio (R$)',ph:'0.50'},{k:'conversaoPercent',type:'number',label:'Taxa de conversão %',ph:'2'}] },
  { file: 'bfstrategy', fn: 'runBlackFridayEstrategia', iface: 'BlackFridayEstrategiaInput', title: 'Black Friday Playbook', tagline: 'Estratégia completa de BF', icon: '🖤', color: 'from-slate-800 to-black', fields: [{k:'precoNormal',type:'number',label:'Preço normal (R$)'},{k:'custo',type:'number',label:'Custo por unidade (R$)',ph:'0'}] },
  { file: 'mrrcalc', fn: 'runReceitaRecorrente', iface: 'ReceitaRecorrenteInput', title: 'MRR Calculator', tagline: 'Receita recorrente de assinatura', icon: '📈', color: 'from-cyan-500 to-blue-700', fields: [{k:'assinantes',type:'number',label:'Assinantes atuais'},{k:'valorMensal',type:'number',label:'Valor mensal (R$)'},{k:'churnPercent',type:'number',label:'Churn mensal %',ph:'5'}] },
  { file: 'sniperlancamento', fn: 'runScriptLancamento', iface: 'ScriptLancamentoInput', title: 'Script Lançamento 7 dias', tagline: 'Cronograma completo de lançamento', icon: '🎯', color: 'from-violet-500 to-purple-700', fields: [{k:'produtoNome',type:'text',label:'Produto'},{k:'preco',type:'number',label:'Preço lançamento (R$)'}] },
  { file: 'copysniper', fn: 'runCopyLancamentoSniper', iface: 'CopyLancamentoSniperInput', title: 'Copy de Lançamento', tagline: 'Emails e mensagens que abrem carteira', icon: '🎯', color: 'from-red-500 to-rose-700', fields: [{k:'produtoNome',type:'text',label:'Produto'},{k:'nicho',type:'text',label:'Nicho'},{k:'dor',type:'text',label:'Dor principal do cliente'}] },
];

const root = path.join(__dirname, '..');
const apiDir = path.join(root, 'src', 'app', 'api', 'agents');
const pagesDir = path.join(root, 'src', 'app', 'agentes');

function apiTemplate(ag) {
  return `// POST /api/agents/${ag.file}
import { NextRequest, NextResponse } from 'next/server'
import { ${ag.fn} } from '@/lib/agents/v9-monetization'
import { getPlanForUser } from '@/lib/agents/plans'
import { getUsage, setUsage, trackUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let userId = 'anon'
    let userPlano = 'free'
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        userId = data.user.id
        const { data: profile } = await supabase
          .from('profiles').select('plano,role').eq('id', userId).single()
        userPlano = (profile as any)?.plano || 'free'
      }
    } catch { /* anon ok */ }

    const input = await request.json()
    const plan = getPlanForUser({ plano: userPlano as any })
    const result = await ${ag.fn}(input, { userId, plan } as any)

    if (userId !== 'anon') {
      try {
        const u = getUsage(userId)
        u.copiesHoje = (u.copiesHoje || 0) + 1
        setUsage(userId, u)
        trackUsage(userId, '${ag.file}')
      } catch { /* ignore */ }
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro interno' }, { status: 500 })
  }
}
`;
}

function pageTemplate(ag) {
  const icon = ag.icon;
  const fieldsCode = ag.fields.map(f => {
    if (f.type === 'select') {
      return `<Field label="${f.label}">
          <select value={input.${f.k} || ''} onChange={e => setInput({ ...input, ${f.k}: e.target.value })} className={selectClass}>
            <option value="">Selecione...</option>
            ${f.opts.map(o => `<option value="${o}">${o}</option>`).join('\n            ')}
          </select>
        </Field>`;
    }
    return `<Field label="${f.label}">
        <input type="${f.type}" value={input.${f.k} ?? ''} onChange={e => setInput({ ...input, ${f.k}: e.target.valueAsNumber || Number(e.target.value) || e.target.value })} placeholder="${f.ph || ''}" className={inputClass} />
      </Field>`;
  }).join('\n      ');

  return `'use client'
// Página auto-gerada — ${ag.title}
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [input, setInput] = useState<any>({ ${ag.fields.map(f => `${f.k}: undefined`).join(', ')} })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  async function gerar() {
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/agents/${ag.file}', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
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
          {v.map((item, i) => (
            <li key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {typeof item === 'object' ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  {Object.entries(item).map(([k, val]) => (
                    <div key={k} className="flex gap-2 items-start mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 min-w-[90px] pt-0.5">{formatarChave(k)}</span>
                      <span className="flex-1">{renderValor(val, depth+1)}</span>
                    </div>
                  ))}
                </div>
              ) : <span className="mr-1">•</span>}
              {typeof item === 'object' ? '' : renderValor(item, depth+1)}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <div className={depth === 0 ? 'space-y-3' : 'space-y-1 mt-1'}>
        {Object.entries(v).map(([k, val]) => (
          <div key={k} className={depth === 0 ? 'bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800' : 'flex gap-2 items-start'}>
            <div className={depth === 0 ? 'text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2' : 'text-[11px] font-black uppercase tracking-wider text-slate-500 min-w-[90px] pt-0.5'}>{formatarChave(k)}</div>
            <div className={depth === 0 ? '' : 'flex-1'}>{renderValor(val, depth+1)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <AgentShell
      titulo="${ag.title}" tagline="${ag.tagline}"
      icone={<span className="text-2xl">${icon}</span>} cor="${ag.color}"
      onGerar={gerar} loading={loading} labelBotao="Gerar com IA"
      output={result?.ok ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">✅ Pronto</div>
            <button onClick={copiarTudo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">{copied ? <Check className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>}{copied ? 'Copiado!' : 'Copiar'}</button>
          </div>
          {renderValor(result.data)}
        </motion.div>
      ) : result?.error ? (<div className="py-12 text-center"><p className="text-red-500 font-semibold text-sm">{result.error}</p></div>) : null}
    >
      ${fieldsCode}
    </AgentShell>
  )
}

function formatarChave(k: string) { return k.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\\b\\w/g, c => c.toUpperCase()) }
`;
}

for (const ag of agents) {
  // API
  const apiFolder = path.join(apiDir, ag.file);
  fs.mkdirSync(apiFolder, { recursive: true });
  fs.writeFileSync(path.join(apiFolder, 'route.ts'), apiTemplate(ag));
  // Página
  const pageFolder = path.join(pagesDir, ag.file);
  fs.mkdirSync(pageFolder, { recursive: true });
  fs.writeFileSync(path.join(pageFolder, 'page.tsx'), pageTemplate(ag));
}
console.log('✅', agents.length, 'novos agentes v9.1 criados (página + API)');

// Atualizar barrel index
const indexPath = path.join(root, 'src', 'lib', 'agents', 'index.ts');
let idx = fs.readFileSync(indexPath, 'utf8');
if (!idx.includes("v9-monetization")) {
  idx += "\nexport * from './v9-monetization'\n";
  const reexports = agents.map(a => `export { ${a.fn} } from './v9-monetization'\nexport type { ${a.iface} } from './v9-monetization'`).join('\n');
  // Na verdade, export * já pega tudo, mas vamos garantir
  fs.writeFileSync(indexPath, idx);
}

// Criar arquivos shim pra cada agente (pra não quebrar imports)
const libAgentsDir = path.join(root, 'src', 'lib', 'agents');
for (const ag of agents) {
  const content = `// Re-export (implementação em ./v9-monetization)\nexport { ${ag.fn} } from './v9-monetization'\nexport type { ${ag.iface} } from './v9-monetization'\n`;
  fs.writeFileSync(path.join(libAgentsDir, ag.file + '.ts'), content);
}
console.log('✅ Shims de agentes criados');
