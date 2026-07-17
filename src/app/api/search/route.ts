// ─────────────────────────────────────────────────────────────
// API Search — Full Text Search com tsvector nativo do Postgres
// Usa o search_vector indexado em products para busca performática
// Substitui 100% dos dados mock por queries reais no Supabase
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeSearchQuery } from '@/lib/security'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * GET /api/search?q=termo&category=slug&sort=relevance&min_price=0&max_price=500&page=1
 *
 * Busca produtos usando Full Text Search nativo do PostgreSQL
 * O campo search_vector é atualizado automaticamente via trigger
 * Usa índice GIN para performance O(log n) em milhões de registros
 */
export async function GET(request: NextRequest) {
  try {
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
    const { allowed } = rateLimit(ip, 30, 60000)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const sanitizedQuery = sanitizeSearchQuery(query)

    if (!sanitizedQuery && !category && !productType) {
      return NextResponse.json({
        data: { products: [], categories: [], sellers: [] },
        total: 0,
        page,
        limit,
        query: '',
      })
    }

    const supabase = getAdmin()

    // Buscar produtos com Full Text Search
    let productQuery = supabase
      .from('products')
      .select(`
        id, title, slug, base_price, original_price, currency,
        product_type, is_digital, delivery_type, sales_count,
        rating, review_count, status, tags, created_at,
        vendors!inner (id, store_name, slug, logo_url, rating_avg),
        categories (id, name, slug),
        product_images (image_url, is_primary, display_order)
      `, { count: 'exact' })
      .eq('status', 'published')

    // Full Text Search com tsvector
    if (sanitizedQuery) {
      productQuery = productQuery.textSearch('search_vector', sanitizedQuery, {
        type: 'plain',
        config: 'portuguese',
      })
    }

    if (category) {
      productQuery = productQuery.eq('categories.slug', category)
    }

    if (productType) {
      productQuery = productQuery.eq('product_type', productType)
    }

    if (minPrice > 0) {
      productQuery = productQuery.gte('base_price', minPrice)
    }

    if (maxPrice > 0) {
      productQuery = productQuery.lte('base_price', maxPrice)
    }

    // Ordenação
    switch (sortBy) {
      case 'price_asc':
        productQuery = productQuery.order('base_price', { ascending: true })
        break
      case 'price_desc':
        productQuery = productQuery.order('base_price', { ascending: false })
        break
      case 'rating':
        productQuery = productQuery.order('rating', { ascending: false })
        break
      case 'sales':
        productQuery = productQuery.order('sales_count', { ascending: false })
        break
      case 'newest':
        productQuery = productQuery.order('created_at', { ascending: false })
        break
      default:
        productQuery = productQuery.order('sales_count', { ascending: false })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    productQuery = productQuery.range(from, to)

    const { data: products, count: productsTotal, error: productsError } = await productQuery

    if (productsError) {
      return NextResponse.json({ error: 'Search failed', details: productsError.message }, { status: 500 })
    }

    // Buscar categorias que correspondem à query
    let categoriesData: Record<string, unknown>[] = []
    if (sanitizedQuery) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, icon, is_active')
        .eq('is_active', true)
        .ilike('name', `%${sanitizedQuery}%`)
        .limit(10)
      categoriesData = cats || []
    } else if (category) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, icon, is_active')
        .eq('slug', category)
        .eq('is_active', true)
      categoriesData = cats || []
    } else {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, icon, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(10)
      categoriesData = cats || []
    }

    // Buscar vendedores que correspondem à query
    let sellersData: Record<string, unknown>[] = []
    if (sanitizedQuery) {
      const { data: sellers } = await supabase
        .from('vendors')
        .select('id, store_name, slug, logo_url, rating_avg, total_sales, is_verified')
        .eq('is_active', true)
        .ilike('store_name', `%${sanitizedQuery}%`)
        .limit(5)
      sellersData = sellers || []
    }

    // Formatar produtos para o frontend
    const formattedProducts = (products || []).map((p: Record<string, unknown>) => {
      const vendor = (p.vendors || {}) as Record<string, unknown>
      const cat = (p.categories || {}) as Record<string, unknown>
      const images = (p.product_images || []) as Record<string, unknown>[]
      const primaryImage = images.find((img: Record<string, unknown>) => img.is_primary) || images[0]

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        base_price: p.base_price,
        original_price: p.original_price,
        currency: p.currency || 'BRL',
        product_type: p.product_type,
        delivery_type: p.delivery_type,
        sales_count: p.sales_count || 0,
        rating: p.rating || 0,
        review_count: p.review_count || 0,
        tags: p.tags,
        type: 'product',
        category: cat.name || '',
        categorySlug: cat.slug || '',
        vendor: {
          store_name: vendor.store_name || '',
          slug: vendor.slug || '',
          logo_url: vendor.logo_url || '',
          rating_avg: vendor.rating_avg || 0,
        },
        image: primaryImage?.image_url || '',
      }
    })

    const data = {
      products: formattedProducts,
      categories: categoriesData.map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        type: 'category',
      })),
      sellers: sellersData.map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.store_name,
        slug: s.slug,
        logo_url: s.logo_url,
        rating: s.rating_avg,
        sales: s.total_sales,
        verified: s.is_verified,
        type: 'seller',
      })),
    }

    return NextResponse.json({
      data,
      total: productsTotal || 0,
      page,
      limit,
      totalPages: Math.ceil((productsTotal || 0) / limit),
      query: sanitizedQuery,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
