import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { apiKeyEngine } from '@/domain/apikey/ApiKeyEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); const userId = searchParams.get('userId')
  if (!userId) return errorResponse('userId obrigatório')
  const supabase = await trySupabase()
  if (!supabase) return successResponse([])
  const { data } = await supabase.from('api_keys').select('id, name, key_prefix, permissions, last_used_at, created_at').eq('user_id', userId).eq('is_active', true)
  return successResponse(data || [])
}

export async function POST(request: NextRequest) {
  const body = await request.json(); const { userId, name, permissions, expiresInDays } = body
  if (!userId || !name) return errorResponse('userId e name obrigatórios')
  const supabase = await trySupabase()
  const { apiKey, rawKey } = apiKeyEngine.create({ userId, name, permissions: permissions || ['read:products'], expiresInDays })
  if (supabase) {
    await supabase.from('api_keys').insert({ user_id: userId, name, key: apiKey.keyHash, key_prefix: apiKey.keyPrefix, permissions: apiKey.permissions, expires_at: apiKey.expiresAt })
  }
  return successResponse({ key: rawKey, prefix: apiKey.keyPrefix, name: apiKey.name, warning: 'Salve esta chave! Ela não será mostrada novamente.' })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json(); const { keyId, userId } = body
  if (!keyId) return errorResponse('keyId obrigatório')
  const supabase = await trySupabase()
  if (supabase) await supabase.from('api_keys').update({ is_active: false }).eq('id', keyId).eq('user_id', userId)
  return successResponse({ revoked: true })
}
