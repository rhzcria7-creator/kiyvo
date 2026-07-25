// ─────────────────────────────────────────────────────────────
// Export API v0.0.1 — Exportação de dados CSV/JSON
// Vendas, produtos, usuários, financeiro
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'sales'
  const format = searchParams.get('format') || 'csv'
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('from')
  const endDate = searchParams.get('to')

  const supabase = await trySupabase()
  if (!supabase) return errorResponse('Supabase não configurado')

  let data: any[] = []
  let headers: string[] = []

  switch (type) {
    case 'sales': {
      let query = supabase.from('orders').select('*, profiles!inner(email, full_name)')
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)
      if (userId) query = query.eq('buyer_id', userId)

      const { data: orders } = await query.order('created_at', { ascending: false }).limit(1000)
      data = (orders || []).map((o: any) => ({
        'ID Pedido': o.order_number || o.id,
        'Data': new Date(o.created_at).toLocaleString('pt-BR'),
        'Valor': o.total_amount,
        'Status': o.status,
        'Pagamento': o.payment_method,
        'Comprador': o.profiles?.full_name || o.profiles?.email || '',
      }))
      headers = ['ID Pedido', 'Data', 'Valor', 'Status', 'Pagamento', 'Comprador']
      break
    }

    case 'products': {
      const { data: products } = await supabase
        .from('products')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(1000)

      data = (products || []).map((p: any) => ({
        'ID': p.id,
        'Título': p.title,
        'Preço': p.price,
        'Categoria': p.category,
        'Vendas': p.total_sales,
        'Rating': p.rating,
        'Status': p.is_active ? 'Ativo' : 'Inativo',
        'Vendedor': p.profiles?.full_name || '',
      }))
      headers = ['ID', 'Título', 'Preço', 'Categoria', 'Vendas', 'Rating', 'Status', 'Vendedor']
      break
    }

    case 'users': {
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      data = (users || []).map((u: any) => ({
        'ID': u.id,
        'Nome': u.full_name || u.username,
        'Email': u.email,
        'Nível': u.seller_level,
        'Vendas': u.total_sales,
        'Rating': u.rating,
        'KYC': u.kyc_status,
        'Data': new Date(u.created_at).toLocaleString('pt-BR'),
      }))
      headers = ['ID', 'Nome', 'Email', 'Nível', 'Vendas', 'Rating', 'KYC', 'Data']
      break
    }

    case 'financial': {
      const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(1000)

      data = (transactions || []).map((t: any) => ({
        'ID': t.id,
        'Usuário': t.profiles?.full_name || t.profiles?.email || '',
        'Tipo': t.type,
        'Valor': t.amount,
        'Referência': t.reference_id,
        'Status': t.status,
        'Data': new Date(t.created_at).toLocaleString('pt-BR'),
      }))
      headers = ['ID', 'Usuário', 'Tipo', 'Valor', 'Referência', 'Status', 'Data']
      break
    }

    default:
      return errorResponse('Tipo de exportação inválido')
  }

  if (format === 'json') {
    return NextResponse.json({ success: true, data, headers })
  }

  // CSV
  const csvRows = [headers.join(','), ...data.map((row: any) =>
    headers.map(h => {
      const val = row[h] ?? ''
      const str = String(val)
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(','))
  ]

  const csv = csvRows.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kiyvo_${type}_${Date.now()}.csv"`,
    },
  })
}
