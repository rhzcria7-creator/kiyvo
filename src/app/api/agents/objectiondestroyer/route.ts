export const runtime = 'nodejs'
import { destruirObjecoes } from '@/lib/agents/objectiondestroyer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto) return Response.json({ error: 'Informe produto e preço' }, { status: 400 })
    return Response.json(destruirObjecoes({ produto: b.produto, preco: Number(b.preco)||97, nicho: b.nicho||'digital', publico: b.publico }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
