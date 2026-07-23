export const runtime = 'nodejs'
import { gerarPodcast } from '@/lib/agents/podcastscript'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.tema) return Response.json({ error: 'Informe tema' }, { status: 400 })
    return Response.json(gerarPodcast({ tema: b.tema, convidado: b.convidado, duracao: Number(b.duracao) || 40 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
