export const runtime = 'nodejs'
import { analisarCompetidores } from '@/lib/agents/competitormonitor'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.seuProduto || !b.seuPreco) return Response.json({ error: 'Informe seu produto e preço' }, { status: 400 })
    return Response.json(analisarCompetidores({
      seuProduto: b.seuProduto, seuPreco: Number(b.seuPreco),
      concorrentes: b.concorrentes || [], seuDiferencial: b.diferencial || [],
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
