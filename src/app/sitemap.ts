// ─────────────────────────────────────────────────────────────
// Sitemap Dinâmico v0.0.1 — Geração automática de sitemap.xml
// Inclui produtos, categorias, blog, páginas estáticas
// ─────────────────────────────────────────────────────────────

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${BASE_URL}/trending`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/ajuda`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/sobre`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/contato`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${BASE_URL}/afiliados`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/seller`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/acessibilidade`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  // Categorias principais
  const categories = [
    'software', 'cursos', 'ebooks', 'templates', 'design',
    'jogos', 'api-saas', 'musica', 'fontes', 'plugins',
  ]

  const categoryPages = categories.map(cat => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Em produção: buscar produtos do banco para incluir no sitemap
  // const { data: products } = await supabase.from('products').select('slug, updated_at').eq('is_active', true)
  // const productPages = products.map(p => ({ ... }))

  return [
    ...staticPages,
    ...categoryPages,
  ]
}
