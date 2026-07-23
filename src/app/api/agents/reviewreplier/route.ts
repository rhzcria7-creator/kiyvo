export const runtime = 'nodejs'
import { gerarRespostaReview } from '@/lib/agents/reviewreplier'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    const nota = Number(b.nota || 5)
    return Response.json(gerarRespostaReview({
      nota, comentario: b.comentario, nomeCliente: b.nome || 'cliente',
      nomeLoja: b.loja || 'KIYVO', tom: b.tom || 'amigavel',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
