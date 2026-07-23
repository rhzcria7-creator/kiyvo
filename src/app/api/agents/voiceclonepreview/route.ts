export const runtime = 'nodejs'
import { prepararRoteiroVoz } from '@/lib/agents/voiceclonepreview'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.texto || b.texto.length < 5) return Response.json({ error: 'Informe o texto' }, { status: 400 })
    return Response.json(prepararRoteiroVoz({
      texto: b.texto, tom: b.tom || 'amigavel', velocidade: b.velocidade ? Number(b.velocidade) : 1,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
