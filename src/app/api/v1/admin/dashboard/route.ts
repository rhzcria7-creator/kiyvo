// ─────────────────────────────────────────────────────────────
// API Admin Dashboard — Métricas reais do Supabase
// PROTEGIDO: Requer autenticação de administrador
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { requireAdmin, getSafeAdminClient } from '@/lib/auth/server'

export async function GET() {
  // Verificar se é admin
  const { user, adminClient, error: authError } = await requireAdmin()

  if (authError || !user) {
    return NextResponse.json({ error: authError || 'Não autorizado' }, { status: 401 })
  }

  try {
    const supabase = getSafeAdminClient(adminClient)

    // Buscar métricas em paralelo
    const [
      usersResult,
      productsResult,
      ordersTodayResult,
      revenueResult,
      disputesResult,
      verificationsResult,
      recentOrdersResult,
    ] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('orders').select('total_amount').eq('status', 'completed').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('kyc_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id, status, created_at, buyer:profiles!orders_buyer_id_fkey(username), product:products(title)').order('created_at', { ascending: false }).limit(10),
    ])

    const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0
    const activeProducts = productsResult.status === 'fulfilled' ? (productsResult.value.count || 0) : 0
    const ordersToday = ordersTodayResult.status === 'fulfilled' ? (ordersTodayResult.value.count || 0) : 0
    const openDisputes = disputesResult.status === 'fulfilled' ? (disputesResult.value.count || 0) : 0
    const pendingVerifications = verificationsResult.status === 'fulfilled' ? (verificationsResult.value.count || 0) : 0

    let revenueMonth = 0
    if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
      revenueMonth = (revenueResult.value.data as Record<string, unknown>[]).reduce((sum, order) => {
        return sum + (Number(order.total_amount) || 0)
      }, 0)
    }

    const activities: Array<{
      id: string
      type: 'order' | 'verify' | 'dispute'
      message: string
      time: string
    }> = []

    if (recentOrdersResult.status === 'fulfilled' && recentOrdersResult.value.data) {
      (recentOrdersResult.value.data as Record<string, unknown>[]).forEach((order) => {
        const product = (order.product || {}) as Record<string, unknown>
        const status = order.status as string
        activities.push({
          id: order.id as string,
          type: 'order',
          message: status === 'completed'
            ? `Pedido entregue — ${product.title || 'Produto'}`
            : `Novo pedido — ${product.title || 'Produto'}`,
          time: getTimeAgo(order.created_at as string),
        })
      })
    }

    return NextResponse.json({
      stats: { totalUsers, activeProducts, ordersToday, revenueMonth, openDisputes, pendingVerifications },
      activities,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar métricas'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getTimeAgo(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin} min`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h`
    return `${Math.floor(diffHours / 24)}d`
  } catch {
    return 'agora'
  }
}
