export const runtime = 'nodejs'
import { pontuarTitulo } from '@/lib/agents/titlescorer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.titulo || b.titulo.length < 3) return Response.json({ error: 'Informe um título' }, { status: 400 })
    return Response.json(pontuarTitulo({ titulo: b.titulo, nicho: b.nicho || 'geral' }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
