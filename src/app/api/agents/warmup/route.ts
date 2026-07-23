export const runtime = 'nodejs'
import { gerarPlanoWarmup } from '@/lib/agents/warmup'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.dominio) return Response.json({ error: 'Informe domínio' }, { status: 400 })
    return Response.json(gerarPlanoWarmup({ dominio: b.dominio, dias: Number(b.dias)||14, volumeDiarioInicial: Number(b.vol)||10 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
