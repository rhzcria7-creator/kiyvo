// POST /api/agent — endpoint GENÉRICO para QUALQUER agente.
// Recebe { slug, message, history } e responde usando o cérebro único com
// a personalidade correta. O nome do motor/orquestrador NUNCA é exposto.
// Comentários em PT-BR.
import { NextRequest, NextResponse } from 'next/server'
import { askAgent } from '@/lib/agents/brain'

export const dynamic = 'force-dynamic'

interface ReqBody {
  slug?: string
  message?: string
  history?: { de: 'user' | 'agente'; texto: string }[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ReqBody
    const slug = (body.slug || 'kiya').trim()
    const msg = (body.message || '').trim()
    if (!msg) {
      return NextResponse.json({ ok: false, error: 'Mensagem vazia' }, { status: 400 })
    }
    if (msg.length > 1500) {
      return NextResponse.json({ ok: false, error: 'Mensagem muito longa (máx 1500 caracteres)' }, { status: 400 })
    }
    // Sanitiza o slug do agente (apenas letras, números, - _)
    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'kiya'
    const history = Array.isArray(body.history) ? body.history.slice(-20) : []
    const reply = askAgent(safeSlug, msg, history)
    return NextResponse.json({ ok: true, data: reply })
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }
}
