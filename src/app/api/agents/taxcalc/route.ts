// API: TaxCalc — calculadora de lucro líquido real
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { calcularLucroLiquido } from '@/lib/agents/taxcalc'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { preco = 97, custo = 0, frete = 0, anuncios = 0, cupom = 0, kdPointsUsados = 0, categoria = 'digital', tipoConta = 'pf', vendasMes = 1, metodoPagamento = 'pix', parcelas = 1 } = body || {}
    const p = Number(preco)
    if (isNaN(p) || p <= 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    const catsValidas = ['digital', 'fisico', 'freela', 'afiliado']
    if (!catsValidas.includes(categoria)) return NextResponse.json({ error: `Categoria inválida. Use: ${catsValidas.join(', ')}` }, { status: 400 })
    const contasValidas = ['pf', 'simples', 'me', 'lp']
    if (!contasValidas.includes(tipoConta)) return NextResponse.json({ error: `Tipo de conta inválida. Use: ${contasValidas.join(', ')}` }, { status: 400 })
    const metodos = ['pix', 'cartao_avista', 'cartao_parcelado', 'boleto']
    if (!metodos.includes(metodoPagamento)) return NextResponse.json({ error: `Método inválido. Use: ${metodos.join(', ')}` }, { status: 400 })
    const out = calcularLucroLiquido({
      preco: p,
      custo: Number(custo) || 0,
      frete: Number(frete) || 0,
      anuncios: Number(anuncios) || 0,
      cupom: Number(cupom) || 0,
      kdPointsUsados: Number(kdPointsUsados) || 0,
      categoria: categoria as any,
      tipoConta: tipoConta as any,
      vendasMes: Number(vendasMes) || 1,
      metodoPagamento: metodoPagamento as any,
      parcelas: Math.max(1, Math.min(12, Number(parcelas) || 1)),
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
