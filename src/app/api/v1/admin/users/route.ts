// ─────────────────────────────────────────────────────────────
// Admin Users API v0.0.1 — Gestão de usuários pelo admin
// Listar, banir, aprovar KYC, alterar nível
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('q')
  const role = searchParams.get('role') // 'seller' | 'buyer' | 'all'
  const kycStatus = searchParams.get('kyc')
  const sort = searchParams.get('sort') || 'created_at'

  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({ users: [], total: 0, page, totalPages: 0 })
  }

  let query = supabase.from('profiles').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
  }
  if (role === 'seller') query = query.eq('is_seller', true)
  if (kycStatus) query = query.eq('kyc_status', kycStatus)

  switch (sort) {
    case 'sales': query = query.order('total_sales', { ascending: false }); break
    case 'revenue': query = query.order('total_revenue', { ascending: false }); break
    case 'rating': query = query.order('rating', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) return errorResponse(error.message)

  return successResponse(
    (data || []).map((u: any) => ({
      id: u.id,
      name: u.full_name || u.username,
      email: u.email,
      username: u.username,
      avatar: u.avatar_url,
      level: u.seller_level,
      rating: u.rating,
      totalSales: u.total_sales,
      isSeller: u.is_seller,
      isAdmin: u.is_admin,
      kycStatus: u.kyc_status,
      isBanned: u.is_banned,
      riskScore: u.risk_score,
      created_at: u.created_at,
    })),
    { total: count || 0, page, pageSize: limit, totalPages: Math.ceil((count || 0) / limit) }
  )
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { userId, action, value, adminId } = body

  if (!userId || !action) return errorResponse('userId e action obrigatórios')

  const supabase = await trySupabase()
  if (!supabase) return errorResponse('Supabase não configurado')

  const updates: Record<string, any> = {}

  switch (action) {
    case 'ban':
      updates.is_banned = true
      updates.ban_reason = value || 'Violação dos termos'
      break
    case 'unban':
      updates.is_banned = false
      updates.ban_reason = null
      break
    case 'set_level':
      updates.seller_level = value
      break
    case 'set_admin':
      updates.is_admin = value === true
      break
    case 'approve_kyc':
      updates.kyc_status = 'approved'
      break
    case 'reject_kyc':
      updates.kyc_status = 'rejected'
      break
    default:
      return errorResponse('Ação inválida')
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) return errorResponse(error.message)

  // Audit log
  await supabase.from('audit_logs').insert({
    action: `admin.${action}`,
    actor_id: adminId || 'system',
    actor_role: 'admin',
    target: userId,
    target_type: 'user',
    description: `Admin ${action}: ${value || ''}`,
  })

  return successResponse({ userId, action, success: true })
}
