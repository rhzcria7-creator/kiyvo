export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import { analyzeSeo } from '@/lib/agents/seoscore'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 20, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const titulo = typeof body.titulo === 'string' ? sanitizeInput(body.titulo).slice(0, 200) : ''
    const descricao = typeof body.descricao === 'string' ? sanitizeInput(body.descricao).slice(0, 5000) : ''
    if (!titulo) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })

    const r = analyzeSeo({
      titulo, descricao,
      preco: Number(body.preco) || undefined,
      imagens: Number(body.imagens) || 0,
      bullets: Array.isArray(body.bullets) ? body.bullets.slice(0, 20).map(String) : undefined,
      categoria: typeof body.categoria === 'string' ? body.categoria : undefined,
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 30).map(String) : undefined,
    })
    return NextResponse.json({ ok: true, result: r })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
