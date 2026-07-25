// v0.0.1 — Decisão administrativa auditável para disputas e escrow.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, getSafeAdminClient } from '@/lib/auth/server'
import { canTransitionDispute, type DisputeStatus } from '@/domain/disputes/DisputeEngine'

const resolutionSchema = z.object({ disputeId: z.string().uuid(), outcome: z.enum(['resolved','refunded','rejected']), resolution: z.string().trim().min(10).max(2000) })
export async function POST(request: NextRequest) {
  const { user, adminClient, error } = await requireAdmin()
  if (error || !user) return NextResponse.json({ error: error || 'Acesso restrito.' }, { status: 403 })
  try {
    const parsed = resolutionSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Dados de mediação inválidos.' }, { status: 400 })
    const admin = getSafeAdminClient(adminClient)
    const { data: dispute, error: disputeError } = await admin.from('disputes_v001').select('id,status,order_id').eq('id', parsed.data.disputeId).maybeSingle()
    if (disputeError || !dispute) return NextResponse.json({ error: 'Disputa não encontrada.' }, { status: 404 })
    const transition = canTransitionDispute(dispute.status as DisputeStatus, parsed.data.outcome, 'admin')
    if (!transition.allowed) return NextResponse.json({ error: transition.error }, { status: 409 })
    const now = new Date().toISOString()
    const { error: updateError } = await admin.from('disputes_v001').update({ status: parsed.data.outcome, resolution: parsed.data.resolution, resolved_at: now }).eq('id', dispute.id)
    if (updateError) return NextResponse.json({ error: 'Não foi possível registrar a decisão.' }, { status: 500 })
    const escrowStatus = parsed.data.outcome === 'refunded' ? 'refunded' : 'pending'
    await admin.from('escrow_holds').update({ status: escrowStatus }).eq('order_id', dispute.order_id).eq('status', 'frozen')
    if (parsed.data.outcome === 'refunded') await admin.from('orders').update({ status: 'refunded', refunded_at: now }).eq('id', dispute.order_id)
    await admin.from('audit_logs_v001').insert({ actor_id: user.id, action: `dispute_${parsed.data.outcome}`, target_type: 'dispute', target_id: dispute.id, metadata: { orderId: dispute.order_id } })
    return NextResponse.json({ ok: true, outcome: parsed.data.outcome })
  } catch { return NextResponse.json({ error: 'Não foi possível concluir a mediação.' }, { status: 500 }) }
}
