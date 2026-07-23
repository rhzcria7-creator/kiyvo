// ─────────────────────────────────────────────────────────────
// AdOptimizer - Agente de otimizacao de anuncios
// Gera titulos, thumbnails, publicos-alvo, orcamentos e
// diagnosticos de CPA/ROAS para produtos digitais no KIYVO.
// Sem IA externa: regras deterministas + combinatoria.
// ─────────────────────────────────────────────────────────────

export interface AdOptimizerInput {
  productTitle: string
  productPrice: number
  productCategory?: string
  productDescription?: string
  platform?: 'meta' | 'tiktok' | 'google' | 'youtube'
  dailyBudget?: number
}

export interface AdVariant {
  headline: string
  primaryText: string
  cta: string
  hook: string
}

export interface Audience {
  name: string
  ageRange: string
  interests: string[]
  placements: string[]
}

export interface AdOptimizerResult {
  score: number // 0-100
  estimatedCPA: number
  estimatedROAS: number
  variants: AdVariant[]
  audiences: Audience[]
  budget: {
    dailyRecommended: number
    testDays: number
    split: { name: string; pct: number }[]
  }
  diagnostics: { type: 'good' | 'warn' | 'bad'; message: string }[]
  thumbnailHints: string[]
  tags: string[]
}

const PLATFORM_CTA: Record<string, string[]> = {
  meta: ['Comprar agora', 'Saiba mais', 'Resgatar oferta'],
  tiktok: ['Comprar agora', 'Ver oferta', 'Usar cupom'],
  google: ['Comprar', 'Ver produto', 'Conferir'],
  youtube: ['Comprar agora', 'Saiba mais', 'Ver oferta'],
}

const CATEGORY_INTERESTS: Record<string, string[]> = {
  jogos: ['Gamers', 'Steam', 'PlayStation', 'Xbox', 'Free Fire', 'LoL'],
  software: ['Produtividade', 'Devs', 'Startups', 'SaaS', 'Empreendedores'],
  streaming: ['Netflix', 'Filmes', 'Séries', 'Disney+', 'Prime Video', 'Maratonas'],
  giftcards: ['Gift cards', 'iFood', 'Uber', 'Presentes', 'PicPay'],
  cursos: ['Estudo', 'Renda extra', 'Marketing digital', 'Programação', 'Hotmart'],
  templates: ['Designers', 'Canva', 'Figma', 'Notion', 'Social media'],
  ia: ['Inteligência artificial', 'ChatGPT', 'Midjourney', 'Automation', 'Prompts'],
  default: ['Compras online', 'Ofertas', 'Descontos', 'Digital'],
}

const HOOKS = [
  'Pare de pagar caro por',
  'Ninguém te conta isso sobre',
  'Receba em 3 segundos:',
  'Últimas vagas com 50% OFF:',
  'Testei e aprovei:',
  'Garantido ou seu dinheiro de volta:',
  'O segredo que ninguém revela:',
  'Melhor que o concorrente:',
]

const ADJECTIVES = ['OFICIAL', 'RÁPIDO', 'GARANTIDO', 'EXCLUSIVO', 'IMPERDÍVEL', 'BARATO']

export function optimizeAd(input: AdOptimizerInput): AdOptimizerResult {
  const title = input.productTitle.trim() || 'Produto digital'
  const price = Math.max(1, Number(input.productPrice) || 50)
  const cat = (input.productCategory || 'default').toLowerCase()
  const platform = input.platform || 'meta'
  const dailyBudget = Math.max(5, Number(input.dailyBudget) || Math.max(20, Math.round(price * 0.6)))

  const ctaList = PLATFORM_CTA[platform]

  // Gera 5 variantes de anúncio combinando hooks + títulos
  const variants: AdVariant[] = []
  for (let i = 0; i < 5; i++) {
    const hook = HOOKS[(i + Math.floor(title.length / 3)) % HOOKS.length]
    const adj = ADJECTIVES[i % ADJECTIVES.length]
    const cta = ctaList[i % ctaList.length]
    const headline = `${adj}: ${title.slice(0, 55)}`
    const primaryText =
      i === 0
        ? `${hook} ${title}. ${price % 1 === 0 ? 'Apenas' : 'Só'} ${price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} com entrega instantânea. Use o cupom KIYVO10.`
        : i === 1
          ? `${title} com entrega em segundos, suporte 24h e garantia KIYVO. Teste agora sem risco.`
          : i === 2
            ? `Mais de 10mil brasileiros já compraram. ${title} por menos de um café por dia.`
            : i === 3
              ? `${hook} ${title}. Pagou, recebeu. Simples assim. Sem mensalidade escondida.`
              : `Promoção por tempo limitado: ${title} com ${10 + i * 2}% OFF usando KIYVO10.`
    variants.push({ headline, primaryText, cta, hook })
  }

  const interests = CATEGORY_INTERESTS[cat] || CATEGORY_INTERESTS.default
  const audiences: Audience[] = [
    {
      name: 'Core - Compradores digitais quentes',
      ageRange: cat === 'jogos' ? '16-30' : cat === 'cursos' ? '22-45' : '18-55',
      interests: interests.slice(0, 5),
      placements: platform === 'meta' ? ['Feed', 'Reels', 'Stories'] : ['For You Page'],
    },
    {
      name: 'Lookalike - Similar a compradores',
      ageRange: '18-50',
      interests: interests.slice(0, 3).concat(['Compras online', 'Descontos']),
      placements: platform === 'meta' ? ['Feed', 'Reels'] : ['For You Page', 'Search'],
    },
    {
      name: 'Retargeting - Visitantes do site',
      ageRange: '18-65',
      interests: [],
      placements: ['Feed', 'Stories', 'Rede de Display'],
    },
  ]

  // Orçamento split
  const split = [
    { name: 'Teste de criativos (3-5 variantes)', pct: 40 },
    { name: 'Público core lookalike', pct: 35 },
    { name: 'Retargeting', pct: 25 },
  ]

  // Diagnósticos
  const diagnostics: { type: 'good' | 'warn' | 'bad'; message: string }[] = []
  if (price <= 30) {
    diagnostics.push({ type: 'good', message: 'Preço baixo (< R$30): CAC costuma ser < R$8, ROAS alto.' })
  } else if (price > 200) {
    diagnostics.push({ type: 'warn', message: 'Preço alto (> R$200): foque em retargeting e vídeos de prova social.' })
  }
  if (title.length < 20) {
    diagnostics.push({ type: 'warn', message: 'Título curto: adicione benefício principal para CTR +15%.' })
  } else {
    diagnostics.push({ type: 'good', message: 'Título tem tamanho ideal para anúncios.' })
  }
  if (dailyBudget < price * 0.3) {
    diagnostics.push({ type: 'bad', message: `Orçamento baixo para o preço do produto. Mínimo recomendado: R$${Math.round(price * 0.3)}/dia.` })
  } else {
    diagnostics.push({ type: 'good', message: 'Orçamento diário saudável para fase de testes.' })
  }
  diagnostics.push({ type: 'good', message: 'Use cupom KIYVO10 no criativo — aumenta conversão em ~12%.' })

  // Estimativa
  const baseCPA = price <= 30 ? 8 : price <= 100 ? 18 : price <= 300 ? 40 : 80
  const estimatedCPA = Math.round((baseCPA + price * 0.15) * 100) / 100
  const estimatedROAS = Math.round((price / estimatedCPA) * 100) / 100

  const score = Math.min(
    100,
    Math.round(
      60 +
      (diagnostics.filter(d => d.type === 'good').length * 10) -
      (diagnostics.filter(d => d.type === 'bad').length * 15) -
      (diagnostics.filter(d => d.type === 'warn').length * 5)
    )
  )

  const thumbnailHints = [
    'Fundo gradiente (usar paleta da categoria)',
    'Preço em destaque (fonte black, 20% do card)',
    'Selo "ENTREGA INSTANTÂNEA" em verde no canto',
    'Emoji grande do produto à esquerda',
    'Sem texto miúdo — legível em 320px de largura',
    'Contraste 4.5:1 entre texto e fundo',
  ]

  const tags = ['anuncio', platform, cat, 'cpa:' + Math.round(estimatedCPA), 'roas:' + estimatedROAS.toFixed(1)]

  return {
    score,
    estimatedCPA,
    estimatedROAS,
    variants,
    audiences,
    budget: {
      dailyRecommended: dailyBudget,
      testDays: 7,
      split,
    },
    diagnostics,
    thumbnailHints,
    tags,
  }
}
