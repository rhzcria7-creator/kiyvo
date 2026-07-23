// Gera páginas e rotas API para os novos agentes v9.0
const fs = require('fs');
const path = require('path');

// Importar o gerador para obter a lista
require('./gen-v9-agents.js');

// Ler o agent files
const agentsDir = path.join(__dirname, '..', 'src', 'lib', 'agents');
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api', 'agents');
const pagesDir = path.join(__dirname, '..', 'src', 'app', 'agentes');

// Helper para caminho kebab
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Pegar todos os agentes v9 (os novos)
const v9Files = [
  'checkoutmax','scarcitypro','provaosocialpro','emailboasvindas','leadmagnet',
  'whatsappvendas','ofertarelampago','bundlecriador','faqobjetor','quizvendas',
  'captionvendas','refundminimizer','afiliadorpro','metodohero','nomesdominio',
  'checklistvp','clientepravida','scriptbotresposta','viralloop','kdcalculator',
  'abtestideas','socialcopy','cancelasaver','seotags','precoguerra',
  'lucromax','upsellmax','carrinhoabandonado','precificacaointeligente','garantia',
];

const agentMeta = {
  checkoutmax: { title: 'CheckoutMax', tagline: 'Otimize seu checkout com gatilhos psicológicos', icon: '💳', color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  scarcitypro: { title: 'ScarcityPro', tagline: 'Escassez ÉTICA e real (nunca fake)', icon: '⏰', color: 'bg-gradient-to-br from-red-500 to-red-700' },
  provaosocialpro: { title: 'Prova Social Pro', tagline: 'Depoimentos que convencem de verdade', icon: '💬', color: 'bg-gradient-to-br from-pink-500 to-pink-700' },
  emailboasvindas: { title: 'Boas-Vindas Email', tagline: 'Sequência de onboarding que reduz refunds', icon: '📧', color: 'bg-gradient-to-br from-indigo-500 to-indigo-700' },
  leadmagnet: { title: 'Lead Magnet', tagline: 'Iscas éticas que convertem', icon: '🧲', color: 'bg-gradient-to-br from-cyan-500 to-cyan-700' },
  whatsappvendas: { title: 'WhatsApp Vendas', tagline: 'Scripts prontos para fechar no DM', icon: '💚', color: 'bg-gradient-to-br from-green-500 to-green-700' },
  ofertarelampago: { title: 'Oferta Relâmpago', tagline: 'Promoção de 24h com tudo o que precisa', icon: '⚡', color: 'bg-gradient-to-br from-yellow-500 to-yellow-700' },
  bundlecriador: { title: 'Bundle Criador', tagline: 'Combos que aumentam ticket médio', icon: '📦', color: 'bg-gradient-to-br from-orange-500 to-orange-700' },
  faqobjetor: { title: 'FAQ Objetor', tagline: 'Anteveja objeções no checkout', icon: '❓', color: 'bg-gradient-to-br from-violet-500 to-violet-700' },
  quizvendas: { title: 'Quiz de Vendas', tagline: 'Quiz que segmenta e converte 3x', icon: '🎯', color: 'bg-gradient-to-br from-purple-500 to-purple-700' },
  captionvendas: { title: 'Caption de Vendas', tagline: 'Legendas de Reels/TikTok que vendem', icon: '📱', color: 'bg-gradient-to-br from-rose-500 to-rose-700' },
  refundminimizer: { title: 'Refund Minimizer', tagline: 'Reduza reembolsos sem bloquear clientes', icon: '🛡️', color: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
  afiliadorpro: { title: 'Afiliador Pro', tagline: 'Programa de afiliados magnético', icon: '🤝', color: 'bg-gradient-to-br from-amber-500 to-amber-700' },
  metodohero: { title: 'Método Hero', tagline: 'Crie nome e promessa do seu método', icon: '🦸', color: 'bg-gradient-to-br from-sky-500 to-sky-700' },
  nomesdominio: { title: 'Nomes & Domínios', tagline: 'Sugira nomes de marca memoráveis', icon: '🏷️', color: 'bg-gradient-to-br from-teal-500 to-teal-700' },
  checklistvp: { title: 'Checklist VP', tagline: 'Checklist de página de vendas campeã', icon: '✅', color: 'bg-gradient-to-br from-lime-500 to-lime-700' },
  clientepravida: { title: 'Cliente pra Vida', tagline: 'Retenha e aumente LTV', icon: '♾️', color: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700' },
  scriptbotresposta: { title: 'Script Bot Resposta', tagline: 'Fluxos de atendimento automático', icon: '🤖', color: 'bg-gradient-to-br from-slate-500 to-slate-700' },
  viralloop: { title: 'Viral Loop', tagline: 'Crescimento por indicação ético', icon: '🔁', color: 'bg-gradient-to-br from-pink-500 to-purple-700' },
  kdcalculator: { title: 'KD Calculator', tagline: 'Calcule cashback e KD Points', icon: '🪙', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
  abtestideas: { title: 'AB Test Ideas', tagline: 'Testes com maior impacto em conversão', icon: '🧪', color: 'bg-gradient-to-br from-blue-400 to-cyan-600' },
  socialcopy: { title: 'Social Copy', tagline: 'Posts para X, Instagram, LinkedIn', icon: '✍️', color: 'bg-gradient-to-br from-red-400 to-pink-600' },
  cancelasaver: { title: 'Cancela Saver', tagline: 'Fluxo que salva cancelamento de assinatura', icon: '🔄', color: 'bg-gradient-to-br from-emerald-600 to-green-800' },
  seotags: { title: 'SEO Tags', tagline: 'Title + description otimizados', icon: '🔍', color: 'bg-gradient-to-br from-blue-600 to-indigo-800' },
  precoguerra: { title: 'Preço de Guerra', tagline: 'Precificação Black Friday sem prejuízo', icon: '⚔️', color: 'bg-gradient-to-br from-red-600 to-black' },
  lucromax: { title: 'LucroMax', tagline: 'Calculadora de lucro REAL com taxas e impostos', icon: '💰', color: 'bg-gradient-to-br from-green-600 to-emerald-800' },
  upsellmax: { title: 'UpsellMax', tagline: 'Ofertas de upsell irresistíveis', icon: '📈', color: 'bg-gradient-to-br from-orange-600 to-red-600' },
  carrinhoabandonado: { title: 'Carrinho Abandonado', tagline: 'Sequência de recuperação de vendas', icon: '🛒', color: 'bg-gradient-to-br from-amber-600 to-orange-700' },
  precificacaointeligente: { title: 'Precificação Inteligente', tagline: 'Preços psicológicos que vendem mais', icon: '🎯', color: 'bg-gradient-to-br from-purple-600 to-indigo-700' },
  garantia: { title: 'Garantia Express', tagline: 'Garantias que reduzem objeções', icon: '🛡️', color: 'bg-gradient-to-br from-blue-600 to-cyan-700' },
};

// Mapear nome de função para nome de arquivo
const fnNameFromFile = (file) => {
  const cap = file.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  // manual overrides
  const overrides = {
    checkoutmax: 'CheckoutMax',
    scarcitypro: 'ScarcityPro',
    provaosocialpro: 'ProvaSocialPro',
    emailboasvindas: 'EmailBoasVindas',
    leadmagnet: 'LeadMagnet',
    whatsappvendas: 'WhatsAppVendas',
    ofertarelampago: 'OfertaRelampago',
    bundlecriador: 'BundleCriador',
    faqobjetor: 'FAQObjetor',
    quizvendas: 'QuizVendas',
    captionvendas: 'CaptionVendas',
    refundminimizer: 'RefundMinimizer',
    afiliadorpro: 'AfiliadorPro',
    metodohero: 'MetodoHero',
    nomesdominio: 'NomesDominio',
    checklistvp: 'ChecklistPaginaVendas',
    clientepravida: 'ClientePraVida',
    scriptbotresposta: 'ScriptBotResposta',
    viralloop: 'ViralLoop',
    kdcalculator: 'KDCalculator',
    abtestideas: 'ABTestIdeas',
    socialcopy: 'SocialCopy',
    cancelasaver: 'CancelaSaver',
    seotags: 'SEOTags',
    precoguerra: 'PrecoGuerra',
    lucromax: 'LucroMax',
    upsellmax: 'UpsellMax',
    carrinhoabandonado: 'CarrinhoAbandonado',
    precificacaointeligente: 'PrecificacaoInteligente',
    garantia: 'Garantia',
  };
  return overrides[file] || cap.charAt(0).toUpperCase() + cap.slice(1);
};

// Gerar API Routes
for (const file of v9Files) {
  const fn = fnNameFromFile(file);
  const runFn = 'run' + fn;
  const apiContent = `// API route auto-gerada para agente ${fn}
import { NextRequest, NextResponse } from 'next/server'
import { createClientSSR } from '@/lib/supabase/server'
import { canUse, getPlanForUser, incrementUsage, LimitKey } from '@/lib/agents/plans'
import { createEmptyUsage, resetIfNeeded } from '@/lib/agents/plans'
import { ${runFn} } from '@/lib/agents/${file}'
import { logAgentUsage } from '@/lib/agents/storage'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClientSSR();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Faça login para usar os agentes.' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles').select('plano,role,id').eq('id', user.id).single();
    const plan = getPlanForUser(profile as any);

    let usage = createEmptyUsage();
    const { data: usageRow } = await supabase
      .from('agent_usage')
      .select('*').eq('user_id', user.id).maybeSingle();
    if (usageRow) usage = resetIfNeeded(usageRow as any);

    const input = await req.json();
    const result = await ${runFn}(input, { userId: user.id, plan });

    await logAgentUsage(supabase, user.id, '${file}', result.ok);

    // Incrementa o uso (copies por dia como genérico)
    const nextUsage = incrementUsage(usage, 'copiesPorDia');
    await supabase.from('agent_usage').upsert({
      user_id: user.id,
      copies_hoje: nextUsage.copiesHoje,
      reset_at: nextUsage.resetAt,
    }, { onConflict: 'user_id' });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro interno' }, { status: 500 });
  }
}
`;
  const dir = path.join(apiDir, file);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'route.ts'), apiContent);
}
console.log('✅', v9Files.length, 'rotas API criadas');

// Gerar páginas UI
// Identificar campos a partir de cada agente
const agentFieldInfo = {
  checkoutmax: [
    { k: 'produtoNome', label: 'Nome do produto', type: 'text', ph: 'Ex: Curso de Marketing Digital' },
    { k: 'preco', label: 'Preço (R$)', type: 'number', ph: '97' },
    { k: 'nicho', label: 'Nicho', type: 'text', ph: 'Ex: marketing digital' },
  ],
  scarcitypro: [
    { k: 'produtoNome', label: 'Nome do produto', type: 'text' },
    { k: 'estoque', label: 'Vagas/estoque real', type: 'number', ph: '20' },
    { k: 'preco', label: 'Preço atual (R$)', type: 'number', ph: '97' },
  ],
  provaosocialpro: [
    { k: 'produtoNome', label: 'Nome do produto', type: 'text' },
    { k: 'tipo', label: 'Tipo', type: 'select', opts: ['Depoimentos','Reviews','Prints','Casos de sucesso'] },
  ],
  emailboasvindas: [
    { k: 'produtoNome', label: 'Nome do produto', type: 'text' },
  ],
  leadmagnet: [
    { k: 'nicho', label: 'Nicho', type: 'text' },
    { k: 'publico', label: 'Público alvo', type: 'text' },
  ],
  whatsappvendas: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'preco', label: 'Preço (R$)', type: 'number' },
  ],
  ofertarelampago: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'precoNormal', label: 'Preço normal', type: 'number' },
    { k: 'desconto', label: 'Desconto %', type: 'number', ph: '50' },
  ],
  bundlecriador: [
    { k: 'produto1', label: 'Produto principal', type: 'text' },
    { k: 'preco1', label: 'Preço prod. principal', type: 'number' },
    { k: 'produto2', label: 'Complementar', type: 'text' },
    { k: 'preco2', label: 'Preço complementar', type: 'number' },
  ],
  faqobjetor: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
  ],
  quizvendas: [
    { k: 'nicho', label: 'Nicho', type: 'text' },
    { k: 'produtoNome', label: 'Produto final', type: 'text' },
  ],
  captionvendas: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'nicho', label: 'Nicho', type: 'text' },
  ],
  refundminimizer: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
  ],
  afiliadorpro: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'preco', label: 'Preço (R$)', type: 'number' },
    { k: 'comissao', label: 'Comissão %', type: 'number', ph: '50' },
  ],
  metodohero: [
    { k: 'nicho', label: 'Nicho', type: 'text' },
    { k: 'resultado', label: 'Resultado entregue', type: 'text' },
    { k: 'dias', label: 'Prazo em dias', type: 'number', ph: '21' },
  ],
  nomesdominio: [
    { k: 'nicho', label: 'Nicho', type: 'text' },
  ],
  checklistvp: [],
  clientepravida: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'ticketMedio', label: 'Ticket médio (R$)', type: 'number' },
  ],
  scriptbotresposta: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'preco', label: 'Preço (R$)', type: 'number' },
  ],
  viralloop: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'recompensa', label: 'Recompensa', type: 'text', ph: 'R$50 em crédito' },
  ],
  kdcalculator: [
    { k: 'valorCompra', label: 'Valor da compra (R$)', type: 'number' },
    { k: 'plano', label: 'Plano', type: 'select', opts: ['free','plus','pro','vendor_pro'] },
  ],
  abtestideas: [
    { k: 'pagina', label: 'Página', type: 'select', opts: ['checkout','landing','anuncio','email','product-page'] },
  ],
  socialcopy: [
    { k: 'tema', label: 'Tema', type: 'text' },
  ],
  cancelasaver: [
    { k: 'plano', label: 'Nome do plano', type: 'text' },
    { k: 'preco', label: 'Preço mensal', type: 'number' },
  ],
  seotags: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'categoria', label: 'Categoria', type: 'text' },
  ],
  precoguerra: [
    { k: 'precoNormal', label: 'Preço normal', type: 'number' },
    { k: 'custo', label: 'Custo do produto', type: 'number' },
  ],
  lucromax: [
    { k: 'precoVenda', label: 'Preço de venda (R$)', type: 'number' },
    { k: 'custoProduto', label: 'Custo do produto', type: 'number', ph: '0' },
    { k: 'planoVendedor', label: 'Seu plano KIYVO', type: 'select', opts: ['free','plus','pro','vendor_pro'] },
    { k: 'afiliadoPercent', label: 'Comissão afiliado %', type: 'number', ph: '0' },
    { k: 'incluirImpostos', label: 'Incluir impostos (Simples)', type: 'select', opts: ['não','sim'] },
  ],
  upsellmax: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'preco', label: 'Preço (R$)', type: 'number' },
    { k: 'nicho', label: 'Nicho', type: 'text' },
  ],
  carrinhoabandonado: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'preco', label: 'Preço (R$)', type: 'number' },
    { k: 'linkCheckout', label: 'Link do checkout', type: 'text' },
  ],
  precificacaointeligente: [
    { k: 'custo', label: 'Custo do produto', type: 'number' },
    { k: 'nicho', label: 'Nicho', type: 'text' },
    { k: 'qualidadade', label: 'Qualidade', type: 'select', opts: ['basica','premium','ultra'] },
  ],
  garantia: [
    { k: 'produtoNome', label: 'Produto', type: 'text' },
    { k: 'nicho', label: 'Nicho', type: 'text' },
    { k: 'tipo', label: 'Tipo de garantia', type: 'select', opts: ['incondicional','resultado','estendida','risco_zero'] },
  ],
};

function renderField(f) {
  if (f.type === 'select') {
    return `<Field label="${f.label}">
          <select value={input.${f.k} || ''} onChange={e => setInput({ ...input, ${f.k}: e.target.value })} className={selectClass}>
            <option value="">Selecione...</option>
            ${f.opts.map(o => `<option value="${o}">${o}</option>`).join('\n            ')}
          </select>
        </Field>`;
  }
  return `<Field label="${f.label}">
        <input type="${f.type}" value={input.${f.k} || ''} onChange={e => setInput({ ...input, ${f.k}: e.target.value })} placeholder="${f.ph || ''}" className={inputClass} />
      </Field>`;
}

for (const file of v9Files) {
  const meta = agentMeta[file];
  if (!meta) { console.log('sem meta para', file); continue; }
  const fields = agentFieldInfo[file] || [];
  const inputInit = fields.map(f => {
    if (f.type === 'number') return `${f.k}: undefined as number | undefined`;
    return `${f.k}: ''`;
  }).join(', ') || '_dummy: 0';

  const pageContent = `'use client'
// Página auto-gerada para o agente ${meta.title} (KIYVO v9.0)
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

const ICON = ${JSON.stringify(meta.icon)}

export default function Page() {
  const [input, setInput] = useState<any>({ ${fields.map(f => `${f.k}: ${f.type === 'number' ? 'undefined' : "''"}`).join(', ')} })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  async function gerar() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/agents/${file}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  function copiarTudo() {
    const texto = typeof result?.data === 'object' ? JSON.stringify(result.data, null, 2) : String(result?.data || '')
    navigator.clipboard.writeText(texto).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function renderValor(v: any, depth = 0): React.ReactNode {
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>
    if (typeof v !== 'object') {
      return <span className="text-slate-800 dark:text-slate-100">{String(v)}</span>
    }
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
              ) : (
                <span className="mr-1">•</span>
              )}
              {renderValor(item, depth+1)}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <div className={depth === 0 ? 'space-y-3' : 'space-y-1 mt-1'}>
        {Object.entries(v).map(([k, val]) => (
          <div key={k} className={depth === 0 ? 'bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800' : 'flex gap-2 items-start'}>
            <div className={depth === 0 ? 'text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2' : 'text-[11px] font-black uppercase tracking-wider text-slate-500 min-w-[90px] pt-0.5'}>
              {formatarChave(k)}
            </div>
            <div className={depth === 0 ? '' : 'flex-1'}>{renderValor(val, depth+1)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <AgentShell
      titulo="${meta.title}"
      tagline="${meta.tagline}"
      icone={<span className="text-2xl">{ICON}</span>}
      cor="${meta.color}"
      onGerar={gerar}
      loading={loading}
      labelBotao="Gerar com IA"
      output={
        result?.ok ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                ✅ Pronto
              </div>
              <button onClick={copiarTudo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            {renderValor(result.data)}
          </motion.div>
        ) : result?.error ? (
          <div className="py-12 text-center">
            <p className="text-red-500 font-semibold text-sm">{result.error}</p>
          </div>
        ) : null
      }
    >
      ${fields.map(renderField).join('\n      ')}
    </AgentShell>
  )
}

function formatarChave(k: string) {
  return k.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\\b\\w/g, c => c.toUpperCase())
}
`;
  const dir = path.join(pagesDir, file);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), pageContent);
}
console.log('✅', v9Files.length, 'páginas criadas');

// Middleware whitelist
const mwPath = path.join(__dirname, '..', 'src', 'middleware.ts');
let mw = fs.readFileSync(mwPath, 'utf8');
const whitelistMarker = '// FIM DA WHITELIST';
const newRoutes = v9Files.map(f => `  '/agentes/${f}', '/api/agents/${f}',`).join('\n');
if (!mw.includes(`/agentes/${v9Files[0]}`)) {
  mw = mw.replace(whitelistMarker, newRoutes + '\n' + whitelistMarker);
  fs.writeFileSync(mwPath, mw);
  console.log('✅ middleware.ts atualizado');
}

// Atualizar hub de agentes
const hubPath = path.join(pagesDir, 'page.tsx');
let hub = fs.readFileSync(hubPath, 'utf8');

// Criar um array com novos agentes pro hub
const newAgentsForHub = v9Files.map(file => {
  const meta = agentMeta[file];
  return `  { id: '${file}', nome: ${JSON.stringify(meta.title)}, desc: ${JSON.stringify(meta.tagline)}, icone: ${JSON.stringify(meta.icon)}, cor: '${meta.color}', categoria: 'Vendas & Monetização', rota: '/agentes/${file}' },`;
}).join('\n');

const hubMarker = '// === FIM DOS AGENTES ===';
if (!hub.includes(`id: '${v9Files[0]}'`)) {
  hub = hub.replace(hubMarker, newAgentsForHub + '\n' + hubMarker);
  fs.writeFileSync(hubPath, hub);
  console.log('✅ Hub atualizado');
}

console.log('\n🎉 Tudo pronto!', v9Files.length, 'agentes adicionados');
