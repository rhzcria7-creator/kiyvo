// POST /api/hermes — endpoint do assistente Kiya (compatibilidade).
// Internamente usa o cérebro unificado, mas expõe a persona "Kiya" na resposta.
// O nome do motor interno NUNCA é exposto ao cliente.
// Comentários em PT-BR.
import { NextRequest, NextResponse } from 'next/server'
import { askAgent } from '@/lib/agents/brain'
import { rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

interface ReqBody {
  message?: string
  history?: { de: 'user' | 'agente'; texto: string }[]
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit anti-abuse: 20 mensagens por IP por minuto.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, 20, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Muitas mensagens. Aguarde um instante.' }, { status: 429 })
    }

    const body = (await req.json().catch(() => ({}))) as ReqBody
    const msg = (body.message || '').trim()
    if (!msg) {
      return NextResponse.json({ ok: false, error: 'Mensagem vazia' }, { status: 400 })
    }
    if (msg.length > 800) {
      return NextResponse.json({ ok: false, error: 'Mensagem muito longa (máx 800 caracteres)' }, { status: 400 })
    }
    const history = Array.isArray(body.history) ? body.history.slice(-12) : []
    // Sempre responde como "Kiya" (assistente principal)
    const reply = askAgent('_default', msg, history)
    // Resposta no formato antigo (hermasReply shape) para compatibilidade com KiyaWidget
    return NextResponse.json({
      ok: true,
      data: {
        texto: reply.texto,
        intent: 'outro',
        confianca: reply.confianca,
        acoes: reply.acoes,
        produtos: reply.produtos,
        lojas: reply.lojas,
      },
      provider: 'kiya',
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }
}
