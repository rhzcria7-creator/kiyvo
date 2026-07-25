export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// POST /api/checkout/local/confirm
// Confirma o pagamento PIX manual (modo demo/local) e libera o
// ativo digital (ex.: credenciais) para o comprador.
// Usado quando KIYVO_PIX_KEY está configurada na rota de checkout.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getDb, findSession, persist } from '@/lib/localdb'
import { isSupabaseConfigured } from '@/lib/backend/detect'

export async function POST(req: NextRequest) {
  if (isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Use Stripe checkout em produção' }, { status: 400 })
  }

  try {
    const token = req.cookies.get('kiyvo_session')?.value
    if (!token) return NextResponse.json({ error: 'Login obrigatório' }, { status: 401 })

    const session = findSession(token)
    if (!session) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const orderId = typeof body.order_id === 'string' ? body.order_id : ''
    if (!orderId) return NextResponse.json({ error: 'Pedido obrigatório' }, { status: 400 })

    const db = getDb()
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

    if (order.status === 'delivered') {
      return NextResponse.json({ ok: true, already: true, asset: order.asset })
    }
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ ok: true, asset: order.asset })
    }

    // Libera o ativo a partir do produto vinculado ao pedido.
    const product = db.products.find((p) => p.id === order.product_id)
    const asset =
      product && product.delivery_type === 'auto' && product.asset_data
        ? { type: 'key', data: product.asset_data }
        : null

    order.status = 'delivered'
    order.delivered_at = new Date().toISOString()
    order.asset = asset

    // Credita o cashback de KD no momento da confirmação do pagamento.
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
