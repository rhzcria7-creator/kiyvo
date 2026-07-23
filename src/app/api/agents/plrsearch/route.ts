export const runtime = 'nodejs'
import { gerarIdeiasPLR } from '@/lib/agents/plrsearch'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho) return Response.json({ error: 'Informe nicho' }, { status: 400 })
    return Response.json(gerarIdeiasPLR({ nicho: b.nicho, quantidade: Number(b.qtd)||10 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
