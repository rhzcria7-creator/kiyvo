import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { webhookEngine } from '@/domain/webhook/WebhookEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); const userId = searchParams.get('userId')
  if (!userId) return errorResponse('userId obrigatório')
  const supabase = await trySupabase()
  if (!supabase) return successResponse([])
  const { data } = await supabase.from('webhooks').select('*').eq('user_id', userId).eq('is_active', true)
  return successResponse(data || [])
}

export async function POST(request: NextRequest) {
  const body = await request.json(); const { userId, url, events } = body
  if (!userId || !url || !events) return errorResponse('userId, url e events obrigatórios')
  const supabase = await trySupabase()
  const endpoint = webhookEngine.createEndpoint({ userId, url, events })
  if (supabase) {
    const { data, error } = await supabase.from('webhooks').insert({ user_id: userId, url, events, secret: endpoint.secret }).select().single()
    if (error) return errorResponse(error.message)
    return successResponse({ ...data, secret: endpoint.secret })
  }
  return successResponse(endpoint)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json(); const { webhookId, action } = body
  if (!webhookId || !action) return errorResponse('webhookId e action obrigatórios')
  const supabase = await trySupabase()
  if (!supabase) return successResponse({ webhookId, action })
  if (action === 'test') {
    const { data: wh } = await supabase.from('webhooks').select('*').eq('id', webhookId).single()
    if (!wh) return errorResponse('Webhook não encontrado')
    const delivery = await webhookEngine.deliver(wh, 'order.created', { test: true, timestamp: new Date().toISOString() })
    await supabase.from('webhook_deliveries').insert(delivery)
    return successResponse(delivery)
  }
  if (action === 'toggle') {
    const { data: wh } = await supabase.from('webhooks').select('is_active').eq('id', webhookId).single()
    await supabase.from('webhooks').update({ is_active: !wh?.is_active }).eq('id', webhookId)
    return successResponse({ toggled: true })
  }
  return errorResponse('Ação inválida')
}

export async function DELETE(request: NextRequest) {
  const body = await request.json(); const { webhookId } = body
  if (!webhookId) return errorResponse('webhookId obrigatório')
  const supabase = await trySupabase()
  if (supabase) await supabase.from('webhooks').update({ is_active: false }).eq('id', webhookId)
  return successResponse({ deleted: true })
}
