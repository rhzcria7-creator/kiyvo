// API: ScarcityForge — gatilhos de urgência
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarGatilhosEscassez } from '@/lib/agents/scarcityforge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { productTitle = 'Produto', price = 97, stock, salesCount, category, intensidade = 'media' } = body || {}
    const p = Number(price)
    if (!productTitle || typeof productTitle !== 'string' || productTitle.length < 2) return NextResponse.json({ error: 'Informe o título do produto' }, { status: 400 })
    if (isNaN(p) || p <= 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    const out = gerarGatilhosEscassez({ productTitle: productTitle.slice(0, 120), price: p, stock: stock ? Number(stock) : undefined, salesCount: salesCount ? Number(salesCount) : undefined, category, intensidade })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
