export const runtime = 'nodejs'
import { smartCartAnalisar } from '@/lib/agents/smartcart'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(smartCartAnalisar({
      itens: b.itens || [],
      totalAtual: Number(b.totalAtual || 0),
      usuario: b.usuario,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
