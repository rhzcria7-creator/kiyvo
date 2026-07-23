// API: CompetidorRadar — análise de mercado/nicho
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { analisarMercado } from '@/lib/agents/competidorradar'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { nicho = '', produto, precoDesejado } = body || {}
    if (!nicho || nicho.length < 2) return NextResponse.json({ error: 'Informe o nicho' }, { status: 400 })
    const out = analisarMercado({
      nicho: nicho.slice(0, 80),
      produto: produto || nicho,
      precoDesejado: precoDesejado ? Number(precoDesejado) : undefined,
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
