export const runtime = 'nodejs'
import { gerarMinuta } from '@/lib/agents/contratorapido'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.tipo) return Response.json({ error: 'Informe tipo de contrato' }, { status: 400 })
    return Response.json(gerarMinuta({
      tipo: b.tipo, contratante: b.contratante, contratado: b.contratado,
      valor: b.valor ? Number(b.valor) : 0, prazo: b.prazo, escopo: b.escopo,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
