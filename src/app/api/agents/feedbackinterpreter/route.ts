export const runtime = 'nodejs'
import { interpretarFeedback } from '@/lib/agents/feedbackinterpreter'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.texto) return Response.json({ error: 'Informe texto do feedback' }, { status: 400 })
    return Response.json(interpretarFeedback({ texto: b.texto, nota: b.nota ? Number(b.nota) : undefined }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
