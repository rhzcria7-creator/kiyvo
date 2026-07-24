// Endpoint do agente reviewreplier — todos os agentes usam o cérebro unificado.
// Cada agente tem personalidade própria; o usuário NUNCA vê o cérebro por trás.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { askAgent } from '@/lib/agents/brain'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const msg = String(body?.message || body?.prompt || body?.input || '').trim()
    if (!msg) return NextResponse.json({ ok: false, error: 'Mensagem vazia' }, { status: 400 })
    if (msg.length > 2000) return NextResponse.json({ ok: false, error: 'Mensagem muito longa' }, { status: 400 })
    const history = Array.isArray(body?.history) ? body.history.slice(-20) : []
    const res = askAgent('reviewreplier', msg, history)
    return NextResponse.json({ ok: true, data: res, output: res.texto })
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }
}
