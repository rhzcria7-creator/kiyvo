export const runtime = 'nodejs'
import { preverChurn } from '@/lib/agents/churnpredictor'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(preverChurn({
      totalCompras: Number(b.totalCompras || 0),
      diasDesdeUltimaCompra: b.diasCompra ? Number(b.diasCompra) : 999,
      diasDesdeUltimoLogin: b.diasLogin ? Number(b.diasLogin) : 999,
      totalAbandonosCarrinho: Number(b.abandonos || 0),
      reembolsos: Number(b.reembolsos || 0),
      ticketsAbertos: Number(b.tickets || 0),
      visitasUltimos7d: Number(b.visitas7d || 0),
      nivelSatisfacao: b.satisfacao ? Number(b.satisfacao) : 5,
      plano: b.plano || 'free',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
