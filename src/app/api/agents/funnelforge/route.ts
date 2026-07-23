// API: FunnelForge — funis de vendas
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarFunil } from '@/lib/agents/funnelforge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const tipos = ['oficina_24h', 'perpetuo', 'lancamento_sniper', 'tripwire', 'high_ticket', 'afiliado', 'lead_ads']
    const { produto = '', preco = 97, nicho = 'digital', publico = 'pessoas que querem resultado', tipo = 'perpetuo', leadsPorDia = 100 } = body || {}
    if (!produto || produto.length < 2) return NextResponse.json({ error: 'Informe o produto' }, { status: 400 })
    const p = Number(preco)
    if (isNaN(p) || p <= 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    if (!tipos.includes(tipo)) return NextResponse.json({ error: `Tipo inválido. Use: ${tipos.join(', ')}` }, { status: 400 })
    const out = gerarFunil({ produto, preco: p, nicho, publico, tipo: tipo as any, leadsPorDia: Number(leadsPorDia) || 100 })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
