export const runtime = 'nodejs'
import { gerarThumbnail } from '@/lib/agents/thumbnailmaker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.titulo || b.titulo.length < 3) return Response.json({ error: 'Informe o título do thumbnail' }, { status: 400 })
    return Response.json(gerarThumbnail({
      titulo: b.titulo,
      estilo: b.estilo || 'youtube',
      corPrimaria: b.corPrimaria,
      nicho: b.nicho || 'default',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
