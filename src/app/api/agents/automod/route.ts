export const runtime = 'nodejs'
import { automodAnalisar } from '@/lib/agents/automod'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.texto || b.texto.length < 2) return Response.json({ error: 'Informe o texto para análise' }, { status: 400 })
    return Response.json(automodAnalisar({ texto: b.texto, contexto: b.contexto || 'comentario' }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
