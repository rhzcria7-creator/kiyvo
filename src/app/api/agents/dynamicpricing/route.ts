export const runtime = 'nodejs'
import { calcularPrecoDinamico } from '@/lib/agents/dynamicpricing'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.precoBase || Number(b.precoBase) <= 0) return Response.json({ error: 'Informe o preço base' }, { status: 400 })
    return Response.json(calcularPrecoDinamico({
      precoBase: Number(b.precoBase),
      custo: b.custo ? Number(b.custo) : undefined,
      estoque: b.estoque ? Number(b.estoque) : undefined,
      viewsUltimos7dias: b.views ? Number(b.views) : 0,
      vendasUltimos7dias: b.vendas ? Number(b.vendas) : 0,
      notaMedia: b.nota ? Number(b.nota) : 5,
      isBlackFriday: !!b.blackfriday,
      isLancamento: !!b.lancamento,
      concorrentes: b.concorrentes || [],
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
