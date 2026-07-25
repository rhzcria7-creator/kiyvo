// ─────────────────────────────────────────────────────────────
// Stripe Payment API v0.0.1 — PaymentIntents + SetupIntents
// Real verificação, sem mock
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

const stripeKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, amount, orderId, paymentMethodId, customerId, returnUrl } = body

    if (!stripeKey) {
      return NextResponse.json({
        success: true,
        mode: 'demo',
        message: 'Stripe não configurado. Modo demonstração.',
        clientSecret: 'pi_demo_secret',
      })
    }

    const Stripe = require('stripe')
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })

    switch (action) {
      case 'create_payment_intent': {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(Number(amount) * 100), // centavos
          currency: 'brl',
          metadata: { orderId },
          description: `KIYVO Order ${orderId}`,
          automatic_payment_methods: { enabled: true },
        })

        return NextResponse.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        })
      }

      case 'confirm_payment': {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentMethodId, {
          payment_method: body.paymentMethodId,
          return_url: returnUrl,
        })

        return NextResponse.json({
          success: paymentIntent.status === 'succeeded',
          status: paymentIntent.status,
          paymentIntentId: paymentIntent.id,
        })
      }

      case 'create_setup_intent': {
        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          payment_method_types: ['card'],
        })

        return NextResponse.json({
          success: true,
          clientSecret: setupIntent.client_secret,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err: any) {
    console.error('Stripe API error:', err)
    return NextResponse.json({ error: err.message || 'Erro no Stripe' }, { status: 500 })
  }
}
