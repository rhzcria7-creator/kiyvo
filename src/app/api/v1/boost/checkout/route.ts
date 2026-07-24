// POST /api/v1/boost/checkout
// Cria uma sessão Stripe Checkout para o usuário pagar por um boost.
// Body: { productId, placement, durationDays }

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const PRICE_MAP: Record<string, Record<number, number>> = {
  category: { 1: 499, 3: 1299, 7: 2499, 30: 7999 },
  home: { 1: 999, 3: 2499, 7: 4999, 30: 14999 },
  search: { 1: 799, 3: 1999, 7: 3999, 30: 11999 },
  banner: { 1: 1499, 3: 3999, 7: 7999, 30: 24999 },
}

const PLACEMENT_NAMES: Record<string, string> = {
  category: 'Destaque na Categoria',
  home: 'Destaque na Home',
  search: 'Topo nas Buscas',
  banner: 'Banner Premium',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe não configurado — modo demonstração' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia' as Stripe.LatestApiVersion,
    })

    const body = await request.json()
    const productId = String(body.productId || '')
    const placement = String(body.placement || '') as 'category' | 'home' | 'search' | 'banner'
    const durationDays = Number(body.durationDays || 1)

    if (!productId || !PRICE_MAP[placement] || !PRICE_MAP[placement][durationDays]) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    // Verifica que o produto pertence ao vendedor
    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('id, title, seller_id')
      .eq('id', productId)
      .single()
    if (pErr || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }
    if (product.seller_id !== user.id) {
      return NextResponse.json({ error: 'Você não é o dono deste produto' }, { status: 403 })
    }

    const amountCents = PRICE_MAP[placement][durationDays]
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix'],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${PLACEMENT_NAMES[placement]} — ${durationDays} ${durationDays === 1 ? 'dia' : 'dias'}`,
            description: `Impulsionamento de "${product.title}"`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'ad_boost',
        productId,
        sellerId: user.id,
        placement,
        durationDays: String(durationDays),
      },
      success_url: `${origin}/conta/anuncios?boost=success`,
      cancel_url: `${origin}/conta/anuncios?boost=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }
}
