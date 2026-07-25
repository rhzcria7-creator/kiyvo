// ─────────────────────────────────────────────────────────────
// Content Engine v0.0.1 — Blog, FAQ, Guias, Páginas CMS
// Geração de conteúdo, SEO, versionamento
// ─────────────────────────────────────────────────────────────

export interface ContentPage {
  id: string
  type: 'blog' | 'faq' | 'guide' | 'page' | 'help'
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  authorId: string
  authorName: string
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  viewCount: number
  likeCount: number
  publishedAt: string
  createdAt: string
  updatedAt: string
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl: string
    ogImage: string
  }
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  orderIndex: number
  isPublished: boolean
  relatedFaqs: string[]
  createdAt: string
}

const CATEGORY_ICONS: Record<string, string> = {
  'software': '💻',
  'cursos': '📚',
  'ebooks': '📖',
  'templates': '🎨',
  'design': '🖌️',
  'jogos': '🎮',
  'api-saas': '🔌',
  'musica': '🎵',
  'fontes': '🔤',
  'plugins': '🔧',
  'geral': '📦',
}

export class ContentEngine {
  /**
   * Gera slug SEO-friendly
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80)
  }

  /**
   * Gera meta title SEO
   */
  generateMetaTitle(title: string, category?: string): string {
    const base = `${title} | KIYVO`
    if (category) return `${title} — ${category} | KIYVO`
    return base
  }

  /**
   * Gera meta description SEO
   */
  generateMetaDescription(content: string, maxLength = 160): string {
    const clean = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    if (clean.length <= maxLength) return clean
    return clean.slice(0, maxLength - 3) + '...'
  }

  /**
   * Extrai tags automáticas do conteúdo
   */
  extractTags(content: string, title: string): string[] {
    const lower = `${title} ${content}`.toLowerCase()
    const autoTags: string[] = []

    const tagPatterns: Record<string, RegExp> = {
      'produtos digitais': /produtos?\s*digitais?/i,
      'vender online': /vender?\s*online/i,
      'empreendedorismo': /empreendedor/i,
      'marketing digital': /marketing\s*digital/i,
      'curso online': /curso\s*online/i,
      'e-book': /e[-]?book/i,
      'afiliados': /afiliado/i,
      'freelance': /freelance|freela/i,
      'templates': /templates?/i,
      'software': /software|aplicativo/i,
      'taxa zero': /taxa\s*zero/i,
      'kd points': /kd\s*points/i,
      'saque pix': /saque\s*pix|pix/i,
    }

    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(lower) && !autoTags.includes(tag)) {
        autoTags.push(tag)
      }
    }

    return autoTags.slice(0, 8)
  }

  /**
   * Retorna ícone da categoria
   */
  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category.toLowerCase()] || '📦'
  }

  /**
   * Calcula tempo de leitura
   */
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
  }

  /**
   * Gera FAQ Schema JSON-LD
   */
  generateFAQSchema(faqs: FAQItem[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.filter(f => f.isPublished).map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    }
  }

  /**
   * Gera BreadcrumbList Schema
   */
  generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }
  }
}

export const contentEngine = new ContentEngine()
