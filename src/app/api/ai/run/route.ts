// POST /api/ai/run — Endpoint universal do orquestrador de IA KIYVO
// Usa Gemini/Groq/OpenRouter com fallback offline + DuckDuckGo search.
// Rate limit: 20 req/min por IP para não ser abusado.
import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/ai/orchestrator'
import { sanitizeInput } from '@/lib/security'

// Rate limit em memória (simples)
const RATE_WINDOW = 60_000 // 1 min
const RATE_MAX = 20
const hits = new Map<string, number[]>()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
    const now = Date.now()
    const arr = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW)
    if (arr.length >= RATE_MAX) {
      return NextResponse.json({ error: 'Muitas requisições. Aguarde 1 minuto.' }, { status: 429 })
    }
    arr.push(now)
    hits.set(ip, arr)

    const body = await req.json().catch(() => ({}))
    const message = typeof body.message === 'string' ? body.message.slice(0, 4000) : ''
    if (!message || message.trim().length < 2) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }
    const safeMessage = sanitizeInput(message)
    const agentId = typeof body.agentId === 'string' ? body.agentId : 'universal'
    const agentName = typeof body.agentName === 'string' ? body.agentName.slice(0, 80) : 'Copiloto KIYVO'
    const agentDescription = typeof body.agentDescription === 'string' ? body.agentDescription.slice(0, 500) : ''
    const webSearch = body.webSearch !== false

    const result = await runAgent(safeMessage, {
      agentId,
      agentName,
      agentDescription,
      webSearch,
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : 1024,
    })

    return NextResponse.json({
      ok: true,
      content: result.content,
      provider: result.provider,
      model: result.model,
      searchUsed: result.searchUsed,
      latencyMs: result.latencyMs,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
