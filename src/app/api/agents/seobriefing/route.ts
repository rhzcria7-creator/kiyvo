export const runtime = 'nodejs'
import { gerarSEOBriefing } from '@/lib/agents/seobriefing'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.palavraChave) return Response.json({ error: 'Informe a palavra-chave' }, { status: 400 })
    return Response.json(gerarSEOBriefing({
      palavraChave: b.palavraChave, nicho: b.nicho, tipo: b.tipo || 'blog',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
