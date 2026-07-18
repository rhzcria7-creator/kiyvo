// ─────────────────────────────────────────────────────────────
// Blog Page — Server Component com metadata SEO
// Busca posts do Supabase no servidor (SEO-friendly)
// ─────────────────────────────────────────────────────────────

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BlogListClient } from '@/components/blog/BlogListClient'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  image_url: string | null
  category: string
  read_time: string
  created_at: string
  author_name: string
  author_avatar: string | null
}

// Metadata para SEO
export const metadata: Metadata = {
  title: 'Blog KIYVO — Dicas, novidades e guias sobre produtos digitais',
  description: 'Leia os melhores artigos sobre mercado digital, dicas de compra e venda, segurança online e novidades do KIYVO.',
  openGraph: {
    title: 'Blog KIYVO',
    description: 'Dicas, novidades e guias sobre produtos digitais',
    url: 'https://kiyvo.com/blog',
    type: 'website',
  },
}

// ISR: revalidar a cada 1 hora
export const revalidate = 3600

export default async function BlogPage() {
  let posts: BlogPostData[] = []
  let error: string | null = null

  try {
    const supabase = createClient()

    const { data, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, image_url, category, read_time, created_at, author_name, author_avatar')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20)

    if (fetchError) {
      error = 'Erro ao carregar posts'
    } else if (data) {
      posts = data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        title: p.title as string,
        slug: p.slug as string,
        excerpt: p.excerpt as string,
        image_url: (p.image_url as string) || null,
        category: (p.category as string) || 'Geral',
        read_time: (p.read_time as string) || '5 min',
        created_at: p.created_at as string,
        author_name: (p.author_name as string) || 'Equipe KIYVO',
        author_avatar: (p.author_avatar as string) || null,
      }))
    }
  } catch {
    error = 'Serviço temporariamente indisponível'
  }

  return <BlogListClient posts={posts} error={error} />
}
