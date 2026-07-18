// ─────────────────────────────────────────────────────────────
// API Admin Dashboard — Métricas reais do Supabase
// Zero mock — todas as métricas vem do banco
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

export async function GET() {
  try {
    const supabase = getAdmin()

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
      // Total de usuários
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      // Produtos ativos
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      // Pedidos hoje
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      // Receita do mês
      supabase.from('orders').select('total_amount').eq('status', 'completed').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      // Disputas abertas
      supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      // Verificações pendentes
      supabase.from('kyc_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      // Pedidos recentes para feed de atividades
      supabase.from('orders').select('id, status, created_at, buyer:profiles!orders_buyer_id_fkey(username), product:products(title)').order('created_at', { ascending: false }).limit(10),
    ])

    // Extrair contagens
    const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0
    const activeProducts = productsResult.status === 'fulfilled' ? (productsResult.value.count || 0) : 0
    const ordersToday = ordersTodayResult.status === 'fulfilled' ? (ordersTodayResult.value.count || 0) : 0
    const openDisputes = disputesResult.status === 'fulfilled' ? (disputesResult.value.count || 0) : 0
    const pendingVerifications = verificationsResult.status === 'fulfilled' ? (verificationsResult.value.count || 0) : 0

    // Calcular receita
    let revenueMonth = 0
    if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
      revenueMonth = (revenueResult.value.data as Record<string, unknown>[]).reduce((sum, order) => {
        return sum + (Number(order.total_amount) || 0)
      }, 0)
    }

    // Mapear atividades
    const activities: Array<{
      id: string
      type: 'order' | 'verify' | 'dispute'
      message: string
      time: string
    }> = []

    if (recentOrdersResult.status === 'fulfilled' && recentOrdersResult.value.data) {
      (recentOrdersResult.value.data as Record<string, unknown>[]).forEach((order) => {
        const buyer = (order.buyer || {}) as Record<string, unknown>
        const product = (order.product || {}) as Record<string, unknown>
        const status = order.status as string
        const timeAgo = getTimeAgo(order.created_at as string)

        activities.push({
          id: order.id as string,
          type: 'order',
          message: status === 'completed'
            ? `Pedido entregue — ${product.title || 'Produto'}`
            : `Novo pedido — ${product.title || 'Produto'}`,
          time: timeAgo,
        })
      })
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        activeProducts,
        ordersToday,
        revenueMonth,
        openDisputes,
        pendingVerifications,
      },
      activities,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar métricas'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getTimeAgo(isoDate: string): string {
  try {
    const now = new Date()
    const date = new Date(isoDate)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin} min`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d`
  } catch {
    return 'agora'
  }
}
