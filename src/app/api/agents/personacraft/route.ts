export const runtime = 'nodejs'
import { criarPersonasCraft } from '@/lib/agents/personacraft'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho) return Response.json({ error: 'Informe o nicho' }, { status: 400 })
    return Response.json(criarPersonasCraft({
      nicho: b.nicho, produto: b.produto, publicoAlvo: b.publico,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
