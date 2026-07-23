export const runtime = 'nodejs'
import { gerarGrade } from '@/lib/agents/gradehorarios'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarGrade({
      nicho: b.nicho, horasPorDia: Number(b.horas || 2),
      redes: b.redes || ['Instagram','TikTok'], diasPorSemana: Number(b.dias || 6),
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
