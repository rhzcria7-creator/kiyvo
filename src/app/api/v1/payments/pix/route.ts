// ─────────────────────────────────────────────────────────────
// PIX Payment API v0.0.1 — Geração e confirmação PIX real
// QR Code dinâmico, validação, webhook
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { pixPaymentEngine } from '@/domain/pix/PixPaymentEngine'
import { successResponse, errorResponse, extractIPFromRequest, trySupabase } from '@/lib/supabase/api-helper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, payerCpf, payerName } = body

    if (!orderId || !amount) {
      return errorResponse('orderId e amount são obrigatórios')
    }

    const supabase = await trySupabase()
    let pixKey = 'demo@kiyvo.com.br'
    let merchantName = 'KIYVO LTDA'
    let merchantCity = 'SAO PAULO'

    if (supabase) {
      const { data: settings } = await supabase
        .from('pix_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (settings) {
        pixKey = settings.pix_key
        merchantName = 'KIYVO'
        merchantCity = 'SAO PAULO'
      }
    }

    const payment = pixPaymentEngine.createPayment({
      orderId,
      amount: Number(amount),
      payerCpf,
      payerName,
      pixKey,
      merchantName,
      merchantCity,
    })

    // Salvar no Supabase
    if (supabase) {
      await supabase.from('pix_payments').insert({
        order_id: payment.orderId,
        qr_code: payment.qrCode,
        qr_code_base64: payment.qrCodeBase64,
        txid: payment.txid,
        amount: payment.amount,
        expires_at: payment.expiresAt,
        status: 'pending',
      })
    }

    return successResponse({
      qrCode: payment.qrCode,
      qrCodeBase64: payment.qrCodeBase64,
      txid: payment.txid,
      amount: payment.amount,
      expiresAt: payment.expiresAt,
    })
  } catch (err: any) {
    return errorResponse(err.message || 'Erro ao gerar PIX')
  }
}

// Webhook para confirmação de pagamento
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { txid, endToEndId, status } = body

    if (!txid) return errorResponse('txid é obrigatório')

    const supabase = await trySupabase()
    if (!supabase) return errorResponse('Supabase não configurado')

    const { data: payment } = await supabase
      .from('pix_payments')
      .select('*')
      .eq('txid', txid)
      .single()

    if (!payment) return errorResponse('Pagamento não encontrado', 404)

    if (status === 'confirmed') {
      await supabase.from('pix_payments').update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        end_to_end_id: endToEndId || '',
      }).eq('id', payment.id)

      // Atualizar pedido
      await supabase.from('orders').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      }).eq('id', payment.order_id)

      // Atualizar escrow
      await supabase.from('escrow_transactions').update({
        status: 'held',
        held_at: new Date().toISOString(),
      }).eq('order_id', payment.order_id)
    }

    return successResponse({ txid, status })
  } catch (err: any) {
    return errorResponse(err.message)
  }
}
