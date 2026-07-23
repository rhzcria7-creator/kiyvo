export const runtime = 'nodejs'
import { polirTexto } from '@/lib/agents/legacypolisher'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.texto || b.texto.length < 10) return Response.json({ error: 'Envie um texto para polir (mín. 10 caracteres)' }, { status: 400 })
    return Response.json(polirTexto({ texto: b.texto, tom: b.tom }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
