import { NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/stripe/webhook — Handle Stripe Webhooks
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  const stripe = getStripeServer()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Demo mode — parse body directly (sem verificação de assinatura)
      event = JSON.parse(body)
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Supabase admin client para operações de backend
  const supabase = createAdminClient()

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      console.log('✅ Payment completed:', session.id)

      // Registrar pagamento no banco
      if (supabase) {
        // Criar registro de pagamento Stripe
        await supabase
          .from('stripe_payments')
          .upsert({
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'brl',
            status: 'succeeded',
            payment_method: session.payment_method_types?.[0] || 'card',
            metadata: session.metadata || {},
          }, { onConflict: 'stripe_session_id' })

        // Atualizar pedido relacionado
        if (session.metadata?.product_id && session.metadata?.buyer_email) {
          // Buscar pedido pelo payment_id
          const { data: orders } = await supabase
            .from('orders')
            .select('id, status')
            .eq('payment_id', session.id)
            .limit(1)

          if (orders && orders.length > 0) {
            await supabase
              .from('orders')
              .update({ status: 'paid' })
              .eq('id', orders[0].id)

            // Log de auditoria
            await supabase
              .from('security_audit_log')
              .insert({
                action: 'payment_completed',
                resource: `order:${orders[0].id}`,
                severity: 'info',
                metadata: {
                  session_id: session.id,
                  amount: session.amount_total,
                  payment_method: session.payment_method_types?.[0],
                },
              })
          }
        }
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object
      console.log('⏰ Checkout expired:', session.id)

      if (supabase) {
        await supabase
          .from('stripe_payments')
          .update({ status: 'cancelled' })
          .eq('stripe_session_id', session.id)
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      console.log('✅ Payment intent succeeded:', paymentIntent.id)

      if (supabase) {
        await supabase
          .from('stripe_payments')
          .update({ status: 'succeeded', stripe_payment_intent_id: paymentIntent.id })
          .eq('stripe_payment_intent_id', paymentIntent.id)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object
      console.log('❌ Payment failed:', paymentIntent.id)

      if (supabase) {
        await supabase
          .from('stripe_payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        // Log de segurança
        await supabase
          .from('security_audit_log')
          .insert({
            action: 'payment_failed',
            resource: `payment:${paymentIntent.id}`,
            severity: 'warning',
            metadata: {
              error: paymentIntent.last_payment_error?.message,
              amount: paymentIntent.amount,
            },
          })
      }
      break
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object
      console.log('⚠️ Dispute created:', dispute.id)

      if (supabase) {
        await supabase
          .from('security_audit_log')
          .insert({
            action: 'dispute_created',
            resource: `dispute:${dispute.id}`,
            severity: 'critical',
            metadata: {
              charge_id: dispute.charge,
              reason: dispute.reason,
              amount: dispute.amount,
            },
          })
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object
      console.log('💰 Refund processed:', charge.id)

      if (supabase) {
        await supabase
          .from('stripe_payments')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', charge.payment_intent)

        // Atualizar pedido
        const { data: payments } = await supabase
          .from('stripe_payments')
          .select('order_id')
          .eq('stripe_payment_intent_id', charge.payment_intent)
          .limit(1)

        if (payments && payments.length > 0 && payments[0].order_id) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('id', payments[0].order_id)
        }
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
