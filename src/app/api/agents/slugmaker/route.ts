export const runtime = 'nodejs'
import { gerarSlug } from '@/lib/agents/slugmaker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.titulo) return Response.json({ error: 'Informe o título' }, { status: 400 })
    return Response.json(gerarSlug({
      titulo: b.titulo, categoria: b.categoria, id: b.id, maxLength: Number(b.maxLength)||80,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
