// API: ReviewResponder — responde avaliações com tom e sentimento
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarRespostaAvaliacao } from '@/lib/agents/responder'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { rating = 5, reviewText = '', sellerName = 'KIYVO', productName = 'seu produto', tone = 'amigavel' } = body || {}
    if (!reviewText || typeof reviewText !== 'string' || reviewText.length < 3) {
      return NextResponse.json({ error: 'Escreva o texto da avaliação' }, { status: 400 })
    }
    if (reviewText.length > 2000) return NextResponse.json({ error: 'Texto muito longo (máx 2000 caracteres)' }, { status: 400 })
    const r = Number(rating)
    if (isNaN(r) || r < 1 || r > 5) return NextResponse.json({ error: 'Nota inválida (1-5)' }, { status: 400 })
    const out = gerarRespostaAvaliacao({ rating: r, reviewText: reviewText.slice(0, 2000), sellerName, productName, tone })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
