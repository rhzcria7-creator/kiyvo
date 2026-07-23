export const runtime = 'nodejs'
import { criarSequenciaStories } from '@/lib/agents/storybuilder'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(criarSequenciaStories(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
