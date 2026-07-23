export const runtime = 'nodejs'
import { gerarFAQ } from '@/lib/agents/faqmaker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto) return Response.json({ error: 'Informe o produto' }, { status: 400 })
    return Response.json(gerarFAQ({ produto: b.produto, nicho: b.nicho || 'digital', preco: b.preco?Number(b.preco):undefined, beneficios: b.beneficios, publico: b.publico }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
