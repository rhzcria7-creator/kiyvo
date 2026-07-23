export const runtime = 'nodejs'
import { criarPersonas } from '@/lib/agents/personabuilder'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(criarPersonas(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
