export const runtime = 'nodejs'
import { gerarSenhaForte } from '@/lib/agents/senhaforge'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarSenhaForte({
      tamanho: Number(b.tamanho) || 16,
      comMaiusculas: b.maiusculas !== false,
      comNumeros: b.numeros !== false,
      comSimbolos: b.simbolos !== false,
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
