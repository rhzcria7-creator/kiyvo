// POST /api/agents/reviewshield
// Moderação automática de texto (descrições, reviews, comentários).
// ILIMITADO — usado em todos os planos.
import { NextRequest, NextResponse } from 'next/server'
import { moderarConteudo } from '@/lib/agents/reviewshield'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { texto?: string }
    if (!body.texto) return NextResponse.json({ error: 'Informe o texto.' }, { status: 400 })
    const r = moderarConteudo(String(body.texto).slice(0, 20000))
    return NextResponse.json(r)
  } catch {
    return NextResponse.json({ error: 'Erro na moderação.' }, { status: 500 })
  }
}
