// API: TitleSplit — variantes de títulos com CTR estimado
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarTitulosSplit } from '@/lib/agents/titlesplit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { produto = '', nicho = '', publico = 'pessoas como você', beneficio, dor } = body || {}
    if (!produto || produto.length < 2) return NextResponse.json({ error: 'Informe o produto' }, { status: 400 })
    if (!nicho || nicho.length < 2) return NextResponse.json({ error: 'Informe o nicho' }, { status: 400 })
    const out = gerarTitulosSplit({ produto: produto.slice(0, 80), nicho: nicho.slice(0, 80), publico: publico.slice(0, 80), beneficio, dor })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
