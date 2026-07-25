// ─────────────────────────────────────────────────────────────
// Blog SEO Engine v0.0.1 — SEO otimizado, sitemap dinâmico, OG images
// Schema.org Article, JSON-LD, keywords automáticas
// ─────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  authorId: string
  authorName: string
  authorAvatar: string
  readingTime: number
  isPublished: boolean
  publishedAt: string
  viewCount: number
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  ogImage: string
  schemaType: 'Article' | 'BlogPosting' | 'NewsArticle'
}

export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export class BlogSEOEngine {
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
   * Gera meta title otimizado para SEO
   */
  generateMetaTitle(title: string, category: string): string {
    return `${title} | KIYVO Blog — ${category}`
  }

  /**
   * Gera meta description
   */
  generateMetaDescription(excerpt: string, maxLength: number = 160): string {
    if (excerpt.length <= maxLength) return excerpt
    return excerpt.slice(0, maxLength - 3) + '...'
  }

  /**
   * Gera JSON-LD Article Schema
   */
  generateArticleSchema(post: BlogPost): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': post.schemaType,
      headline: post.title,
      description: post.metaDescription,
      image: post.ogImage,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'KIYVO',
        logo: {
          '@type': 'ImageObject',
          url: 'https://kiyvo.com.br/logo-full.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': post.canonicalUrl,
      },
    }
  }

  /**
   * Gera sitemap dinâmico
   */
  generateSitemap(posts: BlogPost[], baseUrl: string): SitemapEntry[] {
    const entries: SitemapEntry[] = [
      { url: baseUrl, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/categories`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/trending`, lastModified: new Date().toISOString(), changeFrequency: 'hourly', priority: 0.8 },
    ]

    for (const post of posts) {
      if (post.isPublished) {
        entries.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.publishedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }

    return entries
  }

  /**
   * Gera XML Sitemap string
   */
  generateSitemapXML(entries: SitemapEntry[]): string {
    const urls = entries.map(e => `
  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  }

  /**
   * Gera tags automáticas baseadas no conteúdo
   */
  extractTags(content: string, existingTags: string[] = []): string[] {
    const commonTags = [
      'marketplace digital', 'produtos digitais', 'vender online', 'empreendedorismo',
      'curso online', 'e-book', 'marketing digital', 'afiliados', 'taxa zero',
      'freelance', 'templates', 'software', 'kiyvo', 'kd points',
    ]

    const foundTags = existingTags.filter(t => content.toLowerCase().includes(t.toLowerCase()))
    const autoTags = commonTags.filter(t => content.toLowerCase().includes(t.toLowerCase()))

    return Array.from(new Set([...foundTags, ...autoTags]))
  }

  /**
   * Gera URL canônica
   */
  generateCanonical(baseUrl: string, slug: string): string {
    return `${baseUrl}/blog/${slug}`
  }
}

export const blogSEOEngine = new BlogSEOEngine()
