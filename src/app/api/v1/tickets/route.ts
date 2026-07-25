// ─────────────────────────────────────────────────────────────
// Support Tickets API v0.0.1 — Sistema de tickets de suporte
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { supportTicketEngine } from '@/domain/ticket/SupportTicketEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ tickets: [], total: 0 })
  
  let query = supabase.from('tickets').select('*', { count: 'exact' }).eq('user_id', userId)
  if (status) query = query.eq('status', status)
  query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  
  const { data, count, error } = await query
  if (error) return errorResponse(error.message)
  return successResponse({ tickets: data || [], total: count || 0 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, subject, description, category, priority, orderId } = body
  if (!userId || !subject || !description) return errorResponse('userId, subject e description obrigatórios')

  const ticket = supportTicketEngine.create({ userId, subject, description, category, priority, orderId })
  const supabase = await trySupabase()
  if (!supabase) return successResponse(ticket)

  const { data, error } = await supabase.from('tickets').insert({
    id: ticket.id, user_id: userId, subject, description, category: category || 'other',
    priority: priority || 'normal', status: 'open', order_id: orderId,
    sla_deadline: ticket.slaDeadline,
  }).select().single()
  
  if (error) return errorResponse(error.message)
  return successResponse(data)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { ticketId, action, message, authorId, authorRole, rating } = body
  if (!ticketId || !action) return errorResponse('ticketId e action obrigatórios')

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ ticketId, action, status: 'demo' })

  const { data: ticket } = await supabase.from('tickets').select('*').eq('id', ticketId).single()
  if (!ticket) return errorResponse('Ticket não encontrado', 404)

  const updates: Record<string, any> = {}
  if (action === 'close') { updates.status = 'closed'; updates.resolved_at = new Date().toISOString() }
  else if (action === 'resolve') { updates.status = 'resolved'; updates.resolved_at = new Date().toISOString() }
  else if (action === 'reopen') { updates.status = 'open' }
  
  if (message) {
    await supabase.from('ticket_messages').insert({
      ticket_id: ticketId, author_id: authorId || 'system', author_role: authorRole || 'user',
      message, created_at: new Date().toISOString(),
    })
  }
  if (rating) updates.satisfaction = rating

  await supabase.from('tickets').update(updates).eq('id', ticketId)
  return successResponse({ ticketId, action, success: true })
}
