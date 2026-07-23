export const runtime = 'nodejs'
import { gerarCTAs } from '@/lib/agents/ctamaker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.acao) return Response.json({ error: 'Informe a ação' }, { status: 400 })
    return Response.json(gerarCTAs({ acao: b.acao, tom: b.tom||'direto', produto: b.produto }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
