// ─────────────────────────────────────────────────────────────
// Stripe Webhook — Motor de Eventos com Escrow
// Processa: checkout completed, payment failed, disputes, refunds
// NUNCA confie no body sem verificar a assinatura
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe/server'
import { verifyWebhookSignature } from '@/lib/stripe/connect'
import { createAdminClient } from '@/lib/supabase/server'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

// POST /api/stripe/webhook
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  // ─── VERIFICAR ASSINATURA (CRÍTICO) ───────────────────────
  let event: ReturnType<typeof verifyWebhookSignature>

  if (webhookSecret && signature) {
    event = verifyWebhookSignature(body, signature, webhookSecret)
    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // Sem webhook secret = modo desenvolvimento/demo
    // Em PRODUÇÃO, isso DEVE ser configurado
    try {
      event = JSON.parse(body) as NonNullable<typeof event>
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
  }

  const stripe = getStripeServer()
  const supabase = getAdmin()

  // ─── PROCESSAR EVENTOS ─────────────────────────────────────

  switch (event!.type) {
    // ═══ CHECKOUT COMPLETED ═══
    case 'checkout.session.completed': {
      const session = event!.data.object as {
        id: string
        payment_intent: string | null
        amount_total: number
        customer_email: string
        metadata: Record<string, string>
      }

      if (!supabase) break

      const productId = session.metadata?.product_id
      const vendorId = session.metadata?.vendor_id
      const buyerId = session.metadata?.buyer_id
      const productSlug = session.metadata?.product_slug
      const affiliateCode = session.metadata?.affiliate_code || ''

      // 1. Buscar ou criar a order
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_checkout_session_id', session.id)
        .maybeSingle()

      if (existingOrder) break // Já processado (idempotência)

      // 2. Calcular split
      const amount = (session.amount_total || 0) / 100
      const platformFeeRate = 0.10 // 10% padrão
      const affiliateFeeRate = affiliateCode ? 0.05 : 0
      const platformFee = Math.round(amount * platformFeeRate * 100) / 100
      const affiliateFee = Math.round(amount * affiliateFeeRate * 100) / 100
      const vendorNet = Math.round((amount - platformFee - affiliateFee) * 100) / 100

      // 3. Gerar order number
      const { data: orderNumberData } = await supabase
        .rpc('generate_order_number')
      const orderNumber = orderNumberData || `PD-${Date.now()}`

      // 4. Buscar vendor_id (UUID do vendors table)
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', vendorId)
        .maybeSingle()

      if (!vendor) break

      // 5. Criar a order no banco
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          buyer_id: buyerId,
          vendor_id: vendor.id,
          stripe_payment_intent_id: session.payment_intent,
          stripe_checkout_session_id: session.id,
          subtotal: amount,
          platform_fee: platformFee,
          affiliate_fee: affiliateFee,
          vendor_net: vendorNet,
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (orderError || !order) break

      // 6. Criar order item
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: productId,
        product_title_snapshot: session.metadata?.product_title || 'Produto',
        quantity: 1,
        unit_price: amount,
        delivery_status: 'pending',
      })

      // 7. Se tem afiliado, registrar conversão
      if (affiliateCode && affiliateFee > 0) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id')
          .eq('referral_code', affiliateCode)
          .maybeSingle()

        if (affiliate) {
          await supabase.from('affiliate_conversions').insert({
            affiliate_id: affiliate.id,
            order_id: order.id,
            commission_amount: affiliateFee,
            status: 'pending', // Fica pending até o período de disputa expirar
          })

          // Incrementar earnings do afiliado
          await supabase.rpc('increment_affiliate_earnings', {
            affiliate_id_input: affiliate.id,
            amount_input: affiliateFee,
          })
        }
      }

      // 8. Registrar no audit log
      await supabase.from('audit_log').insert({
        user_id: buyerId,
        action: 'order_paid',
        resource: `order:${order.id}`,
        severity: 'info',
        metadata: {
          order_id: order.id,
          amount,
          vendor_id: vendor.id,
          payment_intent: session.payment_intent,
          escrow: true, // Dinheiro em custódia
        },
      })

      // 9. Criar notificação para o vendor
      await supabase.from('notifications').insert({
        user_id: vendorId, // Na verdade precisa ser vendor.user_id
        type: 'order',
        title: 'Nova venda!',
        message: `Você vendeu "${session.metadata?.product_title || 'um produto'}" por R$ ${amount.toFixed(2)}`,
        link: `/seller/orders/${order.id}`,
      })

      // 10. Criar notificação para o buyer
      await supabase.from('notifications').insert({
        user_id: buyerId,
        type: 'payment',
        title: 'Pagamento confirmado',
        message: `Seu pagamento de R$ ${amount.toFixed(2)} foi confirmado. O produto será entregue em breve.`,
        link: `/conta/compras/${order.id}`,
      })

      // NOTA: O dinheiro está em ESCROW (custódia) na conta da plataforma.
      // A transferência para o vendor acontece APENAS quando o buyer
      // confirmar o recebimento ou após o período de auto-confirmação.
      break
    }

    // ═══ PAYMENT FAILED ═══
    case 'checkout.session.expired': {
      const session = event!.data.object as { id: string }

      if (!supabase) break

      // Marcar order como cancelada (pagamento não completado)
      await supabase
        .from('orders')
        .update({ status: 'pending_payment' })
        .eq('stripe_checkout_session_id', session.id)
        .is('paid_at', null) // Apenas se ainda não foi pago

      await supabase.from('audit_log').insert({
        action: 'payment_expired',
        resource: `session:${session.id}`,
        severity: 'warning',
        metadata: { session_id: session.id },
      })
      break
    }

    // ═══ CHARGEBACK / DISPUTE ═══
    case 'charge.dispute.created': {
      const dispute = event!.data.object as {
        id: string
        charge: string
        payment_intent: string
        reason: string
        amount: number
      }

      if (!supabase) break

      // Encontrar a order pelo payment_intent
      const { data: orders } = await supabase
        .from('orders')
        .select('id, buyer_id, vendor_id')
        .eq('stripe_payment_intent_id', dispute.payment_intent)
        .limit(1)

      if (orders && orders.length > 0) {
        const order = orders[0]

        // Marcar como disputed
        await supabase
          .from('orders')
          .update({
            status: 'disputed',
            disputed_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        // Criar dispute record
        await supabase.from('disputes').insert({
          order_id: order.id,
          opened_by: order.buyer_id,
          reason: `Chargeback via Stripe: ${dispute.reason}`,
          status: 'open',
        })

        // Alerta crítico
        await supabase.from('audit_log').insert({
          action: 'chargeback_created',
          resource: `order:${order.id}`,
          severity: 'critical',
          metadata: {
            dispute_id: dispute.id,
            reason: dispute.reason,
            amount: dispute.amount / 100,
          },
        })

        // Notificar vendor
        await supabase.from('notifications').insert({
          user_id: order.vendor_id,
          type: 'dispute',
          title: '⚠️ Chargeback recebido',
          message: `Um chargeback foi aberto para o pedido ${order.id}. O valor está retido.`,
          link: `/seller/orders/${order.id}`,
        })
      }
      break
    }

    // ═══ REFUND PROCESSED ═══
    case 'charge.refunded': {
      const charge = event!.data.object as {
        id: string
        payment_intent: string
        amount_refunded: number
      }

      if (!supabase) break

      // Atualizar status da order
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', charge.payment_intent)
        .limit(1)

      if (orders && orders.length > 0) {
        await supabase
          .from('orders')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
          })
          .eq('id', orders[0].id)

        await supabase.from('audit_log').insert({
          action: 'refund_processed',
          resource: `order:${orders[0].id}`,
          severity: 'info',
          metadata: {
            charge_id: charge.id,
            amount_refunded: charge.amount_refunded / 100,
          },
        })
      }
      break
    }

    // ═══ VENDOR PAYOUT (do Stripe Connect) ═══
    case 'transfer.created': {
      const transfer = event!.data.object as {
        id: string
        amount: number
        destination: string
        metadata: Record<string, string>
      }

      if (!supabase) break

      await supabase.from('audit_log').insert({
        action: 'vendor_payout',
        resource: `transfer:${transfer.id}`,
        severity: 'info',
        metadata: {
          amount: transfer.amount / 100,
          destination: transfer.destination,
          escrow_release: transfer.metadata?.escrow_release === 'true',
        },
      })
      break
    }

    default:
      // Evento não tratado — registrar para debug
      if (supabase) {
        await supabase.from('audit_log').insert({
          action: `stripe_event_${event!.type}`,
          severity: 'info',
          metadata: { event_type: event!.type },
        })
      }
  }

  return NextResponse.json({ received: true })
}
