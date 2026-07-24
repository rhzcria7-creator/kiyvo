// ─────────────────────────────────────────────────────────────
// GET /api/checkout/confirm?pi=pi_xxx
// Endpoint de polling — retorna status do PaymentIntent
// (usado pela tela de PIX para saber quando o pagamento caiu)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 60, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const pi = new URL(req.url).searchParams.get('pi')
    if (!pi || !pi.startsWith('pi_')) return NextResponse.json({ error: 'PI inválido' }, { status: 400 })

    const stripe = getStripeServer()
    if (!stripe) return NextResponse.json({ error: 'Indisponível' }, { status: 503 })

    const intent = await stripe.paymentIntents.retrieve(pi)
    if (intent.metadata?.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const status = intent.status
    const paid = status === 'succeeded'

    // Atualizar order no banco
    if (paid) {
      const sb = createAdminClient()
      if (sb) {
        await sb.from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_id: intent.id,
          })
          .eq('payment_id', intent.id)
          .in('status', ['pending_payment', 'pending'])
      }
    }

    return NextResponse.json({
      status,
      paid,
      amount: intent.amount / 100,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
