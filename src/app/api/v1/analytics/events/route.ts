// ─────────────────────────────────────────────────────────────
// Analytics Events API v0.0.1 — Recebe eventos de analytics
// Armazena no Supabase para dashboards
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'events array required' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from('analytics_events').insert(
        events.map((e: any) => ({
          event: e.event,
          session_id: e.sessionId,
          user_id: e.userId,
          page: e.page,
          referrer: e.referrer,
          properties: e.properties,
          device: e.device,
          timestamp: e.timestamp,
        }))
      )

      if (error) {
        console.error('Analytics insert error:', error)
      }
    }

    // Salvar também no localStorage (logs)
    return NextResponse.json({ success: true, received: events.length })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const event = searchParams.get('event')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = parseInt(searchParams.get('limit') || '100')

  const supabase = getSupabase()
  if (supabase) {
    let query = supabase.from('analytics_events').select('*', { count: 'exact' })

    if (event) query = query.eq('event', event)
    if (from) query = query.gte('timestamp', from)
    if (to) query = query.lte('timestamp', to)

    query = query.order('timestamp', { ascending: false }).limit(limit)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ events: data, total: count })
  }

  return NextResponse.json({ events: [], total: 0 })
}
