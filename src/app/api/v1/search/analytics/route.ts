import { NextRequest } from 'next/server'
import { successResponse, trySupabase } from '@/lib/supabase/api-helper'
import { searchAnalyticsEngine } from '@/domain/searchanalytics/SearchAnalyticsEngine'

export async function GET() {
  return successResponse({
    topQueries: searchAnalyticsEngine.getTopQueries(),
    zeroResultQueries: searchAnalyticsEngine.getZeroResultQueries(),
    clickThroughRate: searchAnalyticsEngine.getClickThroughRate(),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { query, userId, results, sessionId, clickedProductId } = body
  if (!query) return successResponse({ error: 'query required' }, 400 as any)

  const log = searchAnalyticsEngine.logSearch({ query, userId, results: results || 0, sessionId: sessionId || `sess_${Date.now()}`, clickedProductId })

  const supabase = await trySupabase()
  if (supabase) {
    await supabase.from('search_logs').insert({
      query, user_id: userId, results_count: results || 0, clicked_product_id: clickedProductId, session_id: sessionId,
    })
  }

  return successResponse(log)
}
