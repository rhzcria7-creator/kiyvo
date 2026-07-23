export const runtime = 'nodejs'
import { gerarPropostaAfiliado } from '@/lib/agents/affiliateproposal'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto) return Response.json({ error: 'Informe produto' }, { status: 400 })
    return Response.json(gerarPropostaAfiliado({ produto: b.produto, preco: Number(b.preco||97), comissao: b.comissao ? Number(b.comissao) : undefined, afiliado: b.afiliado }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
