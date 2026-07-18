// ─────────────────────────────────────────────────────────────
// API v1 Notifications — Lista e gerencia notificações do usuário
// Suporta notificações in-app e preferências de email
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'

/**
 * GET /api/v1/notifications — Lista notificações do usuário
 * Query params: ?limit=20&offset=0&unread_only=false
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth()
    if (error || !user) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error: fetchError, count } = await query

    if (fetchError) {
      return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 })
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/notifications — Marca notificações como lidas
 * Body: { notification_ids: string[] } ou { mark_all_read: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth()
    if (error || !user) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_ids, mark_all_read } = body

    if (mark_all_read) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao marcar notificações' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Todas notificações marcadas como lidas' })
    }

    if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notification_ids)
        .eq('user_id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao marcar notificações' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: `${notification_ids.length} notificações marcadas como lidas` })
    }

    return NextResponse.json({ error: 'notification_ids ou mark_all_read é obrigatório' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * PUT /api/v1/notifications/preferences — Atualiza preferências de notificação
 * Body: { email_notifications: boolean, push_notifications: boolean }
 */
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth()
    if (error || !user) {
      return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
    }

    const body = await request.json()
    const { email_notifications, push_notifications } = body

    const updates: Record<string, unknown> = {}
    if (typeof email_notifications === 'boolean') updates.email_notifications = email_notifications
    if (typeof push_notifications === 'boolean') updates.push_notifications = push_notifications

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhuma preferência para atualizar' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar preferências' }, { status: 500 })
    }

    return NextResponse.json({ success: true, preferences: updates })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
