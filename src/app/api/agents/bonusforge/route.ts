// API: BonusForge — pacotes de bônus
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarBonus } from '@/lib/agents/bonusforge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { produto = '', preco = 97, nicho = 'digital', publico, tipoProduto } = body || {}
    if (!produto || produto.length < 2) return NextResponse.json({ error: 'Informe o produto' }, { status: 400 })
    const p = Number(preco)
    if (isNaN(p) || p <= 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    const tipos = ['curso', 'ferramenta', 'template', 'ebook', 'servico', 'fisico', 'combo']
    const out = gerarBonus({
      produto: produto.slice(0, 80),
      preco: p,
      nicho: nicho.slice(0, 80),
      publico,
      tipoProduto: tipos.includes(tipoProduto) ? (tipoProduto as any) : 'curso',
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
