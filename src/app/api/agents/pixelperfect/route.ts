export const runtime = 'nodejs'
import { diagnosticarPixeis } from '@/lib/agents/pixelperfect'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(diagnosticarPixeis(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
