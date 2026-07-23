export const runtime = 'nodejs'
import { analisarNPS } from '@/lib/agents/npsanalyzer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(analisarNPS({
      promotores: Number(b.promotores||0),
      neutros: Number(b.neutros||0),
      detratores: Number(b.detratores||0),
      comentarios: b.comentarios||[],
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
