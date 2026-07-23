export const runtime = 'nodejs'
import { gerarIdeiasBlog } from '@/lib/agents/blogideia'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho) return Response.json({ error: 'Informe nicho' }, { status: 400 })
    return Response.json(gerarIdeiasBlog({ nicho: b.nicho, quantidade: Number(b.qtd) || 15 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
