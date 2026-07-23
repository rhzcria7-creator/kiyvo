export const runtime = 'nodejs'
import { gerarQRInspirado } from '@/lib/agents/qrcodegen'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.texto) return Response.json({ error: 'Informe o texto/URL para gerar QR' }, { status: 400 })
    return Response.json(gerarQRInspirado({ texto: b.texto, tamanho: Number(b.tamanho) || 220 }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
