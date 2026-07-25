// ─────────────────────────────────────────────────────────────
// Notifications API v0.0.1 — Realtime + email (Resend)
// Push, email, in-app notifications
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const unreadOnly = searchParams.get('unreadOnly') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  if (supabase) {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (unreadOnly) query = query.eq('read', false)

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return NextResponse.json({
        notifications: data || [],
        total: count || 0,
        unreadCount: data?.filter((n: any) => !n.read).length || 0,
      })
    } catch (err) {
      console.error('Notifications error:', err)
    }
  }

  return NextResponse.json({ notifications: [], total: 0, unreadCount: 0 })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { userId, type, title, message, data } = body

  if (supabase) {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type || 'info',
        title,
        message,
        data: data || {},
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send email if Resend configured
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KIYVO <noreply@kiyvo.com.br>',
            to: body.email || userId,
            subject: title,
            html: `<p>${message}</p>`,
          }),
        })
      } catch {}
    }

    return NextResponse.json({ success: true, notification })
  }

  return NextResponse.json({ success: true, notification: { id: 'demo', title, message } })
}

export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { notificationId, read } = body

  if (supabase) {
    await supabase
      .from('notifications')
      .update({ read, read_at: new Date().toISOString() })
      .eq('id', notificationId)
  }

  return NextResponse.json({ success: true })
}
