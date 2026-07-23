export const runtime = 'nodejs'
import { gerarSequenciaWhatsapp } from '@/lib/agents/whatsappforge'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarSequenciaWhatsapp(b))
  } catch(e:any) { return Response.json({ error: e?.message || 'Erro' }, { status: 500 }) }
}
