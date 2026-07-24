// ─────────────────────────────────────────────────────────────
// SEOBoost - Gera titulos, meta descriptions, alt texts e
// sitemap hints automaticos para produtos digitais
// ─────────────────────────────────────────────────────────────

export interface SeoBoostInput {
  titulo: string
  descricao?: string
  categoria?: string
  preco?: number
  marca?: string
}

export interface SeoBoostResult {
  metaTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
  slugSugerido: string
  altTextImagem: string
  keywords: string[]
  jsonLd: Record<string, unknown>
  dicas: string[]
  score: number
}

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

const CAT_KEYWORDS: Record<string, string[]> = {
  jogos: ['jogos', 'steam', 'gift card', 'conta', 'cd key'],
  software: ['licenca', 'software', 'ativacao', 'chave'],
  cursos: ['curso online', 'aprender', 'certificado'],
  streaming: ['streaming', 'netflix', 'spotify', 'assinatura'],
  giftcards: ['gift card', 'cartao presente', 'ifood', 'uber'],
  templates: ['template', 'canva', 'notion', 'design'],
  ia: ['ia', 'prompt', 'inteligencia artificial', 'chatgpt'],
}

export function generateSeo(input: SeoBoostInput): SeoBoostResult {
  const t = input.titulo.trim()
  const cat = (input.categoria || 'outro').toLowerCase()
  const preco = input.preco
  const baseKw: string[] = CAT_KEYWORDS[cat] || ['produto digital', 'kiyvo']
  const d = (input.descricao || '').slice(0, 120)
  const precoStr = preco ? ` R$${preco.toFixed(2).replace('.', ',')}` : ''

  const metaTitle = `${t}${precoStr} | ${input.marca || 'KIYVO'}`.slice(0, 60)
  const metaDescription = `${d || `Compre ${t} com entrega instantânea na KIYVO.`} ${preco ? `Apenas${precoStr}.` : ''} Pagamento seguro via PIX, cartão ou boleto.`.slice(0, 155)
  const ogTitle = metaTitle.slice(0, 60)
  const ogDescription = metaDescription.slice(0, 155)
  const twitterTitle = metaTitle.slice(0, 70)
  const twitterDescription = metaDescription.slice(0, 200)
  const slugSugerido = slugify(t)
  const altTextImagem = `${t} - Comprar na KIYVO${precoStr}`

  const kwExtra = t.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3).slice(0, 5)
  const keywords: string[] = Array.from(new Set<string>([
    ...(baseKw as string[]), ...kwExtra,
    'comprar', 'entrega instantanea', 'brasil', 'kiyvo',
  ]))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: t,
    description: d || metaDescription,
    brand: { '@type': 'Brand', name: input.marca || 'KIYVO' },
    offers: preco ? {
      '@type': 'Offer', price: preco.toFixed(2), priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock', url: `https://kiyvo.com.br/p/${slugSugerido}`,
      seller: { '@type': 'Organization', name: 'KIYVO' },
    } : undefined,
  }

  const dicas: string[] = []
  if (metaTitle.length > 60) dicas.push('Título tem mais de 60 caracteres — reduza para aparecer completo no Google')
  if (metaDescription.length < 70) dicas.push('Meta description curta — aumente para 140-155 caracteres para mais CTR')
  if (keywords.length < 5) dicas.push('Adicione mais palavras-chave relacionadas ao produto')
  if (!input.descricao || input.descricao.length < 100) dicas.push('Descrição com menos de 100 caracteres — afeta ranking')
  if (d.length === 0) dicas.push('Descrição vazia — Google penaliza páginas sem conteúdo')
  if (dicas.length === 0) dicas.push('SEO está ótimo! Publique assim mesmo 🚀')

  let score = 100
  if (metaTitle.length > 60) score -= 10
  if (metaDescription.length < 70) score -= 15
  if (metaDescription.length > 155) score -= 5
  if (keywords.length < 5) score -= 10
  if (!input.descricao || input.descricao.length < 100) score -= 15
  score = Math.max(20, score)

  return {
    metaTitle, metaDescription, ogTitle, ogDescription,
    twitterTitle, twitterDescription, slugSugerido, altTextImagem,
    keywords, jsonLd, dicas, score,
  }
}
