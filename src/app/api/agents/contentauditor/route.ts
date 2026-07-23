export const runtime = 'nodejs'
import { auditarConteudo } from '@/lib/agents/contentauditor'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.titulo) return Response.json({ error: 'Informe ao menos o título' }, { status: 400 })
    return Response.json(auditarConteudo({
      titulo: b.titulo, descricao: b.descricao || '',
      preco: b.preco ? Number(b.preco) : undefined,
      imagens: Number(b.imagens || 0),
      temTermos: !!b.temTermos, temGarantia: !!b.temGarantia, temPolitica: !!b.temPolitica,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
