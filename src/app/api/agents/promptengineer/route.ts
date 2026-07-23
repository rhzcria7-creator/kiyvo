export const runtime = 'nodejs'
import { criarPrompt } from '@/lib/agents/promptengineer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(criarPrompt(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
