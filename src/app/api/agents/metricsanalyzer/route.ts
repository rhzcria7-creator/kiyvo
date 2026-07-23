export const runtime = 'nodejs'
import { analisarMetricas } from '@/lib/agents/metricsanalyzer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(analisarMetricas({
      visitas: Number(b.visitas || 0),
      sessoes: Number(b.sessoes || b.visitas || 0),
      addCarrinho: Number(b.cart || 0),
      checkoutsIniciados: Number(b.checkout || 0),
      compras: Number(b.compras || 0),
      receita: Number(b.receita || 0),
      reembolsos: Number(b.reembolsos || 0),
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
