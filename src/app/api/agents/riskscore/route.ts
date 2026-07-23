export const runtime = 'nodejs'
import { calcularRisco } from '@/lib/agents/riskscore'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(calcularRisco({
      valor: Number(b.valor||97), novoCliente: b.novo !== false, emailIdadeDias: Number(b.idadeEmail||30),
      mesmoIPqueAntes: !!b.mesmoIp, pais: b.pais || 'BR', cartaoPaisDiferente: !!b.cartaoOutro,
      horario: b.hora ? Number(b.hora) : new Date().getHours(), tentativasFalhas: Number(b.falhas||0), msmDeviceUsado: !!b.mesmoDevice
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
