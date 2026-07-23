export const runtime = 'nodejs'
import { preverRetarget } from '@/lib/agents/retargetpredictor'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(preverRetarget({
      visitouProduto: !!b.visitou,
      addCarrinho: !!b.addCart,
      iniciouCheckout: !!b.checkout,
      comprou: !!b.comprou,
      horasDesdeUltimoContato: b.horas ? Number(b.horas) : 999,
      vezesVoltou: Number(b.vezes || 1),
      valorCarrinho: b.valor ? Number(b.valor) : 0,
      abriuEmail: b.email !== false,
      abriuWhats: !!b.whats,
      abriuPush: b.push !== false,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
