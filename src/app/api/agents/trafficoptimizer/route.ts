export const runtime = 'nodejs'
import { otimizarTrafego } from '@/lib/agents/trafficoptimizer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(otimizarTrafego({
      orcamentoTotal: Number(b.orcamento)||100,
      nicho: b.nicho,
      objetivo: b.objetivo || 'vendas',
      canais: b.canais,
    }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
