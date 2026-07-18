// ─────────────────────────────────────────────────────────────
// API v1 Blog — Posts publicados do Supabase
// Endpoint PÚBLICO — usa client normal (respeita RLS)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/blog?limit=3&slug=xxx
 * Busca posts publicados com dados do autor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const slug = searchParams.get('slug')

    // Client normal — respeita RLS (só busca is_published=true)
    const supabase = createClient()

    if (slug) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, image_url, category, read_time, created_at, is_published, author:profiles!blog_posts_author_id_fkey(id, username, avatar_url)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) {
        return NextResponse.json({ posts: [] })
      }

      const author = ((data as Record<string, unknown>)?.author || {}) as Record<string, unknown>
      const post = {
        id: (data as Record<string, unknown>).id,
        title: (data as Record<string, unknown>).title,
        slug: (data as Record<string, unknown>).slug,
        excerpt: (data as Record<string, unknown>).excerpt,
        content: (data as Record<string, unknown>).content || null,
        image_url: (data as Record<string, unknown>).image_url || null,
        category: (data as Record<string, unknown>).category || 'Geral',
        read_time: (data as Record<string, unknown>).read_time || '5 min',
        created_at: (data as Record<string, unknown>).created_at,
        author_name: author.username || 'Kiyvo',
        author_avatar: author.avatar_url || null,
      }

      return NextResponse.json({ post })
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, image_url, category, read_time, created_at, is_published, author:profiles!blog_posts_author_id_fkey(id, username, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ posts: [] })
    }

    const formatPost = (p: Record<string, unknown>) => {
      const author = (p.author || {}) as Record<string, unknown>
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content || null,
        image_url: p.image_url || null,
        category: p.category || 'Geral',
        read_time: p.read_time || '5 min',
        created_at: p.created_at,
        author_name: author.username || 'Kiyvo',
        author_avatar: author.avatar_url || null,
      }
    }

    const posts = ((data || []) as Record<string, unknown>[]).map(formatPost)
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
