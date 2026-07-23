export const runtime = 'nodejs'
import { gerarSEO } from '@/lib/agents/seooptimizer'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.titulo || !b.descricao) return Response.json({ error: 'Informe título e descrição' }, { status: 400 })
    return Response.json(gerarSEO({ titulo: b.titulo, descricao: b.descricao, categoria: b.categoria, preco: b.preco?Number(b.preco):undefined, marca: b.marca||'KIYVO' }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
