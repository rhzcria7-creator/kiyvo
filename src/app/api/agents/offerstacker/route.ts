export const runtime = 'nodejs'
import { criarOfferStack } from '@/lib/agents/offerstacker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto || !b.precoBase) return Response.json({ error: 'Informe produto e preço' }, { status: 400 })
    return Response.json(criarOfferStack({
      produto: b.produto, precoBase: Number(b.precoBase),
      valorPercebido: b.valorPercebido ? Number(b.valorPercebido) : undefined,
      nicho: b.nicho || 'digital',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
