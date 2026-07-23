export const runtime = 'nodejs'
import { gerarQuiz } from '@/lib/agents/quizfunnel'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho) return Response.json({ error: 'Informe o nicho' }, { status: 400 })
    return Response.json(gerarQuiz({
      nicho: b.nicho, objetivo: b.objetivo, publico: b.publico,
      produto: b.produto || b.nicho, totalPerguntas: b.qtd ? Number(b.qtd) : 5,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
