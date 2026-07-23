export const runtime = 'nodejs'
import { gerarUrgencia } from '@/lib/agents/urgenciamaker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarUrgencia({
      estoque: b.estoque ? Number(b.estoque) : undefined,
      promocaoAte: b.promocaoAte,
      vagas: b.vagas ? Number(b.vagas) : undefined,
      bonusExclusivo: b.bonus,
      tipo: b.tipo || 'tempo',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
