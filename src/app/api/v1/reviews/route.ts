// ─────────────────────────────────────────────────────────────
// API v1 Reviews — Avaliações reais do Supabase
// Busca reviews de pedidos confirmados, zero mock
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * GET /api/v1/reviews?limit=8&product_id=xxx&vendor_id=xxx
 * Busca avaliações reais com dados do comprador e produto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 50)
    const productId = searchParams.get('product_id')
    const vendorId = searchParams.get('vendor_id')

    const supabase = getAdmin()

    let query = supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        buyer:profiles!reviews_buyer_id_fkey (id, username, avatar_url),
        product:products!reviews_product_id_fkey (id, title, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (vendorId) {
      query = query.eq('products.vendor_id', vendorId)
    }

    const { data: reviews, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Formatar para o frontend
    const formatted = (reviews || []).map((r: Record<string, unknown>) => {
      const buyer = (r.buyer || {}) as Record<string, unknown>
      const product = (r.product || {}) as Record<string, unknown>

      return {
        id: r.id,
        user_name: buyer.username || 'Usuário',
        avatar_url: buyer.avatar_url || null,
        rating: r.rating || 5,
        comment: r.comment || '',
        product_title: product.title || '',
        product_slug: product.slug || '',
        created_at: r.created_at,
      }
    })

    return NextResponse.json({ reviews: formatted })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar avaliações'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
