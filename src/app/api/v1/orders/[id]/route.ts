// ─────────────────────────────────────────────────────────────
// GET /api/v1/orders/:id — Detalhes do pedido para o pós-compra
// Entrega asset desencriptado se o pagamento foi confirmado e
// se o produto é do catálogo oficial (KIYVO Oficial) ou do Cofre.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'
import { fulfillOfficialSku } from '@/lib/catalog/official'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 60, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const sb = createAdminClient()
    if (!sb) return NextResponse.json({ error: 'Indisponível' }, { status: 503 })

    const orderId = ctx.params.id

    // Aceitar busca por order_number ou payment_id também (via ?by=)
    const by = new URL(req.url).searchParams.get('by')
    let query = sb.from('orders').select(`
      id, order_number, status, price, subtotal, title, payment_method,
      paid_at, delivered_at, confirmed_at, pix_code, pix_qrcode_url, pix_expires_at,
      metadata, buyer_id, vendor_id, product_id,
      order_items(*)
    `)

    if (by === 'payment') query = query.eq('payment_id', orderId)
    else if (by === 'session') query = query.eq('stripe_checkout_session_id', orderId)
    else query = query.eq('id', orderId)

    const { data: order, error } = await query.single()
    if (error || !order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const meta = (order.metadata || {}) as Record<string, unknown>
    const sku = meta.sku as string | undefined
    const productType = meta.product_type as string | undefined

    // Entrega automática de produto oficial se paid/delivered
    let asset: { type: string; data: string } | null = null

    if ((order.status === 'paid' || order.status === 'delivered' || order.status === 'confirmed') && sku && productType === 'official') {
      // Verificar se já temos order_items e se já entregamos
      const items = (order.order_items || []) as Array<Record<string, unknown>>
      const existingKey = items.find(i => i.digital_delivery_url)?.digital_delivery_url as string | undefined

      if (existingKey) {
        asset = { type: 'codigo', data: existingKey }
      } else {
        // Fulfill no fornecedor
        const result = await fulfillOfficialSku(sku, { email: user.email || '', orderId: order.id })
        if (result.ok && result.key) {
          // Salvar no order_items (simulando asset)
          await sb.from('order_items').insert({
            order_id: order.id,
            product_id: order.product_id || null,
            product_title_snapshot: order.title || 'Produto',
            quantity: 1,
            unit_price: order.price,
            delivery_status: 'delivered',
            digital_delivery_url: result.key,
            delivered_at: new Date().toISOString(),
          })

          await sb.from('orders')
            .update({
              status: 'delivered',
              delivered_at: new Date().toISOString(),
              auto_confirm_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            })
            .eq('id', order.id)
            .eq('status', 'paid')

          asset = { type: 'codigo', data: result.key }
        }
      }
    }

    // KD Points ganhos
    const kdPoints = Math.floor((Number(order.subtotal) || 0) * 2)

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        subtotal: Number(order.subtotal) || Number(order.price) || 0,
        title: order.title,
        payment_method: order.payment_method,
        paid_at: order.paid_at,
        delivered_at: order.delivered_at,
        auto_confirm_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        kd_points: kdPoints,
        order_items: order.order_items,
        asset,
        pix_qrcode_url: order.pix_qrcode_url,
        pix_code: order.pix_code,
        pix_expires_at: order.pix_expires_at,
        is_official: productType === 'official',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
