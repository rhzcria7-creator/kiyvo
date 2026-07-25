// ─────────────────────────────────────────────────────────────
// Social Proof API v0.0.1 — Provas sociais em tempo real
// Vendas recentes, reviews, usuários online
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { successResponse, trySupabase } from '@/lib/supabase/api-helper'
import { socialProofEngine } from '@/domain/social/SocialProofEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'recent'
  const limit = parseInt(searchParams.get('limit') || '10')

  if (type === 'visitors') {
    return successResponse({ activeVisitors: socialProofEngine.getActiveVisitors() })
  }

  if (type === 'generate') {
    const productName = searchParams.get('product') || 'Produto Digital'
    const amount = parseFloat(searchParams.get('amount') || Math.random() > 0.5 ? '97' : '47')
    const event = socialProofEngine.generateMockSale(productName, amount)
    return successResponse(event)
  }

  const events = socialProofEngine.getRecentEvents(limit)
  const activeVisitors = socialProofEngine.getActiveVisitors()
  
  // If Supabase available, get real recent sales
  const supabase = await trySupabase()
  if (supabase && events.length === 0) {
    const { data: recentOrders } = await supabase
      .from('orders').select('id, total_amount, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: false }).limit(5)
    
    return successResponse({
      events: events,
      recentOrders: recentOrders || [],
      activeVisitors,
    })
  }

  return successResponse({ events, activeVisitors })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId, page, referrer } = body
  
  if (sessionId && page) {
    socialProofEngine.trackVisitor(sessionId, page, referrer || 'direct')
  }
  
  return successResponse({ tracked: true, activeVisitors: socialProofEngine.getActiveVisitors() })
}
