export const runtime = 'nodejs'
import { gerarCalendario } from '@/lib/agents/contentcalendar'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho) return Response.json({ error: 'Informe o nicho' }, { status: 400 })
    return Response.json(gerarCalendario({ nicho: b.nicho, produto: b.produto, quantidade: Number(b.qtd)||30, rede: b.rede }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
