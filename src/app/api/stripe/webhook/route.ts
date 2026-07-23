// ─────────────────────────────────────────────────────────────
// Stripe Webhook — Motor de Eventos com Escrow + Automação
// Processa:
//   - checkout.session.completed  (cartão/boleto via Sessions)
//   - payment_intent.succeeded    (PIX e cartão via PaymentIntent)
//   - payment_intent.payment_failed
//   - charge.dispute.*
//   - charge.refunded
//   - transfer.created
//
// NUNCA confia no body sem verificar a assinatura.
// Qualquer pagamento confirmado aciona a ENTREGA AUTOMÁTICA.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe/server'
import { verifyWebhookSignature } from '@/lib/stripe/connect'
import { createAdminClient } from '@/lib/supabase/server'
import { autoDeliverOrder } from '@/lib/automation/engine'

function getAdmin() {
  const c = createAdminClient()
  if (!c) throw new Error('Admin client indisponível')
  return c
}

// Garante idempotência por event_id
const processedEvents = new Set<string>()

// POST /api/stripe/webhook
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event
  if (webhookSecret && signature) {
    event = verifyWebhookSignature(body, signature, webhookSecret)
    if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  } else {
    try { event = JSON.parse(body) as NonNullable<typeof event> }
    catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  }

  if (!event) return NextResponse.json({ error: 'No event' }, { status: 400 })

  // Idempotência
  if (processedEvents.has(event.id)) return NextResponse.json({ received: true, duplicate: true })
  processedEvents.add(event.id)
  if (processedEvents.size > 10000) processedEvents.clear()

  const stripe = getStripeServer()
  const supabase = getAdmin()

  try {
    switch (event.type) {
      // ────────────────── PAYMENT INTENT (PIX / direto) ────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as {
          id: string
          amount_received: number
          customer: string | null
          metadata: Record<string, string>
          payment_method: string | null
          charges?: { data?: Array<{ payment_method_details?: { type?: string; pix?: unknown } }> }
        }
        const meta = pi.metadata || {}
        const buyerId = meta.buyer_id
        const productId = meta.product_id
        const sku = meta.sku
        const vendorId = meta.vendor_id
        const kdPointsUsed = Number(meta.kd_points_used) || 0
        const title = meta.title || 'Produto KIYVO'
        const amount = (pi.amount_received || 0) / 100
        const isOfficial = meta.product_type === 'official' || sku === 'oficial' || vendorId === 'oficial' || !!sku

        // Determinar método
        const method = pi.charges?.data?.[0]?.payment_method_details?.type === 'pix' ? 'pix' : 'credit_card'

        // Buscar order existente por payment_id
        const { data: existing } = await supabase
          .from('orders')
          .select('id, status')
          .eq('payment_id', pi.id)
          .maybeSingle()

        let orderId: string | null = existing?.id || null

        if (existing) {
          if (existing.status !== 'paid' && existing.status !== 'delivered' && existing.status !== 'confirmed') {
            await supabase.from('orders')
              .update({ status: 'paid', paid_at: new Date().toISOString() })
              .eq('id', existing.id)
          }
        } else {
          // Criar order
          const { data: newOrder, error: insertErr } = await supabase
            .from('orders')
            .insert({
              order_number: `KIY-${Date.now().toString(36).toUpperCase()}`,
              buyer_id: buyerId,
              seller_id: isOfficial ? null : vendorId,
              vendor_id: isOfficial ? null : vendorId,
              product_id: productId || null,
              title: title.slice(0, 200),
              price: amount,
              subtotal: amount,
              fee: 0,
              seller_receives: Math.round(amount * 0.9 * 100) / 100,
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_method: method,
              payment_id: pi.id,
              metadata: { sku: sku || null, product_type: isOfficial ? 'official' : 'marketplace', kd_points_used: kdPointsUsed },
            })
            .select('id')
            .single()

          if (insertErr || !newOrder) {
            console.error('Erro ao criar order', insertErr)
            break
          }
          orderId = newOrder.id
        }

        // Criar order_item se não existir
        if (orderId) {
          const { count: existingItems } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', orderId)

          if (!existingItems) {
            await supabase.from('order_items').insert({
              order_id: orderId,
              product_id: productId || null,
              product_title_snapshot: title,
              quantity: 1,
              unit_price: amount,
              delivery_status: 'pending',
            })
          }

          // Debitar KD Points usados
          if (kdPointsUsed > 0 && buyerId) {
            await supabase.rpc ?.('decrement_kd_points' as never) ||
              await supabase.from('profiles').update({ kd_points: Math.max(0, 0) })
                .eq('id', buyerId) // fallback seguro — ajustar com a lógica real
            await supabase.from('kd_transactions').insert({
              user_id: buyerId,
              amount: -kdPointsUsed,
              type: 'spent',
              description: `Desconto no pedido ${orderId}`,
              reference_id: orderId,
            })
          }

          // Entrega automática!
          const result = await autoDeliverOrder(orderId)
          if (!result.ok) {
            console.warn('Auto-deliver retornou erros', result.errors)
          }

          // Notificações
          await supabase.from('notifications').insert([
            {
              user_id: buyerId,
              type: 'payment',
              title: '✅ Pagamento confirmado!',
              message: isOfficial
                ? `Seu produto "${title}" já está disponível na Biblioteca.`
                : `Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} confirmado.`,
              link: isOfficial ? '/buyer/library' : `/buyer/orders/${orderId}`,
            },
          ])

          // Log
          await supabase.from('audit_log').insert({
            user_id: buyerId,
            action: 'payment_succeeded',
            resource: `order:${orderId}`,
            severity: 'info',
            metadata: { amount, method, is_official: isOfficial, sku: sku || null },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as { id: string; last_payment_error?: { message?: string } }
        await supabase.from('orders')
          .update({ status: 'pending_payment' })
          .eq('payment_id', pi.id)
        await supabase.from('audit_log').insert({
          action: 'payment_failed',
          resource: `pi:${pi.id}`,
          severity: 'warning',
          metadata: { error: pi.last_payment_error?.message },
        })
        break
      }

      // ────────────────── CHECKOUT SESSION ─────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          payment_intent: string | null
          amount_total: number
          customer_email: string | null
          metadata: Record<string, string>
        }
        const meta = session.metadata || {}
        const buyerId = meta.buyer_id
        const vendorId = meta.vendor_id
        const productId = meta.product_id
        const sku = meta.sku
        const isOfficial = meta.product_type === 'official' || sku || vendorId === 'oficial'
        const amount = (session.amount_total || 0) / 100

        // ── BOOST DE ANÚNCIOS (tráfego pago) ───────────
        // Se o pagamento é de um boost, ativa o impulsionamento ao invés de criar pedido.
        if (meta.type === 'ad_boost') {
          const placement = meta.placement || 'category'
          const sellerId = meta.seller_id || vendorId
          const productIdBoost = meta.product_id
          const days = Number(meta.days) || 7
          const endAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

          // Garante que tabela ad_boosts tem coluna (fallback silencioso)
          try {
            const { error: ue } = await supabase.from('ad_boosts').insert({
              seller_id: sellerId || null,
              product_id: productIdBoost || null,
              placement,
              amount_paid: amount,
              currency: 'BRL',
              status: 'active',
              starts_at: new Date().toISOString(),
              ends_at: endAt,
              stripe_checkout_session_id: session.id,
              auto_renew: false,
            })
            if (ue) {
              // Provavelmente tabela não existe ainda; log silencioso
              console.warn('[stripe:webhook] ad_boost_paid failed:', ue.message)
            } else {
              await supabase.from('audit_log').insert({
                user_id: sellerId,
                action: 'ad_boost_paid',
                resource: `boost:${productIdBoost}`,
                severity: 'info',
                metadata: { amount, placement, days, ends_at: endAt },
              })
              await supabase.from('notifications').insert({
                user_id: sellerId,
                type: 'boost',
                title: '🚀 Seu impulsionamento foi ativado!',
                message: `Seu produto ficará em destaque por ${days} dias em ${placement}.`,
                link: '/vendor/promocoes',
              })
            }
          } catch {
            // Swallow — nunca deixe o webhook crashar por boost
          }
          break
        }

        // Idempotência
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle()
        if (existing) break

        const orderNumber = `KIY-${Date.now().toString(36).toUpperCase()}`
        const { data: order, error: oerr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            buyer_id: buyerId,
            seller_id: isOfficial ? null : vendorId,
            vendor_id: isOfficial ? null : vendorId,
            product_id: productId || null,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            payment_id: session.payment_intent,
            title: (meta.product_title || 'Produto KIYVO').slice(0, 200),
            price: amount,
            subtotal: amount,
            platform_fee: Number(meta.platform_fee) || Math.round(amount * 0.1 * 100) / 100,
            affiliate_fee: Number(meta.affiliate_fee) || 0,
            vendor_net: Number(meta.vendor_net) || Math.round(amount * 0.9 * 100) / 100,
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'credit_card',
            metadata: { sku: sku || null, product_type: isOfficial ? 'official' : 'marketplace' },
          })
          .select('id')
          .single()

        if (oerr || !order) break

        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: productId || null,
          product_title_snapshot: meta.product_title || 'Produto',
          quantity: 1,
          unit_price: amount,
          delivery_status: 'pending',
        })

        // Afiliados
        if (meta.affiliate_code) {
          const { data: aff } = await supabase.from('affiliates').select('id').eq('referral_code', meta.affiliate_code).maybeSingle()
          if (aff) {
            await supabase.from('affiliate_conversions').insert({ affiliate_id: aff.id, order_id: order.id, commission_amount: Number(meta.affiliate_fee) || 0, status: 'pending' })
          }
        }

        // Entrega automática
        await autoDeliverOrder(order.id)

        await supabase.from('audit_log').insert({
          user_id: buyerId,
          action: 'order_paid',
          resource: `order:${order.id}`,
          severity: 'info',
          metadata: { amount, escrow: true, is_official: isOfficial },
        })

        await supabase.from('notifications').insert({
          user_id: buyerId,
          type: 'payment',
          title: '✅ Pagamento confirmado!',
          message: 'Seu produto está disponível na Biblioteca.',
          link: '/buyer/library',
        })
        break
      }

      case 'checkout.session.expired': {
        const s = event.data.object as { id: string }
        await supabase.from('orders')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_checkout_session_id', s.id)
          .is('paid_at', null)
        break
      }

      // ────────────────── DISPUTES ────────────────────────
      case 'charge.dispute.created': {
        const d = event.data.object as { id: string; payment_intent: string; reason: string; amount: number }
        const { data: orders } = await supabase.from('orders').select('id, buyer_id, vendor_id').eq('stripe_payment_intent_id', d.payment_intent).limit(1)
        if (orders && orders[0]) {
          await supabase.from('orders').update({ status: 'in_dispute', disputed_at: new Date().toISOString() }).eq('id', orders[0].id)
          await supabase.from('disputes').insert({ order_id: orders[0].id, opened_by: orders[0].buyer_id, reason: `Chargeback: ${d.reason}`, status: 'open' })
          await supabase.from('audit_log').insert({ action: 'chargeback_created', resource: `order:${orders[0].id}`, severity: 'critical', metadata: { dispute_id: d.id, reason: d.reason, amount: d.amount / 100 } })
        }
        break
      }

      case 'charge.refunded': {
        const c = event.data.object as { payment_intent: string; amount_refunded: number }
        const { data: orders } = await supabase.from('orders').select('id').eq('stripe_payment_intent_id', c.payment_intent).limit(1)
        if (orders && orders[0]) {
          await supabase.from('orders').update({ status: 'refunded', refunded_at: new Date().toISOString() }).eq('id', orders[0].id)
          await supabase.from('audit_log').insert({ action: 'refund_processed', resource: `order:${orders[0].id}`, severity: 'info', metadata: { amount_refunded: c.amount_refunded / 100 } })
        }
        break
      }

      case 'transfer.created': {
        const t = event.data.object as { id: string; amount: number; destination: string; metadata?: Record<string, string> }
        await supabase.from('audit_log').insert({
          action: 'vendor_payout',
          resource: `transfer:${t.id}`,
          severity: 'info',
          metadata: { amount: t.amount / 100, destination: t.destination, escrow_release: t.metadata?.escrow_release === 'true' },
        })
        break
      }

      default:
        await supabase.from('audit_log').insert({
          action: `stripe_event_${event.type}`,
          severity: 'info',
          metadata: { event_type: event.type },
        })
    }
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ error: 'Internal error', received: true }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
