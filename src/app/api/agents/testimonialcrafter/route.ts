export const runtime = 'nodejs'
import { gerarDepoimentos } from '@/lib/agents/testimonialcrafter'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto) return Response.json({ error: 'Informe produto' }, { status: 400 })
    return Response.json(gerarDepoimentos({ produto: b.produto, quantidade: Number(b.qtd)||5, nicho: b.nicho }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
