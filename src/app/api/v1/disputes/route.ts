// v0.0.1 — Disputas autenticadas com freeze automático de escrow e trilha de auditoria.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, getSafeAdminClient } from '@/lib/auth/server'
import { escrowService } from '@/lib/escrow/EscrowService'

const createSchema = z.object({ orderId: z.string().uuid(), reason: z.string().trim().min(10).max(2000) })

export async function GET() {
  const { user, adminClient, error } = await requireAuth()
  if (error || !user) return NextResponse.json({ error: error || 'Faça login para continuar.' }, { status: 401 })
  try {
    const admin = getSafeAdminClient(adminClient)
    const { data, error: queryError } = await admin.from('disputes_v001').select('id,order_id,reason,status,opened_at,seller_due_at,resolution,resolved_at').eq('buyer_id', user.id).order('opened_at', { ascending: false })
    if (queryError) return NextResponse.json({ error: 'Não foi possível buscar suas disputas.' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Não foi possível buscar suas disputas.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { user, adminClient, error } = await requireAuth()
  if (error || !user) return NextResponse.json({ error: error || 'Faça login para continuar.' }, { status: 401 })
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Informe um pedido e descreva o problema com pelo menos 10 caracteres.' }, { status: 400 })
    const admin = getSafeAdminClient(adminClient)
    const { data: order, error: orderError } = await admin.from('orders').select('id,buyer_id,vendor_id,created_at,status').eq('id', parsed.data.orderId).maybeSingle()
    if (orderError || !order || String(order.buyer_id) !== user.id) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    if (new Date(String(order.created_at)).getTime() < Date.now() - 7 * 86_400_000) return NextResponse.json({ error: 'O prazo de garantia deste pedido encerrou.' }, { status: 409 })
    if (['refunded', 'cancelled'].includes(String(order.status))) return NextResponse.json({ error: 'Este pedido não pode receber disputa.' }, { status: 409 })
    const { data: existing } = await admin.from('disputes_v001').select('id').eq('order_id', parsed.data.orderId).in('status', ['open', 'seller_response', 'admin_review']).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Já existe uma disputa ativa para este pedido.' }, { status: 409 })
    const { data: dispute, error: createError } = await admin.from('disputes_v001').insert({ order_id: parsed.data.orderId, buyer_id: user.id, seller_id: order.vendor_id ?? null, reason: parsed.data.reason, status: 'open' }).select('id,status,seller_due_at').single()
    if (createError || !dispute) return NextResponse.json({ error: 'Não foi possível abrir a disputa.' }, { status: 500 })
    await escrowService.freezeForDispute(parsed.data.orderId)
    await admin.from('audit_logs_v001').insert({ actor_id: user.id, action: 'dispute_opened', target_type: 'dispute', target_id: dispute.id, metadata: { orderId: parsed.data.orderId } })
    return NextResponse.json({ data: dispute }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Não foi possível abrir a disputa.' }, { status: 500 })
  }
}
