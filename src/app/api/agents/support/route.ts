// POST /api/agents/support — Kiya, suporte 24h
// ILIMITADO para qualquer usuário (mesmo não logado).
import { NextRequest, NextResponse } from 'next/server'
import { responderSuporte } from '@/lib/agents/support'
import { addThreadMessage } from '@/lib/agents/storage'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let userId = 'anon'
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) userId = data.user.id
    } catch {}

    const body = (await request.json().catch(() => ({}))) as { pergunta?: string }
    const pergunta = (body.pergunta || '').trim()
    if (!pergunta) return NextResponse.json({ error: 'Digite sua pergunta.' }, { status: 400 })
    if (pergunta.length > 500) return NextResponse.json({ error: 'Pergunta muito longa (máx 500 caracteres).' }, { status: 400 })

    addThreadMessage(userId, 'user', pergunta)
    const r = responderSuporte(pergunta)
    addThreadMessage(userId, 'assistant', r.resposta)

    return NextResponse.json(r)
  } catch {
    return NextResponse.json({ error: 'Erro no suporte.' }, { status: 500 })
  }
}
