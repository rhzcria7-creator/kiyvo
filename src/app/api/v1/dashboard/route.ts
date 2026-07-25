// ─────────────────────────────────────────────────────────────
// Dashboard API v0.0.1 — Métricas do usuário em tempo real
// Vendas, visualizações, ganhos, KD Points
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const role = searchParams.get('role') || 'buyer'

  if (!userId) return errorResponse('userId é obrigatório')

  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({
      role,
      stats: {
        totalOrders: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalKdPoints: 0,
        totalProducts: 0,
        totalViews: 0,
        averageRating: 0,
        activeBoostCount: 0,
      },
      recentActivity: [],
    })
  }

  const results: Record<string, any> = { role }

  if (role === 'buyer' || role === 'both') {
    const { count: totalOrders } = await supabase
      .from('orders').select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)

    const { data: profile } = await supabase
      .from('profiles').select('kd_points_balance, created_at')
      .eq('id', userId).single()

    const { data: recentOrders } = await supabase
      .from('orders').select('id, total_amount, status, created_at, order_number')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    results.buyerStats = {
      totalOrders: totalOrders || 0,
      kdPoints: profile?.kd_points_balance || 0,
      memberSince: profile?.created_at,
      recentOrders: recentOrders || [],
    }
  }

  if (role === 'seller' || role === 'both') {
    const { count: totalProducts } = await supabase
      .from('products').select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)

    const { count: totalSales } = await supabase
      .from('order_items').select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)

    const { data: revenueData } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'sale')

    const totalRevenue = (revenueData || []).reduce((s: number, r: any) => s + Number(r.amount), 0)

    const { data: profile } = await supabase
      .from('profiles').select('rating, review_count, seller_level')
      .eq('id', userId).single()

    const { count: activeBoosts } = await supabase
      .from('products').select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('has_boost', true)
      .gte('boost_expires_at', new Date().toISOString())

    results.sellerStats = {
      totalProducts: totalProducts || 0,
      totalSales: totalSales || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      rating: profile?.rating || 0,
      reviewCount: profile?.review_count || 0,
      sellerLevel: profile?.seller_level || 'bronze',
      activeBoosts: activeBoosts || 0,
    }
  }

  // Atividade recente
  results.recentActivity = [
    { type: 'login', description: 'Login realizado', timestamp: new Date().toISOString() },
  ]

  return successResponse(results)
}
