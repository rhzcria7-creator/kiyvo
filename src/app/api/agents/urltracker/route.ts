export const runtime = 'nodejs'
import { gerarUtmLink } from '@/lib/agents/urltracker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarUtmLink(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
