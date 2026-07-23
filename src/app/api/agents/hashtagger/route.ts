// API: Hashtagger
export const runtime = 'nodejs'
import { gerarHashtags } from '@/lib/agents/hashtagger'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho || b.nicho.length < 2) return Response.json({ error: 'Informe o nicho' }, { status: 400 })
    return Response.json(gerarHashtags({ nicho: b.nicho, produto: b.produto, rede: b.rede, quantidade: Number(b.qtd) || 30 }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
