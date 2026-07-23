export const runtime = 'nodejs'
import { gerarBadgeIndicacao } from '@/lib/agents/referralbadge'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nome || !b.codigo) return Response.json({ error: 'Informe nome e código' }, { status: 400 })
    return Response.json(gerarBadgeIndicacao({ nome: b.nome, codigo: b.codigo, corPrimaria: b.cor1, corSecundaria: b.cor2 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
