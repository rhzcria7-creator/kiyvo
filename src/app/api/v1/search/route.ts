// ─────────────────────────────────────────────────────────────
// API v1 Search — Full Text Search com tsvector nativo do Postgres
// Usa o search_vector indexado em products para busca performática
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeSearchQuery } from '@/lib/security'

/**
 * GET /api/v1/search?q=termo&category=slug&sort=relevance&min_price=0&max_price=500&page=1
 * 
 * Busca produtos usando Full Text Search nativo do PostgreSQL
 * O campo search_vector é atualizado automaticamente via trigger
 * Usa índice GIN para performance O(log n) em milhões de registros
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category')
  const minPrice = parseFloat(searchParams.get('min_price') || '0')
  const maxPrice = parseFloat(searchParams.get('max_price') || '0')
  const sortBy = searchParams.get('sort') || 'relevance'
  const productType = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = rateLimit(ip, 30, 60000) // 30 req/min
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Sanitizar query
  const sanitizedQuery = sanitizeSearchQuery(query)

  if (!sanitizedQuery && !category && !productType) {
    return NextResponse.json({
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      query: '',
    })
  }

  const supabase = createAdminClient()

  if (!supabase) {
    return NextResponse.json({
      data: { products: [], categories: [], sellers: [] },
      total: 0,
      page,
      limit,
      query: sanitizedQuery,
      error: 'Serviço indisponível',
    }, { status: 503 })
  }

  try {
    // ─── BUSCA COM FULL TEXT SEARCH (tsvector) ─────────────────
    // A função plainto_tsquery converte texto normal em query tsvector
    // O operador @@ faz a busca no índice GIN
    // ts_rank ordena por relevância

    let queryBuilder = supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        base_price,
        original_price,
        currency,
        product_type,
        is_digital,
        delivery_type,
        sales_count,
        rating,
        review_count,
        status,
        tags,
        created_at,
        vendors!inner (
          id,
          store_name,
          slug,
          logo_url,
          rating_avg
        ),
        categories (
          id,
          name,
          slug
        ),
        product_images (
          image_url,
          is_primary,
          display_order
        )
      `, { count: 'exact' })
      .eq('status', 'published') // RLS: só produtos publicados

    // Full Text Search com tsvector
    if (sanitizedQuery) {
      // Usar plainto_tsquery para busca natural em português
      // O índice GIN em search_vector garante performance
      queryBuilder = queryBuilder.textSearch('search_vector', sanitizedQuery, {
        type: 'plain',  // plainto_tsquery — busca natural
        config: 'portuguese',
      })
    }

    // Filtros
    if (category) {
      queryBuilder = queryBuilder.eq('categories.slug', category)
    }

    if (productType) {
      queryBuilder = queryBuilder.eq('product_type', productType)
    }

    if (minPrice > 0) {
      queryBuilder = queryBuilder.gte('base_price', minPrice)
    }

    if (maxPrice > 0) {
      queryBuilder = queryBuilder.lte('base_price', maxPrice)
    }

    // Ordenação
    switch (sortBy) {
      case 'price_asc':
        queryBuilder = queryBuilder.order('base_price', { ascending: true })
        break
      case 'price_desc':
        queryBuilder = queryBuilder.order('base_price', { ascending: false })
        break
      case 'rating':
        queryBuilder = queryBuilder.order('rating', { ascending: false })
        break
      case 'sales':
        queryBuilder = queryBuilder.order('sales_count', { ascending: false })
        break
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
      default:
        // relevance = sales_count + rating (proxy sem ts_rank que requer RPC)
        queryBuilder = queryBuilder.order('sales_count', { ascending: false })
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data, count, error } = await queryBuilder

    if (error) {
      return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      query: sanitizedQuery,
    })
  } catch {
    return NextResponse.json({ error: 'Search error' }, { status: 500 })
  }
}


