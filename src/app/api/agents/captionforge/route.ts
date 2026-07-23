export const runtime = 'nodejs'
import { gerarLegenda } from '@/lib/agents/captionforge'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto || b.produto.length < 2) return Response.json({ error: 'Informe o produto/tema' }, { status: 400 })
    return Response.json(gerarLegenda({ produto: b.produto, nicho: b.nicho || 'digital', tom: b.tom, rede: b.rede, objetivo: b.objetivo, preco: b.preco?Number(b.preco):undefined }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
