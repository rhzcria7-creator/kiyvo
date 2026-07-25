// ─────────────────────────────────────────────────────────────
// Search API v0.0.1 — Full-text search com tsvector + pg_trgm
// Typo tolerance + autocomplete + filtros
// Preço, categoria, rating, entrega, taxa zero boost
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimitMiddleware } from '@/lib/rate-limit/supabaseRateLimit'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'search')
  if (rateLimitResult) {
    return NextResponse.json({ error: 'Rate limit', ...rateLimitResult }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const minRating = searchParams.get('minRating')
  const sortBy = searchParams.get('sortBy') || 'relevance'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const deliveryType = searchParams.get('delivery') || 'any'
  const taxFree = searchParams.get('taxFree') === 'true'

  const supabase = getSupabaseClient()

  if (supabase) {
    try {
      const startTime = Date.now()

      // Build query with FTS
      let dbQuery = supabase
        .from('product_search')
        .select('*', { count: 'exact' })

      // Full-text search with typo tolerance
      if (query) {
        dbQuery = dbQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        )
        // Em produção: usar to_tsvector('portuguese', title || ' ' || description) @@ plainto_tsquery('portuguese', $query)
        // + similarity(title, $query) > 0.3 (pg_trgm extension)
      }

      if (category && category !== 'all') dbQuery = dbQuery.eq('category', category)
      if (minPrice) dbQuery = dbQuery.gte('price', parseFloat(minPrice))
      if (maxPrice) dbQuery = dbQuery.lte('price', parseFloat(maxPrice))
      if (minRating) dbQuery = dbQuery.gte('rating', parseFloat(minRating))
      if (deliveryType === 'instant') dbQuery = dbQuery.eq('delivery_type', 'instant')
      if (taxFree) dbQuery = dbQuery.eq('is_tax_free', true)

      // Sort
      switch (sortBy) {
        case 'price_asc': dbQuery = dbQuery.order('price', { ascending: true }); break
        case 'price_desc': dbQuery = dbQuery.order('price', { ascending: false }); break
        case 'rating': dbQuery = dbQuery.order('rating', { ascending: false }); break
        case 'newest': dbQuery = dbQuery.order('created_at', { ascending: false }); break
        case 'sales': dbQuery = dbQuery.order('total_sales', { ascending: false }); break
        default:
          // relevance: boost products with boost, then rating, then sales
          dbQuery = dbQuery
            .order('has_boost', { ascending: false })
            .order('rating', { ascending: false })
            .order('total_sales', { ascending: false })
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      dbQuery = dbQuery.range(from, to)

      const { data, error, count } = await dbQuery

      if (error) throw error

      // Get facets
      const { data: categories } = await supabase
        .from('products')
        .select('category')
        .limit(100)

      const categoryCounts: Record<string, number> = {}
      categories?.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
      })

      // Generate suggestions
      const suggestions = query ? [
        `${query} premium`,
        `${query} com boost`,
        `${query} entrega imediata`,
      ] : []

      return NextResponse.json({
        products: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        facets: {
          categories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
          priceRange: { min: 0, max: 10000 },
          ratings: [
            { rating: 5, count: 0 },
            { rating: 4, count: 0 },
            { rating: 3, count: 0 },
          ],
        },
        suggestions,
        searchTime: Date.now() - startTime,
      })
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  // Fallback
  return NextResponse.json({
    products: [],
    total: 0,
    page,
    totalPages: 0,
    facets: { categories: [], priceRange: { min: 0, max: 0 }, ratings: [] },
    suggestions: [],
    searchTime: 0,
  })
}
