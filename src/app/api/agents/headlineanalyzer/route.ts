export const runtime = 'nodejs'
import { gerarHeadlines } from '@/lib/agents/headlineanalyzer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarHeadlines({ nicho: b.nicho || 'marketing', dor: b.dor, resultado: b.resultado, produto: b.produto }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
