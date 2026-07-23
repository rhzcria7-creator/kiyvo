export const runtime = 'nodejs'
import { gerarSequenciaEmails } from '@/lib/agents/emailsequencia'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.produto) return Response.json({ error: 'Informe produto' }, { status: 400 })
    return Response.json(gerarSequenciaEmails({ produto: b.produto, publico: b.publico, preco: b.preco ? Number(b.preco) : undefined, nicho: b.nicho }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
