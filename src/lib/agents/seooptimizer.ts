// Agente SEOOptimizer — gera meta tags completas, slug, OG e JSON-LD
// (agente novo, diferente do seoboost que é mais simples)
export interface SEOInput { titulo: string; descricao: string; categoria?: string; preco?: number; marca?: string; imagemUrl?: string; publico?: string }
export interface SEOOutput {
  metaTitle: string
  metaDescription: string
  slug: string
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
  jsonLd: Record<string, unknown>
  robots: string
  canonicalSugestao: string
  palavrasChave: string[]
  scoreSEO: number
  correcoes: string[]
}
export function gerarSEO(input: SEOInput): SEOOutput {
  const { titulo, descricao, categoria = 'produto', preco, marca = 'KIYVO', publico = 'você' } = input
  // Slug
  const slug = titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
  // Meta title 50-60 caracteres
  let metaTitle = `${titulo} | ${marca}`
  if (preco) metaTitle = `${titulo} ${preco < 100 ? 'a partir de R$ '+preco.toFixed(2).replace('.',',') : ''} | ${marca}`
  if (metaTitle.length > 60) metaTitle = titulo.slice(0, 50) + ' | ' + marca
  // Meta description 150-160 caracteres
  let metaDescription = descricao.replace(/\s+/g, ' ').trim()
  if (metaDescription.length > 155) metaDescription = metaDescription.slice(0, 152) + '...'
  if (metaDescription.length < 80) metaDescription = `${metaDescription} ${preco?`A partir de R$ ${preco.toFixed(2).replace('.',',')}. ` : ''}Confira na ${marca}!`
  const ogTitle = metaTitle
  const ogDescription = metaDescription
  const twitterTitle = metaTitle
  const twitterDescription = metaDescription.slice(0, 130)
  const palavrasChave = Array.from(new Set([
    titulo.split(/\s+/).slice(0, 3).join(' '),
    categoria,
    marca.toLowerCase(),
    preco ? `preço ${titulo.toLowerCase().split(' ')[0]}` : '',
    'comprar online',
    'produto digital',
    'brasil',
  ].filter(Boolean))) as string[]
  const jsonLd: Record<string, unknown> = preco ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titulo,
    description: metaDescription,
    brand: { '@type': 'Brand', name: marca },
    offers: { '@type': 'Offer', price: preco, priceCurrency: 'BRL', availability: 'https://schema.org/InStock', seller: { '@type': 'Organization', name: marca } },
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metaTitle,
    description: metaDescription,
  }
  let score = 50
  const correcoes: string[] = []
  if (metaTitle.length >= 40 && metaTitle.length <= 60) score += 15; else correcoes.push('Ajustar meta title para 50-60 caracteres')
  if (metaDescription.length >= 130 && metaDescription.length <= 160) score += 15; else correcoes.push('Ajustar meta description para 150-160 caracteres')
  if (palavrasChave.length >= 4) score += 8; else correcoes.push('Adicionar mais palavras-chave')
  score += 12 // sempre adicionamos json-ld
  score = Math.min(100, score)
  return {
    metaTitle, metaDescription, slug, ogTitle, ogDescription, twitterTitle, twitterDescription,
    jsonLd, robots: 'index, follow', canonicalSugestao: `https://kiyvo.com.br/produto/${slug}`,
    palavrasChave, scoreSEO: score, correcoes: correcoes.length ? correcoes : ['SEO técnico bom! Foque em backlinks e conteúdo.'],
  }
}
