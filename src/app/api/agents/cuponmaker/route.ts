export const runtime = 'nodejs'
import { gerarCupom } from '@/lib/agents/cuponmaker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarCupom({
      objetivo: b.objetivo||'boas_vindas',
      ticketMedio: Number(b.ticket)||97,
      nome: b.nome||'KIYVO',
      descontoMaximo: b.maxDesconto?Number(b.maxDesconto):undefined,
    }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
