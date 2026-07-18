// ─────────────────────────────────────────────────────────────
// API v1 Categories — Categorias do Supabase
// Endpoint PÚBLICO — usa client normal (respeita RLS)
// Admin client apenas para contagem de produtos
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/categories?featured=true&limit=20
 * Endpoint público — categorias ativas com contagem de produtos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Usar client normal (respeita RLS) para leitura pública
    const supabase = createClient()

    let query = supabase
      .from('categories')
      .select('id, name, slug, icon, image_url, is_active, is_featured, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (featured) {
      query = query.eq('is_featured', true)
    }

    const { data: categories, error } = await query

    if (error) {
      // Tabela pode não existir ainda
      return NextResponse.json({ categories: [] })
    }

    // Contagem de produtos — usa admin client para bypassar RLS em products
    const admin = createAdminClient()
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (cat: Record<string, unknown>) => {
        let productCount = 0
        if (admin) {
          const { count } = await admin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'published')
          productCount = count || 0
        }
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || '📦',
          image_url: cat.image_url || null,
          product_count: productCount,
          is_active: cat.is_active,
          is_featured: cat.is_featured || false,
          sort_order: cat.sort_order || 0,
        }
      })
    )

    return NextResponse.json({ categories: categoriesWithCount })
  } catch {
    // Tabela pode não existir ainda — retornar vazio
    return NextResponse.json({ categories: [] })
  }
}
