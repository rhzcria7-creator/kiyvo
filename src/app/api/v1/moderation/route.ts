import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { contentModerationEngine } from '@/domain/moderation/ContentModerationEngine'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, name, description, text, rating, contentId } = body

  if (!type) return errorResponse('type obrigatório (product, review)')

  let result
  if (type === 'product') {
    result = contentModerationEngine.scanProduct(name || '', description || '')
  } else if (type === 'review') {
    result = contentModerationEngine.scanReview(text || '', rating || 0)
  } else {
    return errorResponse('Tipo inválido')
  }

  const supabase = await trySupabase()
  if (supabase && contentId) {
    const table = type === 'product' ? 'products' : 'reviews'
    if (result.action === 'reject') {
      await supabase.from(table).update({ approval_status: 'rejected' }).eq('id', contentId)
    } else if (result.action === 'flag') {
      await supabase.from(table).update({ approval_status: 'flagged' }).eq('id', contentId)
    }

    await supabase.from('moderation_logs').insert({
      content_id: contentId, content_type: type, action: result.action, score: result.score, reason: result.reason || '',
      rules_triggered: result.rules,
    })
  }

  return successResponse(result)
}
