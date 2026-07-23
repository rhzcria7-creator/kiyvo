export const runtime = 'nodejs'
import { gerarAutoFAQ } from '@/lib/agents/faqauto'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho) return Response.json({ error: 'Informe nicho' }, { status: 400 })
    return Response.json(gerarAutoFAQ({ nicho: b.nicho, produto: b.produto, preco: b.preco ? Number(b.preco) : undefined, objeçõesExtra: b.obje || [] }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
