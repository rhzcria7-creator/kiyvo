export const runtime = 'nodejs'
import { gerarValeDesconto } from '@/lib/agents/valedecesconto'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarValeDesconto({ tema: b.tema, desconto: Number(b.desconto||10), tipo: b.tipo||'boasvindas' }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
