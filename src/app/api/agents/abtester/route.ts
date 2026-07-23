export const runtime = 'nodejs'
import { calcularTesteAB } from '@/lib/agents/abtester'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(calcularTesteAB(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
