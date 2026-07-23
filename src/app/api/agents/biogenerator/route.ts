export const runtime = 'nodejs'
import { gerarBio } from '@/lib/agents/biogenerator'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nome || !b.nicho) return Response.json({ error: 'Informe nome e nicho' }, { status: 400 })
    return Response.json(gerarBio({ nome: b.nome, nicho: b.nicho, publico: b.publico, tom: b.tom, cta: b.cta, link: b.link }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
