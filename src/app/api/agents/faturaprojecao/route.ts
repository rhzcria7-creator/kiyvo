export const runtime = 'nodejs'
import { projetarFaturamento } from '@/lib/agents/faturaprojecao'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(projetarFaturamento({ visitantes: Number(b.visitas||1000), taxaConversao: b.tx ? Number(b.tx) : 0.02, ticketMedio: b.aov ? Number(b.aov) : 97, cpa: b.cpa ? Number(b.cpa) : 0, margem: b.margem ? Number(b.margem) : 0.7, dias: Number(b.dias)||30 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
