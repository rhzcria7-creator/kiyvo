// ─────────────────────────────────────────────────────────────
// Admin Products API v0.0.1 — Gestão de produtos pelo admin
// Aprovar, rejeitar, destacar, boost
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || 'pending'
  const search = searchParams.get('q')

  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({ products: [], total: 0, page, totalPages: 0 })
  }

  let query = supabase
    .from('products')
    .select('*, profiles!inner(full_name, username, email)', { count: 'exact' })

  if (status === 'all') {
    // no filter
  } else if (status === 'flagged') {
    query = query.eq('approval_status', 'flagged')
  } else {
    query = query.eq('approval_status', status)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,profiles.full_name.ilike.%${search}%`)
  }

  query = query.order('created_at', { ascending: false })
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) return errorResponse(error.message)

  return successResponse(
    (data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      status: p.approval_status,
      sellerName: p.profiles?.full_name || p.profiles?.username || 'Unknown',
      sellerEmail: p.profiles?.email,
      hasBoost: p.has_boost,
      totalSales: p.total_sales,
      rating: p.rating,
      createdAt: p.created_at,
    })),
    { total: count || 0, page, pageSize: limit, totalPages: Math.ceil((count || 0) / limit) }
  )
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { productId, action, adminId, reason } = body

  if (!productId || !action) return errorResponse('productId e action obrigatórios')

  const supabase = await trySupabase()
  if (!supabase) return errorResponse('Supabase não configurado')

  const updates: Record<string, any> = {}

  switch (action) {
    case 'approve':
      updates.approval_status = 'approved'
      updates.is_approved = true
      break
    case 'reject':
      updates.approval_status = 'rejected'
      updates.is_approved = false
      updates.rejection_reason = reason || 'Produto não aprovado'
      break
    case 'flag':
      updates.approval_status = 'flagged'
      break
    case 'feature':
      updates.is_featured = true
      break
    case 'unfeature':
      updates.is_featured = false
      break
    case 'boost':
      updates.has_boost = true
      updates.boost_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      break
    default:
      return errorResponse('Ação inválida')
  }

  const { error } = await supabase.from('products').update(updates).eq('id', productId)
  if (error) return errorResponse(error.message)

  await supabase.from('audit_logs').insert({
    action: `product.${action}`,
    actor_id: adminId || 'system',
    actor_role: 'admin',
    target: productId,
    target_type: 'product',
    description: `Produto ${action}: ${reason || ''}`,
  })

  return successResponse({ productId, action, success: true })
}
