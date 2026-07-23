export const runtime = 'nodejs'
import { gerarBoasVindas } from '@/lib/agents/whatsappboasvindas'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarBoasVindas({ nome: b.nome, nicho: b.nicho, produto: b.produto, tom: b.tom || 'amigavel' }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
