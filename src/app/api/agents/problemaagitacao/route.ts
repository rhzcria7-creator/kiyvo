export const runtime = 'nodejs'
import { criarPAS } from '@/lib/agents/problemaagitacao'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.dor) return Response.json({ error: 'Informe a dor' }, { status: 400 })
    return Response.json(criarPAS({ dor: b.dor, publico: b.publico, solucao: b.solucao, produto: b.produto, consequencias: b.consequencias || [] }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
