export const runtime = 'nodejs'
import { gerarScriptShort } from '@/lib/agents/scriptshort'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.nicho || b.nicho.length < 2) return Response.json({ error: 'Informe o nicho' }, { status: 400 })
    return Response.json(gerarScriptShort({
      nicho: b.nicho, topico: b.topico || b.nicho,
      duracao: b.duracao || '30s', tom: b.tom || 'curioso',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
