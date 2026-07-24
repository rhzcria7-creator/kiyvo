// Script utilitário — gerador de páginas de agentes (executado uma vez)
// Gera páginas .tsx simples seguindo o padrão AgentShell
const fs = require('fs')
const path = require('path')

const agents = [
  {
    slug: 'automod', nome: 'AutoMod', tagline: 'Moderação automática de comentários, reviews e mensagens em tempo real',
    icone: 'Shield', cor: 'from-red-500 to-rose-600', api: '/api/agents/automod', method: 'POST',
    fields: [
      { name: 'texto', label: 'Texto para analisar', type: 'textarea', ph: 'Digite ou cole o comentário/mensagem...' },
      { name: 'contexto', label: 'Contexto', type: 'select', options: ['comentario', 'review', 'mensagem', 'perfil', 'anuncio'] },
    ],
    resultKey: null, renderType: 'automod',
  },
  {
    slug: 'dynamicpricing', nome: 'DynamicPricing', tagline: 'Preço dinâmico inteligente baseado em oferta, demanda e horário',
    icone: 'LineChart', cor: 'from-blue-500 to-indigo-600', api: '/api/agents/dynamicpricing', method: 'POST',
    fields: [
      { name: 'precoBase', label: 'Preço base (R$)', type: 'number', ph: '97' },
      { name: 'custo', label: 'Custo (opcional)', type: 'number', ph: '20' },
      { name: 'estoque', label: 'Estoque', type: 'number', ph: '50' },
      { name: 'views', label: 'Views últimos 7 dias', type: 'number', ph: '300' },
      { name: 'vendas', label: 'Vendas últimos 7 dias', type: 'number', ph: '12' },
    ],
    resultKey: null, renderType: 'dynamicpricing',
  },
  {
    slug: 'churnpredictor', nome: 'ChurnPredictor', tagline: 'Prediz risco de evasão de usuários e cria ações de retenção',
    icone: 'UserX', cor: 'from-orange-500 to-red-600', api: '/api/agents/churnpredictor', method: 'POST',
    fields: [
      { name: 'totalCompras', label: 'Total de compras', type: 'number', ph: '3' },
      { name: 'diasCompra', label: 'Dias desde última compra', type: 'number', ph: '45' },
      { name: 'diasLogin', label: 'Dias desde último login', type: 'number', ph: '10' },
      { name: 'abandonos', label: 'Abandonos de carrinho', type: 'number', ph: '2' },
      { name: 'plano', label: 'Plano', type: 'select', options: ['free', 'plus', 'pro', 'vendor_pro'] },
    ],
    resultKey: null, renderType: 'churn',
  },
  {
    slug: 'smartcart', nome: 'SmartCart', tagline: 'Carrinho inteligente com upsell, cross-sell e descontos automáticos',
    icone: 'ShoppingCart', cor: 'from-emerald-500 to-teal-600', api: '/api/agents/smartcart', method: 'POST',
    fields: [
      { name: 'totalAtual', label: 'Total atual (R$)', type: 'number', ph: '97' },
      { name: 'itensJSON', label: 'Itens (JSON array)', type: 'textarea', ph: '[{"titulo":"Curso X","preco":97,"categoria":"marketing"}]' },
    ],
    resultKey: null, renderType: 'smartcart',
  },
  {
    slug: 'retargetpredictor', nome: 'RetargetPredictor', tagline: 'Qual lead precisa de retargeting, canal ideal e oferta perfeita',
    icone: 'Target', cor: 'from-cyan-500 to-blue-600', api: '/api/agents/retargetpredictor', method: 'POST',
    fields: [
      { name: 'visitou', label: 'Visitou o produto?', type: 'select', options: ['true', 'false'] },
      { name: 'addCart', label: 'Adicionou no carrinho?', type: 'select', options: ['false', 'true'] },
      { name: 'checkout', label: 'Iniciou checkout?', type: 'select', options: ['false', 'true'] },
      { name: 'comprou', label: 'Comprou?', type: 'select', options: ['false', 'true'] },
      { name: 'valor', label: 'Valor carrinho (R$)', type: 'number', ph: '97' },
    ],
    resultKey: null, renderType: 'retarget',
  },
  {
    slug: 'thumbnailmaker', nome: 'ThumbnailMaker', tagline: 'Gera thumbnails SVG prontos para YouTube/TikTok/Reels',
    icone: 'ImageIcon', cor: 'from-pink-500 to-rose-600', api: '/api/agents/thumbnailmaker', method: 'POST',
    fields: [
      { name: 'titulo', label: 'Título do vídeo', type: 'text', ph: 'Como ganhar dinheiro online em 2026' },
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing' },
      { name: 'estilo', label: 'Formato', type: 'select', options: ['youtube', 'tiktok', 'instagram_reels', 'curso', 'produto'] },
    ],
    resultKey: null, renderType: 'thumbnail',
  },
  {
    slug: 'scriptshort', nome: 'ScriptShort', tagline: 'Roteiros prontos para TikTok / Reels / Shorts em 15s, 30s ou 60s',
    icone: 'Video', cor: 'from-fuchsia-500 to-purple-600', api: '/api/agents/scriptshort', method: 'POST',
    fields: [
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing digital' },
      { name: 'topico', label: 'Tópico específico', type: 'text', ph: 'vender no instagram' },
      { name: 'duracao', label: 'Duração', type: 'select', options: ['15s', '30s', '60s'] },
      { name: 'tom', label: 'Tom', type: 'select', options: ['curioso', 'iniciante', 'urgente', 'divertido', 'autoridade'] },
    ],
    resultKey: null, renderType: 'scriptshort',
  },
  {
    slug: 'offerstacker', nome: 'OfferStacker', tagline: 'Monta a stack completa de ofertas: lead magnet → front-end → bump → upsell → downsell',
    icone: 'Layers', cor: 'from-amber-500 to-orange-600', api: '/api/agents/offerstacker', method: 'POST',
    fields: [
      { name: 'produto', label: 'Nome do produto', type: 'text', ph: 'Curso de Marketing Digital' },
      { name: 'precoBase', label: 'Preço base (R$)', type: 'number', ph: '97' },
      { name: 'valorPercebido', label: 'Valor percebido (R$)', type: 'number', ph: '997' },
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing' },
    ],
    resultKey: null, renderType: 'offerstacker',
  },
  {
    slug: 'voiceclonepreview', nome: 'VoicePrep', tagline: 'Prepara roteiros para narração em áudio/voz (tom, pausas, velocidade)',
    icone: 'Mic', cor: 'from-teal-500 to-emerald-600', api: '/api/agents/voiceclonepreview', method: 'POST',
    fields: [
      { name: 'texto', label: 'Roteiro para narrar', type: 'textarea', ph: 'Cole aqui o texto...' },
      { name: 'tom', label: 'Tom de voz', type: 'select', options: ['amigavel', 'autoridade', 'urgente', 'calmo', 'vendedor'] },
    ],
    resultKey: null, renderType: 'voice',
  },
  {
    slug: 'landingchecker', nome: 'LandingChecker', tagline: 'Audita sua landing page com nota A+ a E e mostra exatamente o que corrigir',
    icone: 'LayoutTemplate', cor: 'from-indigo-500 to-blue-600', api: '/api/agents/landingchecker', method: 'POST',
    fields: [
      { name: 'heroTitulo', label: 'Título hero', type: 'text', ph: 'Aprenda marketing digital em 30 dias' },
      { name: 'heroSubtitulo', label: 'Subtítulo hero', type: 'text', ph: 'Mesmo que você seja iniciante...' },
      { name: 'preco', label: 'Preço (R$)', type: 'number', ph: '97' },
      { name: 'temCTA', label: 'Tem CTA acima da dobra?', type: 'select', options: ['true', 'false'] },
      { name: 'temDepoimentos', label: 'Tem depoimentos?', type: 'select', options: ['true', 'false'] },
      { name: 'temGarantia', label: 'Tem garantia?', type: 'select', options: ['true', 'false'] },
      { name: 'temFAQ', label: 'Tem FAQ?', type: 'select', options: ['false', 'true'] },
      { name: 'publico', label: 'Público alvo', type: 'text', ph: 'iniciantes em marketing' },
    ],
    resultKey: null, renderType: 'landing',
  },
  {
    slug: 'reviewreplier', nome: 'ReviewReplier', tagline: 'Respostas prontas e personalizadas para avaliações (1★ a 5★)',
    icone: 'MessageSquareText', cor: 'from-sky-500 to-blue-600', api: '/api/agents/reviewreplier', method: 'POST',
    fields: [
      { name: 'nota', label: 'Nota recebida', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { name: 'comentario', label: 'Comentário do cliente', type: 'textarea', ph: 'O cliente escreveu...' },
      { name: 'nome', label: 'Nome do cliente', type: 'text', ph: 'Maria Silva' },
      { name: 'tom', label: 'Tom', type: 'select', options: ['amigavel', 'profissional', 'formal', 'carismático'] },
    ],
    resultKey: null, renderType: 'reviewreply',
  },
  {
    slug: 'competitormonitor', nome: 'CompetitorMonitor', tagline: 'Analisa concorrentes e mostra gaps de oportunidade e ameaças',
    icone: 'Radar', cor: 'from-violet-500 to-purple-600', api: '/api/agents/competitormonitor', method: 'POST',
    fields: [
      { name: 'seuProduto', label: 'Seu produto', type: 'text', ph: 'Curso de Marketing' },
      { name: 'seuPreco', label: 'Seu preço (R$)', type: 'number', ph: '97' },
      { name: 'concorrentesJSON', label: 'Concorrentes (JSON)', type: 'textarea', ph: '[{"nome":"Hotmart X","preco":197,"nota":4.5}]' },
    ],
    resultKey: null, renderType: 'competitor',
  },
  {
    slug: 'socialproofengine', nome: 'SocialProofEngine', tagline: 'Mensagens de prova social automáticas ("fulano comprou há 2 min")',
    icone: 'Users', cor: 'from-pink-500 to-rose-600', api: '/api/agents/socialproofengine', method: 'POST',
    fields: [
      { name: 'produtoNome', label: 'Produto', type: 'text', ph: 'Curso X' },
      { name: 'produtoPreco', label: 'Preço (R$)', type: 'number', ph: '97' },
      { name: 'cenario', label: 'Cenário', type: 'select', options: ['produto', 'carrinho', 'checkout', 'home'] },
    ],
    resultKey: null, renderType: 'socialproof',
  },
  {
    slug: 'quizfunnel', nome: 'QuizFunnel', tagline: 'Cria funis de quiz em minutos para segmentar leads e vender mais',
    icone: 'HelpCircle', cor: 'from-emerald-500 to-green-600', api: '/api/agents/quizfunnel', method: 'POST',
    fields: [
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing digital' },
      { name: 'produto', label: 'Produto a recomendar', type: 'text', ph: 'Curso Completo' },
      { name: 'qtd', label: 'Quantas perguntas', type: 'number', ph: '5' },
    ],
    resultKey: null, renderType: 'quizfunnel',
  },
  {
    slug: 'seobriefing', nome: 'SEOBriefing', tagline: 'Briefing completo de SEO com headings, FAQs, schema e tamanho ideal',
    icone: 'Search', cor: 'from-green-500 to-emerald-600', api: '/api/agents/seobriefing', method: 'POST',
    fields: [
      { name: 'palavraChave', label: 'Palavra-chave principal', type: 'text', ph: 'como ganhar dinheiro online' },
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing' },
      { name: 'tipo', label: 'Tipo de página', type: 'select', options: ['blog', 'pagina_produto', 'landing', 'categoria'] },
    ],
    resultKey: null, renderType: 'seobrief',
  },
  {
    slug: 'contentauditor', nome: 'ContentAuditor', tagline: 'Auditor LGPD/CDC/SEO em produtos e páginas — detecta promessas ilegais',
    icone: 'ShieldCheck', cor: 'from-slate-700 to-slate-900', api: '/api/agents/contentauditor', method: 'POST',
    fields: [
      { name: 'titulo', label: 'Título', type: 'text', ph: 'Curso de Marketing Digital' },
      { name: 'descricao', label: 'Descrição', type: 'textarea', ph: 'Descrição completa...' },
      { name: 'preco', label: 'Preço (R$)', type: 'number', ph: '97' },
      { name: 'imagens', label: 'Qtd imagens', type: 'number', ph: '3' },
    ],
    resultKey: null, renderType: 'contentaudit',
  },
  {
    slug: 'emojipicker', nome: 'EmojiPicker', tagline: 'Escolhe emojis relevantes para o seu texto e formata bullets',
    icone: 'Smile', cor: 'from-yellow-400 to-orange-500', api: '/api/agents/emojipicker', method: 'POST',
    fields: [
      { name: 'texto', label: 'Texto', type: 'textarea', ph: 'Checklist de lançamento para novos produtores' },
      { name: 'qtd', label: 'Qtd emojis', type: 'number', ph: '3' },
      { name: 'posicao', label: 'Posição', type: 'select', options: ['bullet', 'inicio', 'final'] },
    ],
    resultKey: null, renderType: 'emojipicker',
  },
  {
    slug: 'launchchecklist', nome: 'LaunchChecklist', tagline: 'Checklist COMPLETO de lançamento do D-14 ao D+7',
    icone: 'ListChecks', cor: 'from-blue-500 to-cyan-600', api: '/api/agents/launchchecklist', method: 'POST',
    fields: [
      { name: 'tipo', label: 'Tipo de lançamento', type: 'select', options: ['produto_novo', 'relancamento', 'blackfriday', 'evergreen'] },
      { name: 'dias', label: 'Dias até o lançamento', type: 'number', ph: '14' },
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing' },
    ],
    resultKey: null, renderType: 'launchchecklist',
  },
  {
    slug: 'personacraft', nome: 'PersonaCraft', tagline: 'Cria personas completas e anti-personas com dores, desejos e objeções',
    icone: 'UserCircle', cor: 'from-fuchsia-500 to-pink-600', api: '/api/agents/personacraft', method: 'POST',
    fields: [
      { name: 'nicho', label: 'Nicho', type: 'text', ph: 'marketing digital' },
      { name: 'produto', label: 'Produto', type: 'text', ph: 'Curso Completo' },
    ],
    resultKey: null, renderType: 'persona',
  },
  {
    slug: 'urgenciamaker', nome: 'UrgenciaMaker', tagline: 'Linhas honestas de urgência e escassez (estoque, timer, vagas)',
    icone: 'Flame', cor: 'from-red-500 to-orange-500', api: '/api/agents/urgenciamaker', method: 'POST',
    fields: [
      { name: 'tipo', label: 'Tipo', type: 'select', options: ['tempo', 'estoque', 'vagas', 'bonus'] },
      { name: 'estoque', label: 'Estoque atual', type: 'number', ph: '5' },
      { name: 'vagas', label: 'Vagas', type: 'number', ph: '20' },
      { name: 'bonus', label: 'Bônus exclusivo', type: 'text', ph: 'Mentoria 1:1' },
      { name: 'promocaoAte', label: 'Promoção até (data ISO)', type: 'text', ph: new Date(Date.now() + 86400000).toISOString().slice(0,10) },
    ],
    resultKey: null, renderType: 'urgencia',
  },
  {
    slug: 'metricsanalyzer', nome: 'MetricsAnalyzer', tagline: 'Diagnóstico completo de métricas com ações prioritárias',
    icone: 'BarChart3', cor: 'from-indigo-500 to-purple-600', api: '/api/agents/metricsanalyzer', method: 'POST',
    fields: [
      { name: 'visitas', label: 'Visitas', type: 'number', ph: '1000' },
      { name: 'cart', label: 'Add ao carrinho', type: 'number', ph: '80' },
      { name: 'checkout', label: 'Checkouts iniciados', type: 'number', ph: '40' },
      { name: 'compras', label: 'Compras', type: 'number', ph: '15' },
      { name: 'receita', label: 'Receita (R$)', type: 'number', ph: '1455' },
      { name: 'reembolsos', label: 'Reembolsos', type: 'number', ph: '1' },
    ],
    resultKey: null, renderType: 'metrics',
  },
  {
    slug: 'webhooktester', nome: 'WebhookTester', tagline: 'Gera payloads de teste e comando curl para webhooks',
    icone: 'Webhook', cor: 'from-slate-600 to-slate-800', api: '/api/agents/webhooktester', method: 'POST',
    fields: [
      { name: 'evento', label: 'Evento', type: 'select', options: ['compra_aprovada', 'compra_recusada', 'reembolso', 'pix_gerado', 'pix_pago', 'cupom_usado', 'novo_lead', 'review_novo'] },
      { name: 'produto', label: 'Produto', type: 'text', ph: 'Produto Teste' },
      { name: 'valor', label: 'Valor (R$)', type: 'number', ph: '97' },
    ],
    resultKey: null, renderType: 'webhook',
  },
]

// Mapa de ícones Lucide
const iconImports = new Set()
function getIcon(ic) { iconImports.add(ic); return ic }
agents.forEach(a => getIcon(a.icone))
iconImports.add('Sparkles'); iconImports.add('Loader2'); iconImports.add('ArrowRight')

function esc(s) { return String(s).replace(/"/g, '&quot;') }
function renderField(f) {
  const ph = esc(f.ph)
  if (f.type === 'textarea') return `<textarea className={textareaClass} value={form.${f.name} as string} onChange={e => setForm({...form, ${f.name}: e.target.value})} placeholder={"${ph}"} />`
  if (f.type === 'select') {
    const opts = f.options.map(o => `<option value={${JSON.stringify(o)}}>${o}</option>`).join('')
    return `<select className={selectClass} value={form.${f.name} as string} onChange={e => setForm({...form, ${f.name}: e.target.value})}>${opts}</select>`
  }
  if (f.type === 'number') return `<input type="number" className={inputClass} value={form.${f.name} as string} onChange={e => setForm({...form, ${f.name}: e.target.value})} placeholder={"${ph}"} />`
  return `<input className={inputClass} value={form.${f.name} as string} onChange={e => setForm({...form, ${f.name}: e.target.value})} placeholder={"${ph}"} />`
}

function renderResultFor(renderType) {
  switch (renderType) {
    case 'automod': return `{result && (
        <div className="space-y-4">
          <div className={\`p-5 rounded-2xl \${result.aprovado ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}\`}>
            <div className="text-2xl font-black \${result.aprovado ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}">
              {result.aprovado ? '✅ APROVADO' : '🚫 BLOQUEADO'}
            </div>
            <div className="text-sm mt-1 text-slate-600 dark:text-slate-400">Score de risco: {result.score}/100</div>
            {result.motivoBloqueio && <div className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">{result.motivoBloqueio}</div>}
          </div>
          {result.categorias.length > 0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Categorias detectadas</div><div className="flex flex-wrap gap-2">{result.categorias.map((c: string, i: number) => <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">{c}</span>)}</div></div>}
          {result.sugestao && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Sugestão limpa</div><div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] text-sm">{result.sugestao}</div></div>}
        </div>
      )}`
    case 'dynamicpricing': return `{result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">Preço Sugerido</div><div className="text-2xl font-black text-blue-700 dark:text-blue-200">R$ {result.precoPsicologico.toFixed(2)}</div></div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Margem</div><div className="text-2xl font-black text-emerald-700 dark:text-emerald-200">{result.margemLiquida}%</div></div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">Faixa</div><div className="text-sm font-bold text-amber-700 dark:text-amber-200">R$ {result.precoMinimo.toFixed(2)} - R$ {result.precoMaximo.toFixed(2)}</div></div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Estratégia</div><p className="font-bold text-sm">{result.estrategia}</p><ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">{result.razoes.map((r: string, i: number) => <li key={i}>• {r}</li>)}</ul></div>
        </div>
      )}`
    case 'churn': return `{result && (
        <div className="space-y-4">
          <div className={\`p-5 rounded-2xl text-white \${result.risco==='critico'?'bg-gradient-to-br from-red-600 to-rose-600':result.risco==='alto'?'bg-gradient-to-br from-orange-500 to-red-500':result.risco==='medio'?'bg-gradient-to-br from-amber-500 to-orange-500':'bg-gradient-to-br from-emerald-500 to-green-600'}\`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">Risco de evasão</div>
            <div className="text-3xl font-black uppercase mt-1">{result.risco}</div>
            <div className="text-sm mt-1 opacity-90">Score: {result.score}/100</div>
            <p className="mt-3 text-sm">{result.mensagemKiya}</p>
          </div>
          {(result.ofertaKD || result.ofertaCupom) && <div className="flex gap-2">{result.ofertaCupom && <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-xs font-black">🎟️ Cupom {result.ofertaCupom}</span>}{result.ofertaKD ? <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-black">⭐ {result.ofertaKD} KD Points</span> : null}</div>}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Ações recomendadas</div><ul className="space-y-1 text-sm">{result.acoesRecomendadas.map((a: string, i: number) => <li key={i} className="flex gap-2"><span>→</span><span>{a}</span></li>)}</ul></div>
        </div>
      )}`
    case 'smartcart': return `{result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Subtotal</div><div className="text-lg font-black">R$ {result.subtotal.toFixed(2)}</div></div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-300">Desc. KD</div><div className="text-lg font-black text-emerald-700 dark:text-emerald-300">-R$ {result.descontoKD.toFixed(2)}</div></div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">Combo</div><div className="text-lg font-black text-amber-700 dark:text-amber-300">-R$ {result.descontoBundle.toFixed(2)}</div></div>
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20"><div className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-300">Final</div><div className="text-lg font-black text-brand-700 dark:text-brand-300">R$ {result.totalFinal.toFixed(2)}</div></div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300 text-sm font-bold">🎉 Você economizou R$ {result.economiaTotal.toFixed(2)}</div>
          {result.upsellRecomendados.length > 0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">⬆️ Upsell</div><div className="space-y-2">{result.upsellRecomendados.map((u: any, i: number) => <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center"><div><div className="text-sm font-bold">{u.titulo}</div><div className="text-xs text-slate-500">{u.razao}</div></div><div className="font-black text-brand-500">R$ {u.preco.toFixed(2)}</div></div>)}</div></div>}
        </div>
      )}`
    case 'retarget': return `{result && (
        <div className="space-y-4">
          <div className={\`p-5 rounded-2xl text-white \${result.deveRetarget?'bg-gradient-to-br from-red-600 to-orange-500':'bg-gradient-to-br from-slate-500 to-slate-700'}\`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">Retargeting</div>
            <div className="text-3xl font-black uppercase mt-1">{result.deveRetarget ? 'ATIVAR' : 'NÃO ATIVAR'}</div>
            <div className="text-sm mt-1 opacity-90">Prioridade: {result.prioridade}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Melhor canal</div><div className="text-lg font-black uppercase">{result.melhorCanal}</div></div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">Timing</div><div className="text-lg font-black">em {result.timingHoras}h</div></div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20"><div className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300 mb-1">Oferta</div><div className="text-sm font-bold">{result.oferta.tipo} — {result.oferta.texto}</div><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">"{result.mensagem}"</p></div>
        </div>
      )}`
    case 'thumbnail': return `{result && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700" dangerouslySetInnerHTML={{__html: result.svg}} />
          <div className="grid grid-cols-4 gap-2"><div className="aspect-square rounded-xl" style={{background:result.paleta.fundo}} /><div className="aspect-square rounded-xl" style={{background:result.paleta.primaria}} /><div className="aspect-square rounded-xl" style={{background:result.paleta.secundaria}} /><div className="aspect-square rounded-xl" style={{background:result.paleta.texto}} /></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas profissionais</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.dicas.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}`
    case 'scriptshort': return `{result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">{result.duracao} · {result.titulo}</div><p className="mt-2 font-bold">{result.hook}</p></div>
          <div className="space-y-3">{result.cenas.map((c: any, i: number) => <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A] border-l-4 border-fuchsia-500"><div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-1"><span>{c.tempo}</span></div><p className="text-sm font-medium">{c.falas}</p>{c.textoTela && <div className="mt-2 text-xs font-black uppercase bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 rounded-lg px-2 py-1 inline-block">{c.textoTela}</div>}<div className="text-xs text-slate-500 mt-2">🎬 {c.visual}</div></motion.div>)}</div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300 mb-1">CTA final</div><p className="text-sm font-bold">{result.callToAction}</p><div className="mt-2 flex flex-wrap gap-1">{result.hashtags.map((h: string, i: number) => <span key={i} className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-semibold">{h}</span>)}</div></div>
        </div>
      )}`
    case 'offerstacker': return `{result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">Ticket médio estimado</div><div className="text-2xl font-black text-amber-700 dark:text-amber-200">R$ {result.ticketMedioEstimado.toFixed(2)}</div></div><div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20"><div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-300">LTV estimado</div><div className="text-2xl font-black text-emerald-700 dark:text-emerald-200">R$ {result.ltvEstimado.toFixed(2)}</div></div></div>
          <div className="space-y-2"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Stack de ofertas</div>{result.ofertas.map((o: any, i: number) => <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="flex justify-between items-start"><div><div className="text-[10px] font-black uppercase text-brand-500">{o.tipo}</div><div className="font-bold text-sm mt-0.5">{o.nome}</div><p className="text-xs text-slate-500 mt-1">{o.descricao}</p></div><div className="text-right"><div className="font-black text-lg">{o.preco===0?'GRÁTIS':'R$ '+o.preco.toFixed(2)}</div><div className="text-xs text-emerald-600">Valor: R$ {o.valor.toFixed(2)}</div></div></div></div>)}</div>
        </div>
      )}`
    case 'voice': return `{result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20"><div className="flex justify-between items-center"><div><div className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-300">Tom recomendado</div><div className="text-sm font-bold mt-1">{result.tomRecomendado}</div></div><div className="text-right"><div className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-300">Velocidade</div><div className="text-2xl font-black">{result.velocidade}x</div></div><div className="text-right"><div className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-300">Duração</div><div className="text-2xl font-black">{result.duracaoEstimadaSec}s</div></div></div></div>
          <div className="space-y-1">{result.segmentos.map((s: any, i: number) => s.tipo==='fala'||s.tipo==='enfase' ? <div key={i} className={\`p-2 px-3 rounded-lg text-sm \${s.tipo==='enfase'?'bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 font-black':''}\`}>{s.conteudo}</div> : <div key={i} className="text-center text-xs text-slate-400">— pausa {s.duracaoMs}ms —</div>)}</div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas de locução</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.dicasLocucao.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}`
    case 'landing': return `{result && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-5 rounded-2xl" style={{background:result.cor+'22', borderLeft:'6px solid '+result.cor}}><div className="text-5xl font-black" style={{color:result.cor}}>{result.nota}</div><div><div className="text-[10px] font-black uppercase tracking-widest" style={{color:result.cor}}>Nota da landing</div><div className="text-2xl font-black" style={{color:result.cor}}>{result.pontuacao}/100</div></div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">Pontos fracos</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.pontosFracos.map((f: string, i: number) => <li key={i}>⚠️ {f}</li>)}</ul></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Pontos fortes</div><ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{result.pontosFortes.map((f: string, i: number) => <li key={i}>✅ {f}</li>)}</ul></div>
        </div>
      )}`
    case 'reviewreply': return `{result && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800"><div className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-300 mb-2">Resposta sugerida ({result.nota}★)</div><p className="text-sm font-medium">{result.resposta}</p></div>
          {result.pedirParaAtualizar && <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><div className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300 mb-2">Reavaliação</div><p className="text-sm">{result.pedirParaAtualizar}</p></div>}
        </div>
      )}`
    case 'competitor': return `{result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20"><div className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-300">Posição no mercado</div><div className="text-2xl font-black text-violet-700 dark:text-violet-300 uppercase">{result.posicaoMercado.replace('_',' ')}</div><div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs"><div><div className="font-black">R$ {result.precoMin.toFixed(2)}</div><div className="text-slate-500">Mínimo</div></div><div><div className="font-black">R$ {result.precoMedio.toFixed(2)}</div><div className="text-slate-500">Média</div></div><div><div className="font-black">R$ {result.precoMax.toFixed(2)}</div><div className="text-slate-500">Máximo</div></div></div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Comparação</div><div className="space-y-2">{result.comparacao.map((c: any, i: number) => <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] flex justify-between items-center"><div><div className="font-bold text-sm">{c.concorrente}</div><div className="text-xs text-slate-500">{c.observacao}</div></div><div className={\`font-black \${c.diferencaPct<0?'text-emerald-600':'text-red-500'}\`}>{c.diferencaPct>0?'+':''}{c.diferencaPct}%</div></div>)}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Oportunidades</div><ul className="space-y-1 text-sm">{result.gapOportunidade.map((g: string, i: number) => <li key={i}>🎯 {g}</li>)}</ul></div>
        </div>
      )}`
    case 'socialproof': return `{result && (
        <div className="space-y-4">
          <div className="space-y-2">{result.mensagens.slice(0,6).map((m: any, i: number) => <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}} className={\`p-3 rounded-xl text-sm font-medium \${m.tipo==='compra'?'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800':m.tipo==='review'?'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800':'bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700'}\`}>👤 {m.texto}</motion.div>)}</div>
          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800"><div className="text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-300 mb-1">🔒 Badge de confiança</div><p className="text-sm font-semibold">{result.badgeConfianca}</p><div className="flex gap-3 mt-2 text-xs text-slate-500"><span>🟢 {result.contagemVivas.online} online</span><span>🛒 {result.contagemVivas.comprandoAgora} comprando agora</span></div></div>
        </div>
      )}`
    case 'quizfunnel': return `{result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">Quiz de {result.perguntas.length} perguntas</div><div className="text-xl font-black mt-1">{result.titulo}</div><p className="mt-2 text-sm opacity-90">{result.subtitulo}</p></div>
          <div className="space-y-2">{result.perguntas.map((p: any, i: number) => <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="font-bold text-sm mb-2">{i+1}. {p.pergunta}</div><div className="space-y-1">{p.opcoes.map((o: any, j: number) => <div key={j} className="text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">○ {o.texto}</div>)}</div></div>)}</div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300 mb-1">Taxa de conversão estimada</div><div className="text-3xl font-black text-amber-700 dark:text-amber-300">{result.taxasConversaoEstimada}%</div></div>
        </div>
      )}`
    case 'seobrief': return `{result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white"><div className="text-[10px] font-black uppercase tracking-widest opacity-80">Título SEO ({result.tituloSEO.length}/60)</div><div className="text-lg font-black mt-1">{result.tituloSEO}</div><div className="mt-3 text-[10px] font-black uppercase tracking-widest opacity-80">Meta description ({result.metaDescription.length}/160)</div><p className="text-sm opacity-95">{result.metaDescription}</p><div className="mt-2 text-xs opacity-80">🔗 {result.urlSugerida}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Estrutura (headings)</div><div className="space-y-1">{result.estruturaConteudo.map((e: any, i: number) => <div key={i} className="text-sm"><div className="font-bold">H2. {e.h2}</div>{e.h3 && <div className="ml-4 text-slate-500 text-xs">{e.h3.map((h: string, j: number) => <div key={j}>↳ H3. {h}</div>)}</div>}</div>)}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Palavras relacionadas</div><div className="flex flex-wrap gap-1">{result.palavrasChaveRelacionadas.map((k: string, i: number) => <span key={i} className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">{k}</span>)}</div></div>
          <div className="grid grid-cols-2 gap-2 text-center"><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Palavras</div><div className="text-xl font-black">{result.tamanhoIdealPalavras}</div></div><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase text-slate-500">Leitura</div><div className="text-xl font-black">{result.duracaoLeituraMin}min</div></div></div>
        </div>
      )}`
    case 'contentaudit': return `{result && (
        <div className="space-y-4">
          <div className={\`p-5 rounded-2xl text-white \${result.aprovado?'bg-gradient-to-br from-emerald-500 to-green-600':'bg-gradient-to-br from-red-500 to-rose-600'}\`}><div className="text-xs font-black uppercase tracking-widest opacity-80">Auditoria</div><div className="text-4xl font-black mt-1">{result.pontuacaoGeral}/100</div><div className="text-sm mt-1">{result.aprovado?'✅ APROVADO para publicação':'🚫 Precisa corrigir antes de publicar'}</div></div>
          {result.problemas.length > 0 && <div><div className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">Problemas ({result.problemas.length})</div><div className="space-y-2">{result.problemas.map((p: any, i: number) => <div key={i} className={\`p-3 rounded-xl text-sm border \${p.severidade==='critico'?'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300':p.severidade==='alta'?'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300':'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'}\`}><span className="text-[10px] font-black uppercase mr-2">{p.severidade}</span>{p.mensagem}</div>)}</div></div>}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">LGPD Checklist</div><div className="space-y-1">{result.checklistLGPD.map((c: any, i: number) => <div key={i} className="flex items-center gap-2 text-sm">{c.ok ? <span className="text-emerald-600">✅</span> : <span className="text-red-500">⚠️</span>}<span className={c.ok?'':'text-slate-500'}>{c.item}</span></div>)}</div></div>
        </div>
      )}`
    case 'emojipicker': return `{result && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">{result.emojis.map((e: string, i: number) => <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.05}} className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-3xl">{e}</motion.div>)}</div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Texto formatado</div><pre className="whitespace-pre-wrap text-sm font-sans">{result.textoFormatado}</pre></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas</div><ul className="space-y-1 text-sm">{result.dicas.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}`
    case 'launchchecklist': return `{result && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">{result.titulo}</div><div className="flex gap-4 mt-2"><div><div className="text-2xl font-black">{result.totalTarefas}</div><div className="text-xs opacity-80">tarefas</div></div></div></div>
          <div className="space-y-2">{result.checklist.map((c: any, i: number) => <div key={i} className={\`p-3 rounded-xl border flex items-start gap-3 \${c.obrigatorio?'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900':'border-slate-200 bg-slate-50 dark:bg-slate-800/30 dark:border-slate-700'}\`}><input type="checkbox" className="mt-1 w-4 h-4" /><div className="flex-1"><div className="font-bold text-sm flex items-center gap-2">{c.tarefa}{c.obrigatorio && <span className="text-[9px] font-black uppercase text-red-500">obrigatório</span>}{c.dia!=null && <span className="text-[10px] font-black uppercase text-slate-400">D{c.dia}</span>}</div><div className="text-xs text-slate-500 mt-0.5">💡 {c.dica}</div></div></div>)}</div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs"><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="font-black text-lg">{result.metricasAlvo.vendas}</div><div className="text-slate-500">vendas alvo</div></div><div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="font-black text-lg">R$ {result.metricasAlvo.faturamento}</div><div className="text-slate-500">faturamento</div></div></div>
        </div>
      )}`
    case 'persona': return `{result && (
        <div className="space-y-5">
          {result.personas.map((p: any, i: number) => <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="p-5 rounded-[2rem] bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 border border-fuchsia-200 dark:border-fuchsia-800"><div className="flex items-center gap-4 mb-3"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black">{p.nome.charAt(0)}</div><div><div className="text-xl font-black">{p.nome}</div><div className="text-sm text-slate-600 dark:text-slate-400">{p.idade} anos · {p.profissao} · {p.cidade}</div><div className="text-xs text-slate-500">Renda: {p.rendaMensal}</div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><div><div className="text-[10px] font-black uppercase text-red-500 mb-1">😣 Dores</div><ul className="space-y-1 text-slate-700 dark:text-slate-300">{p.dores.map((d: string, j: number) => <li key={j}>• {d}</li>)}</ul></div><div><div className="text-[10px] font-black uppercase text-emerald-600 mb-1">✨ Desejos</div><ul className="space-y-1 text-slate-700 dark:text-slate-300">{p.desejos.map((d: string, j: number) => <li key={j}>• {d}</li>)}</ul></div></div><blockquote className="mt-3 p-3 rounded-xl bg-white/60 dark:bg-black/20 italic text-sm border-l-4 border-fuchsia-500">"{p.fraseRepresentativa}"</blockquote><div className="mt-2 text-xs font-bold">🎁 Oferta ideal: <span className="text-fuchsia-700 dark:text-fuchsia-300">{p.ofertaIdeal}</span></div></motion.div>)}
          <div><div className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">⛔ ANTI-PERSONA (NÃO é cliente)</div>{result.antiPersonas.slice(0,1).map((p: any, i: number) => <div key={i} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 text-sm"><b>{p.nome}</b> — {p.ofertaIdeal}</div>)}</div>
        </div>
      )}`
    case 'urgencia': return `{result && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white"><div className="text-xs font-black uppercase tracking-widest opacity-80">🔥 Urgência</div><div className="text-2xl font-black mt-1">{result.principal}</div><p className="text-sm mt-2 opacity-90">{result.secundaria}</p></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Variações</div><div className="space-y-2">{result.linhas.map((l: string, i: number) => <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A] text-sm font-bold">{l}</div>)}</div></div>
          <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">⚠️ {result.honestidade[0]}</div>
        </div>
      )}`
    case 'metrics': return `{result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20"><div className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-300">Conversão</div><div className="text-xl font-black text-brand-700 dark:text-brand-300">{result.taxaConversao}%</div></div>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20"><div className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-300">Add cart</div><div className="text-xl font-black text-sky-700 dark:text-sky-300">{result.taxaCart}%</div></div>
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><div className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-300">Checkout</div><div className="text-xl font-black text-violet-700 dark:text-violet-300">{result.taxaCheckout}%</div></div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-300">AOV</div><div className="text-xl font-black text-amber-700 dark:text-amber-300">R$ {result.aov.toFixed(2)}</div></div>
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Diagnóstico</div><div className="space-y-2">{result.diagnostico.map((d: any, i: number) => <div key={i} className={\`p-3 rounded-xl text-sm border \${d.severidade==='critica'?'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300':d.severidade==='atencao'?'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300':'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'}\`}><div className="font-black uppercase text-[10px] mb-0.5">{d.metrica} · {d.valor}</div>{d.recomendacao}</div>)}</div></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-brand-500 mb-2">🎯 Ações prioritárias</div><ol className="space-y-1 text-sm list-decimal list-inside">{result.acoesPrioritarias.map((a: string, i: number) => <li key={i}>{a}</li>)}</ol></div>
        </div>
      )}`
    case 'webhook': return `{result && (
        <div className="space-y-4">
          <div className="flex gap-2"><span className="px-2 py-1 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-black">{result.method}</span><span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">{result.evento}</span></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Payload</div><pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs overflow-auto">{JSON.stringify(result.body, null, 2)}</pre></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Curl de teste</div><pre className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs overflow-auto whitespace-pre-wrap">{result.curl}</pre></div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Boas práticas</div><ul className="space-y-1 text-sm">{result.dicas.map((d: string, i: number) => <li key={i}>• {d}</li>)}</ul></div>
        </div>
      )}`
    default: return `{result && <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>}`
  }
}

for (const a of agents) {
  // Build initial form
  const init = {}
  for (const f of a.fields) {
    if (f.type === 'number') init[f.name] = ''
    else if (f.type === 'select') init[f.name] = f.options[0]
    else init[f.name] = ''
  }
  // Smart cart and competitor require special handling (JSON parse)
  const gerarBody = `{...Object.fromEntries(Object.entries(form).map(([k,v]) => {
    if (k==='itensJSON') return ['itens', (() => { try { return JSON.parse(v as string || '[]'); } catch { return []; } })()];
    if (k==='concorrentesJSON') return ['concorrentes', (() => { try { return JSON.parse(v as string || '[]'); } catch { return []; } })()];
    if (['visitas','cart','checkout','compras','receita','reembolsos','preco','precoBase','custo','estoque','views','vendas','qtd','vendas','totalAtual','valor','dias','diasCompra','diasLogin','abandonos','imagens','seuPreco'].includes(k) && v !== '' ) return [k, Number(v)];
    if (['visitou','addCart','checkout','comprou','temCTA','temDepoimentos','temGarantia','temFAQ','temEscassez','temTermos','temPolitica'].includes(k)) return [k, v === 'true'];
    if (v === '' && ['precoBase','custo','estoque','views','vendas','valor','dias','diasCompra','diasLogin','abandonos','qtd','seuPreco','preco','totalAtual','visitas','cart','checkout','compras','receita','reembolsos','imagens','vagas'].includes(k)) return [k, undefined];
    return [k, v === '' ? undefined : v];
  }))}`
  const iconName = a.icone
  const taglineJs = JSON.stringify(a.tagline)
  const nomeJs = JSON.stringify(a.nome)
  const corJs = JSON.stringify('bg-gradient-to-br ' + a.cor)
  const apiJs = JSON.stringify(a.api)
  const tsx = `'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ${iconName} } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string, any>>(${JSON.stringify(init)})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch(${apiJs}, { method: ${JSON.stringify(a.method)}, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(${gerarBody}) })
      setResult(await r.json())
    } catch { setResult(null) } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={${nomeJs}} tagline={${taglineJs}} icone={<${iconName} className="w-7 h-7" />} cor={${corJs}} onGerar={gerar} loading={loading}
      output=${renderResultFor(a.renderType)}>
${a.fields.map(f => `      <Field label={${JSON.stringify(f.label)}}>${renderField(f)}</Field>`).join('\n')}
    </AgentShell>
  )
}
`
  const outPath = path.join(__dirname, '..', 'src', 'app', 'agentes', a.slug, 'page.tsx')
  fs.writeFileSync(outPath, tsx)
}
console.log('Pages generated:', agents.length)
