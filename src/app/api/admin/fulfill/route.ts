export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// POST /api/admin/fulfill
// Operador marca um pedido "aguardando PIX" como entregue (cumprimento
// manual). Protegido por sessão de administrador (modo local).
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getDb, findSession, persist, isLocalAdminByToken } from '@/lib/localdb'

export async function POST(req: NextRequest) {
  if (!isLocalAdminByToken(req.cookies.get('kiyvo_session')?.value)) {
    return NextResponse.json({ error: 'Acesso restrito ao administrador' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const orderId = typeof body.order_id === 'string' ? body.order_id : ''
    if (!orderId) return NextResponse.json({ error: 'Pedido obrigatório' }, { status: 400 })

    const db = getDb()
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    if (order.status === 'delivered') return NextResponse.json({ ok: true, already: true, asset: order.asset })

    const product = db.products.find((p) => p.id === order.product_id)
    const asset =
      product && product.delivery_type === 'auto' && product.asset_data
        ? { type: 'key', data: product.asset_data }
        : null

    order.status = 'delivered'
    order.delivered_at = new Date().toISOString()
    order.asset = asset

    // Credita cashback de KD na confirmação do pagamento.
    const buyer = db.users.find((u) => u.id === order.buyer_id)
    if (buyer) {
      const cashbackKD = Math.round(order.subtotal * 0.15 * 100)
      buyer.kd_points += cashbackKD
    }

    persist()
    return NextResponse.json({ ok: true, asset, payment_method: 'pix_manual' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao confirmar' }, { status: 500 })
  }
}
