export const runtime = 'nodejs'
import { gerarChecklistLancamento } from '@/lib/agents/launchchecklist'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarChecklistLancamento({
      tipoLancamento: b.tipo || 'produto_novo',
      diasAteLancamento: Number(b.dias || 14),
      nicho: b.nicho,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
