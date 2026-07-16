import { Product } from '@/types'

const sellers = [
  { id: 's1', name: 'PixelKing', avatar: 'https://picsum.photos/seed/sk1/80/80', sales: 2341, rating: 4.9, verified: true, memberSince: '2022' },
  { id: 's2', name: 'SoftVault', avatar: 'https://picsum.photos/seed/sk2/80/80', sales: 1876, rating: 4.8, verified: true, memberSince: '2021' },
  { id: 's3', name: 'EduPro', avatar: 'https://picsum.photos/seed/sk3/80/80', sales: 954, rating: 4.7, verified: true, memberSince: '2023' },
  { id: 's4', name: 'DesignLab', avatar: 'https://picsum.photos/seed/sk4/80/80', sales: 1567, rating: 4.6, verified: false, memberSince: '2024' },
  { id: 's5', name: 'DigitalMax', avatar: 'https://picsum.photos/seed/sk5/80/80', sales: 3102, rating: 5.0, verified: true, memberSince: '2020' },
  { id: 's6', name: 'CloudNinja', avatar: 'https://picsum.photos/seed/sk6/80/80', sales: 789, rating: 4.8, verified: true, memberSince: '2022' },
]

export const mockProducts: Product[] = [
  // 🎮 Jogos
  {
    id: 'p1', title: 'Conta Valorant – Diamante 1 + 40 Skins Épicas', slug: 'conta-valorant-diamante',
    price: 89.90, originalPrice: 129.90, image: 'https://picsum.photos/seed/pv1/400/300',
    category: 'Jogos & Contas', categorySlug: 'jogos-contas', seller: sellers[0],
    type: 'account', deliveryType: 'auto', featured: true, sales: 234, rating: 4.9, reviews: 87,
    description: 'Conta Diamante 1 com mais de 40 skins épicas e lendárias. Inclui skins como Reaver Vandal, Prime Vandal, Glitchpop e muito mais. Acesso completo com e-mail verificado.',
    tags: ['diamante', 'skins', 'vandal'], createdAt: '2026-07-10'
  },
  {
    id: 'p2', title: 'Windows 11 Pro — Licença Original Vitalícia', slug: 'windows-11-pro-licenca',
    price: 49.90, originalPrice: 299.90, image: 'https://picsum.photos/seed/win11/400/300',
    category: 'Software & Licenças', categorySlug: 'software-licencas', seller: sellers[1],
    type: 'license', deliveryType: 'auto', featured: true, sales: 5678, rating: 4.8, reviews: 1203,
    description: 'Licença digital original do Windows 11 Pro. Ativação vitalícia, vinculada ao hardware. Entrega automática da chave por e-mail.',
    tags: ['windows', 'licença', 'microsoft'], createdAt: '2026-07-12'
  },
  // 🎓 Cursos
  {
    id: 'p3', title: 'Curso Completo Programação Full Stack — 120h', slug: 'curso-fullstack-120h',
    price: 34.90, originalPrice: 297.00, image: 'https://picsum.photos/seed/curso1/400/300',
    category: 'Cursos Online', categorySlug: 'cursos-online', seller: sellers[2],
    type: 'course', deliveryType: 'auto', featured: true, sales: 1890, rating: 5.0, reviews: 445,
    description: 'Curso completo de programação Full Stack com 120 horas de conteúdo. Do zero ao profissional. React, Node.js, TypeScript, PostgreSQL e deploy.',
    tags: ['programação', 'fullstack', 'react'], createdAt: '2026-07-14'
  },
  // 📚 E-books
  {
    id: 'p4', title: 'E-book: Marketing Digital 360° — 3ª Edição', slug: 'ebook-marketing-digital',
    price: 14.90, originalPrice: 49.90, image: 'https://picsum.photos/seed/ebook1/400/300',
    category: 'E-books & PDFs', categorySlug: 'ebooks-pdfs', seller: sellers[4],
    type: 'ebook', deliveryType: 'auto', featured: true, sales: 890, rating: 4.7, reviews: 156,
    description: 'Guia completo de marketing digital atualizado. SEO, tráfego pago, redes sociais, e-mail marketing e funil de vendas. 340 páginas.',
    tags: ['marketing', 'digital', 'seo'], createdAt: '2026-07-08'
  },
  // 🎨 Design
  {
    id: 'p5', title: 'Pack 500+ Templates Canva — Instagram & TikTok', slug: 'pack-templates-canva',
    price: 19.90, originalPrice: 89.90, image: 'https://picsum.photos/seed/canva1/400/300',
    category: 'Design & Templates', categorySlug: 'design-templates', seller: sellers[3],
    type: 'template', deliveryType: 'auto', featured: true, sales: 3456, rating: 4.9, reviews: 678,
    description: 'Pack com 500+ templates editáveis no Canva para Instagram, TikTok, Stories e Reels. Design profissional, pronto para usar.',
    tags: ['canva', 'templates', 'instagram'], createdAt: '2026-07-13'
  },
  // 🎬 Streaming
  {
    id: 'p6', title: 'Netflix Premium — 4 Telas 1 Ano', slug: 'netflix-premium-1ano',
    price: 79.90, image: 'https://picsum.photos/seed/netflix1/400/300',
    category: 'Streaming & Mídia', categorySlug: 'streaming-midia', seller: sellers[5],
    type: 'subscription', deliveryType: 'manual', featured: true, sales: 123, rating: 4.8, reviews: 45,
    description: 'Assinatura Netflix Premium 4 telas simultâneas por 1 ano completo. Acesso a todo catálogo em Ultra HD.',
    tags: ['netflix', 'streaming', 'premium'], createdAt: '2026-07-11'
  },
  // 🌐 Domínios
  {
    id: 'p7', title: 'Domínio .com.br Premium — techsolucoes.com.br', slug: 'dominio-techsolucoes',
    price: 299.90, image: 'https://picsum.photos/seed/dominio1/400/300',
    category: 'Domínios & Sites', categorySlug: 'dominios-sites', seller: sellers[5],
    type: 'domain', deliveryType: 'manual', featured: false, sales: 12, rating: 4.6, reviews: 8,
    description: 'Domínio .com.br premium com nome forte para empresas de tecnologia. Registro ativo, transferência imediata.',
    tags: ['domínio', 'combr', 'tech'], createdAt: '2026-07-09'
  },
  // 🔑 Steam
  {
    id: 'p8', title: 'Key Steam — Elden Ring Deluxe Edition', slug: 'key-steam-elden-ring',
    price: 149.90, originalPrice: 299.90, image: 'https://picsum.photos/seed/pv2/400/300',
    category: 'Steam Keys', categorySlug: 'steam-keys', seller: sellers[1],
    type: 'key', deliveryType: 'auto', featured: false, sales: 567, rating: 4.8, reviews: 203,
    description: 'Chave Steam para Elden Ring Deluxe Edition. Ativação global. Entrega automática instantânea após a confirmação do pagamento.',
    tags: ['steam', 'key', 'rpg'], createdAt: '2026-07-12'
  },
  // 🧩 Plugins
  {
    id: 'p9', title: 'Plugin WordPress — SEO Pro Pack v3.0', slug: 'plugin-seo-pro-wordpress',
    price: 39.90, originalPrice: 99.90, image: 'https://picsum.photos/seed/plugin1/400/300',
    category: 'Plugins & Extensões', categorySlug: 'plugins-extensoes', seller: sellers[3],
    type: 'license', deliveryType: 'auto', featured: false, sales: 789, rating: 4.9, reviews: 234,
    description: 'Plugin WordPress completo para SEO. Sitemap, schema markup, meta tags, análise de conteúdo e integração com Google Search Console.',
    tags: ['wordpress', 'seo', 'plugin'], createdAt: '2026-07-12'
  },
  // 🎁 Gift Cards
  {
    id: 'p10', title: 'Google Play R$100 — Gift Card Digital', slug: 'giftcard-google-play-100',
    price: 84.90, image: 'https://picsum.photos/seed/gift1/400/300',
    category: 'Gift Cards', categorySlug: 'gift-cards', seller: sellers[4],
    type: 'giftcard', deliveryType: 'auto', featured: false, sales: 2345, rating: 4.7, reviews: 321,
    description: 'Gift Card Google Play de R$100. Código digital entregue automaticamente. Use em apps, jogos, filmes e assinaturas.',
    tags: ['google', 'play', 'giftcard'], createdAt: '2026-07-09'
  },
  // ⚡ APIs
  {
    id: 'p11', title: 'API OpenAI — Créditos $50 por $29,90', slug: 'api-openai-creditos',
    price: 29.90, originalPrice: 50.00, image: 'https://picsum.photos/seed/api1/400/300',
    category: 'APIs & Serviços Cloud', categorySlug: 'apis-cloud', seller: sellers[5],
    type: 'api', deliveryType: 'auto', featured: false, sales: 567, rating: 4.6, reviews: 98,
    description: 'Créditos da API OpenAI no valor de $50 USD. Acesso a GPT-4, DALL-E, Whisper. Entrega via chave de API temporária.',
    tags: ['openai', 'api', 'gpt4'], createdAt: '2026-07-10'
  },
  // 💼 Serviços
  {
    id: 'p12', title: 'Criação de Loja Shopify Completa + 30 Produtos', slug: 'servico-loja-shopify',
    price: 199.90, originalPrice: 499.90, image: 'https://picsum.photos/seed/shopify1/400/300',
    category: 'Serviços Freelance', categorySlug: 'servicos-freelance', seller: sellers[3],
    type: 'service', deliveryType: 'manual', featured: false, sales: 67, rating: 4.8, reviews: 19,
    description: 'Serviço completo de criação de loja Shopify. Design profissional, 30 produtos cadastrados, integração de pagamento e SEO básico.',
    tags: ['shopify', 'loja', 'ecommerce'], createdAt: '2026-07-05'
  },
  // 💿 Office
  {
    id: 'p13', title: 'Microsoft Office 365 Family — 1 Ano 6 Usuários', slug: 'office-365-family',
    price: 59.90, originalPrice: 349.00, image: 'https://picsum.photos/seed/office1/400/300',
    category: 'Software & Licenças', categorySlug: 'software-licencas', seller: sellers[1],
    type: 'license', deliveryType: 'auto', featured: false, sales: 1890, rating: 4.9, reviews: 456,
    description: 'Licença Microsoft 365 Family por 1 ano completo. 6 usuários simultâneos. Word, Excel, PowerPoint, Outlook, OneDrive 1TB cada.',
    tags: ['office', 'microsoft', '365'], createdAt: '2026-07-07'
  },
  // 🎵 Música
  {
    id: 'p14', title: 'Spotify Premium Família — 6 Contas 1 Ano', slug: 'spotify-premium-familia',
    price: 89.90, image: 'https://picsum.photos/seed/spotify1/400/300',
    category: 'Streaming & Mídia', categorySlug: 'streaming-midia', seller: sellers[5],
    type: 'subscription', deliveryType: 'manual', featured: false, sales: 456, rating: 4.7, reviews: 89,
    description: 'Plano Spotify Premium Família. 6 contas simultâneas por 1 ano. Sem anúncios, download offline, qualidade Extreme.',
    tags: ['spotify', 'premium', 'família'], createdAt: '2026-07-06'
  },
  // 🎓 Curso Design
  {
    id: 'p15', title: 'Curso UI/UX Design — Figma Pro + Portfolio', slug: 'curso-uiux-figma',
    price: 27.90, originalPrice: 197.00, image: 'https://picsum.photos/seed/curso2/400/300',
    category: 'Cursos Online', categorySlug: 'cursos-online', seller: sellers[2],
    type: 'course', deliveryType: 'auto', featured: false, sales: 1234, rating: 4.9, reviews: 345,
    description: 'Curso completo de UI/UX Design com Figma. Do wireframe ao protótipo interativo. Inclui templates de portfolio prontos.',
    tags: ['ui', 'ux', 'figma'], createdAt: '2026-07-04'
  },
]

export const getProductById = (id: string): Product | undefined =>
  mockProducts.find(p => p.id === id)

export const getProductsByCategory = (slug: string): Product[] =>
  mockProducts.filter(p => p.categorySlug === slug)

export const getFeaturedProducts = (): Product[] =>
  mockProducts.filter(p => p.featured)

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase()
  return mockProducts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  )
}
