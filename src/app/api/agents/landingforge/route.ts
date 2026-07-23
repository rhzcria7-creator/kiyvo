export const runtime = 'nodejs'
import { gerarLanding } from '@/lib/agents/landingforge'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarLanding(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
