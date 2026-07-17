import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeServer } from '@/lib/stripe/server'
import { rateLimit, sanitizeInput } from '@/lib/security'

// POST /api/checkout — Create Stripe Checkout Session
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimit(ip, 10, 60000) // 10 requests per minute
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Tente novamente em 1 minuto.' }, { status: 429 })
    }

    const body = await request.json()
    const { product_id, product_title, price, buyer_email, success_url, cancel_url, payment_method } = body

    // Validate inputs
    if (!product_id || !product_title || !price || !buyer_email) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    if (typeof price !== 'number' || price <= 0 || price > 10000) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    }

    const sanitizedTitle = sanitizeInput(String(product_title))

    const stripe = getStripeServer()
    if (!stripe) {
      // Fallback: return mock checkout for demo mode
      return NextResponse.json({
        url: `/checkout/pagamento?product_id=${product_id}&title=${encodeURIComponent(sanitizedTitle)}&price=${price}`,
        demo_mode: true,
      })
    }

    // Payment methods — suporta card, pix e boleto
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card']
    
    // PIX disponível apenas para contas brasileiras com valor >= R$5
    if (price >= 5) {
      paymentMethodTypes.push('pix')
    }
    
    // Boleto disponível para compras >= R$10
    if (price >= 10) {
      paymentMethodTypes.push('boleto')
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      mode: 'payment',
      customer_email: buyer_email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: sanitizedTitle,
              description: `Produto digital Playdex — ${sanitizedTitle}`,
              metadata: { product_id },
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        product_id,
        buyer_email,
      },
      success_url: success_url || `${siteUrl}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${siteUrl}/checkout/cancelado`,
      // Configurações para PIX
      payment_method_options: paymentMethodTypes.includes('pix') ? {
        pix: {
          expires_after_seconds: 3600, // 1 hora para pagar
        },
      } : undefined,
    })

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }
}
