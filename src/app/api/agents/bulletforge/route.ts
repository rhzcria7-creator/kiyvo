export const runtime = 'nodejs'
import { gerarBullets } from '@/lib/agents/bulletforge'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarBullets(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
