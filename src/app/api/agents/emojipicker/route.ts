export const runtime = 'nodejs'
import { escolherEmojis } from '@/lib/agents/emojipicker'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.texto) return Response.json({ error: 'Informe o texto' }, { status: 400 })
    return Response.json(escolherEmojis({
      texto: b.texto, quantidade: Number(b.qtd || 3), posicao: b.posicao || 'bullet',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
