// ─────────────────────────────────────────────────────────────
// Stripe Webhook v0.0.1 — Real verify signature
// Processa payment_intent.succeeded, payment_intent.payment_failed
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

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 })
    }

    // Verify webhook signature
    const Stripe = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        if (supabase && orderId) {
          // Update order
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              stripe_payment_intent: paymentIntent.id,
            })
            .eq('id', orderId)

          // Update escrow
          await supabase
            .from('escrow_transactions')
            .update({ status: 'held', held_at: new Date().toISOString() })
            .eq('order_id', orderId)
            .eq('status', 'pending')

          // Audit log
          await supabase.from('audit_logs').insert({
            action: 'payment.processed',
            actor_id: 'system',
            actor_role: 'system',
            target: orderId,
            target_type: 'payment',
            description: `Pagamento via Stripe confirmado: ${paymentIntent.id}`,
            metadata: { stripe_payment_intent: paymentIntent.id },
          })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object
        console.error('Payment failed:', failedIntent.id, failedIntent.last_payment_error)

        if (supabase && failedIntent.metadata.orderId) {
          await supabase
            .from('orders')
            .update({ status: 'payment_failed' })
            .eq('id', failedIntent.metadata.orderId)
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object
        if (supabase) {
          await supabase.from('audit_logs').insert({
            action: 'payment.dispute',
            actor_id: 'system',
            actor_role: 'system',
            target: dispute.payment_intent,
            target_type: 'payment',
            description: `Disputa de pagamento: ${dispute.reason}`,
            metadata: { dispute_id: dispute.id, reason: dispute.reason },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
