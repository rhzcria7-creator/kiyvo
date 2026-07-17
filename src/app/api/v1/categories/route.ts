// ─────────────────────────────────────────────────────────────
// API v1 Categories — Categorias reais do Supabase
// Substitui mockCategories por dados reais
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * GET /api/v1/categories?featured=true&limit=20
 * Busca categorias ativas com contagem de produtos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    const supabase = getAdmin()

    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (featured) {
      query = query.eq('is_featured', true)
    }

    const { data: categories, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar contagem de produtos por categoria
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (cat: Record<string, unknown>) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .eq('status', 'published')

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || '📦',
          image_url: cat.image_url || null,
          product_count: count || 0,
          is_active: cat.is_active,
          is_featured: cat.is_featured || false,
          sort_order: cat.sort_order || 0,
        }
      })
    )

    return NextResponse.json({ categories: categoriesWithCount })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar categorias'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
