import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  if (!productId) return errorResponse('productId obrigatório')
  const supabase = await trySupabase()
  if (!supabase) return successResponse([])
  const { data } = await supabase.from('product_qa').select('*, profiles(full_name, avatar_url)').eq('product_id', productId).order('created_at', { ascending: false })
  return successResponse(data || [])
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { productId, userId, question } = body
  if (!productId || !userId || !question) return errorResponse('productId, userId e question obrigatórios')
  const supabase = await trySupabase()
  if (!supabase) return successResponse({ id: `qa_${Date.now()}`, productId, question, status: 'pending' })
  const { data, error } = await supabase.from('product_qa').insert({ product_id: productId, user_id: userId, question }).select().single()
  if (error) return errorResponse(error.message)
  return successResponse(data)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { questionId, answer, answerUserId, answerUserName } = body
  if (!questionId || !answer) return errorResponse('questionId e answer obrigatórios')
  const supabase = await trySupabase()
  if (!supabase) return successResponse({ questionId, status: 'answered' })
  const { data, error } = await supabase.from('product_qa').update({ answer, answered_by: answerUserId, answered_at: new Date().toISOString(), status: 'answered' }).eq('id', questionId).select().single()
  if (error) return errorResponse(error.message)
  return successResponse(data)
}
