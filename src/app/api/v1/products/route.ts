// ─────────────────────────────────────────────────────────────
// Products API v0.0.1 — CRUD de produtos real com Supabase
// Fallback DEMO_PRODUCTS se Supabase não existe
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimitMiddleware } from '@/lib/rate-limit/supabaseRateLimit'

const DEMO_PRODUCTS = [
  { id: 'demo_1', title: 'KIYVO Premium Plugin', slug: 'kiyvo-premium-plugin', price: 97, category: 'software', rating: 4.8, sales: 1234, thumbnail: 'https://picsum.photos/seed/p1/400/300' },
  { id: 'demo_2', title: 'Curso Marketing Digital 2026', slug: 'curso-marketing-digital', price: 197, category: 'cursos', rating: 4.9, sales: 892, thumbnail: 'https://picsum.photos/seed/p2/400/300' },
  { id: 'demo_3', title: 'E-book Receitas Fit', slug: 'ebook-receitas-fit', price: 27, category: 'ebooks', rating: 4.5, sales: 3456, thumbnail: 'https://picsum.photos/seed/p3/400/300' },
  { id: 'demo_4', title: 'Template Bootstrap 5', slug: 'template-bootstrap-5', price: 47, category: 'templates', rating: 4.7, sales: 567, thumbnail: 'https://picsum.photos/seed/p4/400/300' },
]

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function GET(request: NextRequest) {
  // Rate limit
  const rateLimitResult = await rateLimitMiddleware(request, 'api')
  if (rateLimitResult) {
    return NextResponse.json({ error: 'Rate limit exceeded', ...rateLimitResult }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sellerId = searchParams.get('sellerId')
  const ids = searchParams.get('ids') // comma separated

  const supabase = getSupabaseClient()

  if (supabase) {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' })

      if (category && category !== 'all') query = query.eq('category', category)
      if (minPrice) query = query.gte('price', parseFloat(minPrice))
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
      if (sellerId) query = query.eq('seller_id', sellerId)
      if (ids) {
        const idArr = ids.split(',').filter(Boolean)
        query = query.in('id', idArr)
      }

      switch (sort) {
        case 'price_asc': query = query.order('price', { ascending: true }); break
        case 'price_desc': query = query.order('price', { ascending: false }); break
        case 'rating': query = query.order('rating', { ascending: false }); break
        case 'sales': query = query.order('total_sales', { ascending: false }); break
        default: query = query.order('created_at', { ascending: false })
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return NextResponse.json({
        products: data,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      })
    } catch (err) {
      console.error('Supabase products error:', err)
      // Fallback to demo
    }
  }

  // DEMO fallback
  let products = DEMO_PRODUCTS
  if (category && category !== 'all') products = products.filter(p => p.category === category)
  
  return NextResponse.json({
    products,
    total: products.length,
    page: 1,
    totalPages: 1,
  })
}
