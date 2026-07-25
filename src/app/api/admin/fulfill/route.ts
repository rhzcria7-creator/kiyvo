// ─────────────────────────────────────────────────────────────
// Admin Fulfill API v0.0.1 — Confirmação manual PIX
// Admin confirma pagamento PIX e libera escrow
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { orderId, adminId, action } = body

  if (!orderId || !action) {
    return NextResponse.json({ error: 'orderId and action required' }, { status: 400 })
  }

  if (supabase) {
    try {
      if (action === 'confirm_pix') {
        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            confirmed_by: adminId,
          })
          .eq('id', orderId)

        if (orderError) throw orderError

        // Update escrow to held
        await supabase
          .from('escrow_transactions')
          .update({
            status: 'held',
            held_at: new Date().toISOString(),
          })
          .eq('order_id', orderId)

        // Update PIX payment
        await supabase
          .from('pix_payments')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: adminId,
          })
          .eq('order_id', orderId)

        // Audit log
        await supabase.from('audit_logs').insert({
          action: 'order.payment_confirmed',
          actor_id: adminId,
          actor_role: 'admin',
          target: orderId,
          target_type: 'order',
          description: `Pagamento PIX confirmado manualmente`,
        })

        return NextResponse.json({ success: true, status: 'paid' })
      }

      if (action === 'release_escrow') {
        // Release all escrows for this order
        const { data: escrows } = await supabase
          .from('escrow_transactions')
          .select('*')
          .eq('order_id', orderId)
          .eq('status', 'held')

        for (const escrow of escrows || []) {
          await supabase
            .from('escrow_transactions')
            .update({
              status: 'released',
              released_at: new Date().toISOString(),
            })
            .eq('id', escrow.id)

          // Credit seller wallet
          await supabase
            .from('wallet_transactions')
            .insert({
              user_id: escrow.seller_id,
              type: 'sale',
              amount: escrow.amount,
              description: `Liberação de venda - Pedido ${orderId}`,
              reference_id: orderId,
            })
        }

        return NextResponse.json({ success: true, action: 'escrow_released' })
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (err) {
      console.error('Fulfill error:', err)
      return NextResponse.json({ error: String(err) }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, status: 'demo' })
}
