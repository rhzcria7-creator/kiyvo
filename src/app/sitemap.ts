// Sitemap dinâmico para SEO
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playdex.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  // Páginas estáticas com alta prioridade
  const staticPages = [
    { path: '/', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/categorias', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/como-funciona', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/tarifas', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/planos', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/comparativo', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/ofertas', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/cupons', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/garantia', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/seguranca', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/faq', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/suporte', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/afiliados', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/depoimentos', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/api-docs', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/pagamentos', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/login', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/cadastro', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/termos', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/privacidade', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/reembolso', priority: 0.3, changeFreq: 'yearly' as const },
  ]

  // Categorias
  const categorySlugs = [
    'jogos-contas', 'software-licencas', 'cursos-online', 'ebooks-pdfs',
    'design-templates', 'streaming-midia', 'gift-cards', 'dominios-sites',
    'apis-cloud', 'plugins-extensoes', 'musica-audio', 'fotos-videos',
    'cripto-nft', 'steam-keys', 'moedas-gold', 'servicos-freelance',
    'ferramentas-apps', '3d-modelos', 'assinaturas', 'itens-skins',
  ]

  const categoryPages = categorySlugs.map(slug => ({
    url: `${BASE_URL}/categoria/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages.map(page => ({
      url: `${BASE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFreq,
      priority: page.priority,
    })),
    ...categoryPages,
  ]
}
