export const runtime = 'nodejs'
import { gerarWebhookTest } from '@/lib/agents/webhooktester'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarWebhookTest({
      evento: b.evento || 'compra_aprovada',
      produto: b.produto || 'Produto Teste',
      valor: Number(b.valor || 97),
      nome: b.nome || 'Maria Silva',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
