export const runtime = 'nodejs'
import { gerarProvaSocial } from '@/lib/agents/socialproofengine'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produtoNome || !b.produtoPreco) return Response.json({ error: 'Informe o produto e preço' }, { status: 400 })
    return Response.json(gerarProvaSocial({
      produtoNome: b.produtoNome, produtoPreco: Number(b.produtoPreco),
      cenario: b.cenario || 'produto',
      vendasRecentes: b.vendas ? Number(b.vendas) : undefined,
      avaliacao: b.avaliacao ? Number(b.avaliacao) : undefined,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
