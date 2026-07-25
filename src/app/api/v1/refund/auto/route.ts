import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { refundEngine } from '@/domain/refund/RefundEngine'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { orderId, buyerId, sellerId, amount, reason, description } = body
  if (!orderId || !buyerId || !amount) return errorResponse('orderId, buyerId e amount obrigatórios')

  const hoursSince = 0
  const autoCheck = refundEngine.canAutoRefund(amount, hoursSince)
  const request_data = refundEngine.createRequest({ orderId, buyerId, sellerId, amount, reason, description })

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ ...request_data, autoRefundEligible: autoCheck.auto })

  if (autoCheck.auto) {
    const processed = refundEngine.processAutoRefund(request_data)
    await supabase.from('refund_requests').insert({ ...processed, processed_at: new Date().toISOString() })
    await supabase.from('orders').update({ status: 'refunded' }).eq('id', orderId)
    await supabase.from('wallet_transactions').insert({ user_id: buyerId, type: 'refund', amount: processed.netRefund, description: `Reembolso automático - Pedido ${orderId}`, reference_id: orderId, reference_type: 'order' })
    return successResponse({ ...processed, autoProcessed: true })
  }

  const { data, error } = await supabase.from('refund_requests').insert({ ...request_data }).select().single()
  if (error) return errorResponse(error.message)
  return successResponse({ ...data, autoRefundEligible: false })
}
