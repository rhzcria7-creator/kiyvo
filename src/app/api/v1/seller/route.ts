// ─────────────────────────────────────────────────────────────
// Seller API v0.0.1 — Gestão de vendedores
// Produtos, vendas, reputação, boost
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sellerId = searchParams.get('sellerId')
  const slug = searchParams.get('slug')

  if (!sellerId && !slug) return errorResponse('sellerId ou slug obrigatório')

  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({
      id: sellerId || 'demo',
      name: 'Vendedor Demo',
      level: 'bronze',
      rating: 4.5,
      totalProducts: 0,
      totalSales: 0,
      memberSince: new Date().toISOString(),
      responseTime: 0,
      badge: '🔰',
    })
  }

  let query = supabase.from('profiles').select('*')
  if (slug) query = query.eq('username', slug)
  else query = query.eq('id', sellerId)

  const { data: profile } = await query.single()
  if (!profile) return errorResponse('Vendedor não encontrado', 404)

  const { count: totalProducts } = await supabase
    .from('products').select('*', { count: 'exact', head: true })
    .eq('seller_id', profile.id)
    .eq('is_active', true)

  const { count: totalSales } = await supabase
    .from('order_items').select('*', { count: 'exact', head: true })
    .eq('seller_id', profile.id)

  const { data: recentProducts } = await supabase
    .from('products').select('id, title, slug, price, thumbnail, rating, total_sales')
    .eq('seller_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return successResponse({
    id: profile.id,
    name: profile.full_name || profile.username,
    username: profile.username,
    avatar: profile.avatar_url,
    level: profile.seller_level || 'bronze',
    rating: profile.rating || 0,
    reviewCount: profile.review_count || 0,
    totalProducts: totalProducts || 0,
    totalSales: totalSales || 0,
    memberSince: profile.created_at,
    bio: profile.bio,
    kycStatus: profile.kyc_status,
    responseTime: 0,
    badge: profile.kyc_status === 'approved' ? '✅' : '🔰',
    products: recentProducts || [],
  })
}
