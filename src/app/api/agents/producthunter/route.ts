// GET /api/agents/producthunter?categoria=streaming&max=8
// Retorna sugestões de produtos de alta margem.
import { NextRequest, NextResponse } from 'next/server'
import { huntProducts } from '@/lib/agents/producthunter'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const categoria = url.searchParams.get('categoria') || 'todas'
    const max = Math.min(Number(url.searchParams.get('max')) || 12, 50)
    const produtos = huntProducts(categoria, max)
    return NextResponse.json({ produtos })
  } catch {
    return NextResponse.json({ error: 'Erro no ProductHunter.' }, { status: 500 })
  }
}
