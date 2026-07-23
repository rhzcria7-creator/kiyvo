// API: DescFetcher — analisa descrição de concorrente
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { analisarDescricaoConcorrente } from '@/lib/agents/descfetcher'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { descricaoConcorrente = '', tituloConcorrente, precoConcorrente, nicho, seuProduto } = body || {}
    if (!descricaoConcorrente || descricaoConcorrente.length < 20) {
      return NextResponse.json({ error: 'Cole a descrição do concorrente (mín 20 caracteres)' }, { status: 400 })
    }
    if (descricaoConcorrente.length > 8000) return NextResponse.json({ error: 'Descrição muito longa (máx 8000 caracteres)' }, { status: 400 })
    const out = analisarDescricaoConcorrente({
      descricaoConcorrente,
      tituloConcorrente,
      precoConcorrente: precoConcorrente ? Number(precoConcorrente) : undefined,
      nicho,
      seuProduto: seuProduto || 'seu produto',
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
