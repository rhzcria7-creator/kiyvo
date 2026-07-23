export const runtime = 'nodejs'
import { validarBR } from '@/lib/agents/validatorbr'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.tipo || !b.valor) return Response.json({ error: 'Informe tipo e valor' }, { status: 400 })
    return Response.json(validarBR({ tipo: b.tipo, valor: b.valor }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
