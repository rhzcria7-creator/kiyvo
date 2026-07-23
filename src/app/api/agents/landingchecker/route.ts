export const runtime = 'nodejs'
import { analisarLanding } from '@/lib/agents/landingchecker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(analisarLanding({
      titulo: b.titulo, subtitulo: b.subtitulo, heroTitulo: b.heroTitulo, heroSubtitulo: b.heroSubtitulo,
      temCTA: !!b.temCTA, temDepoimentos: !!b.temDepoimentos, temGarantia: !!b.temGarantia,
      temFAQ: !!b.temFAQ, temEscassez: !!b.temEscassez, preco: b.preco ? Number(b.preco) : undefined,
      callToActions: b.ctas || [], publico: b.publico,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
