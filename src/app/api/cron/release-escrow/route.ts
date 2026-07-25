// v0.0.1 — Cron protegido para liberar apenas escrow vencido e não congelado.
import { NextRequest, NextResponse } from 'next/server'
import { escrowService } from '@/lib/escrow/EscrowService'

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (!secret) return NextResponse.json({ error: 'Automação não configurada.' }, { status: 503 })
  if (authorization !== `Bearer ${secret}`) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  try { const released = await escrowService.releaseMatureHolds(); return NextResponse.json({ ok: true, released }) }
  catch { return NextResponse.json({ error: 'Não foi possível liberar saldos pendentes.' }, { status: 500 }) }
}
