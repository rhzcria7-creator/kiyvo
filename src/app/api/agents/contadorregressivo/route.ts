export const runtime = 'nodejs'
import { gerarContador } from '@/lib/agents/contadorregressivo'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.dataAlvo) return Response.json({ error: 'Informe data alvo (ISO)' }, { status: 400 })
    return Response.json(gerarContador({ dataAlvo: b.dataAlvo, titulo: b.titulo, cor: b.cor }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
