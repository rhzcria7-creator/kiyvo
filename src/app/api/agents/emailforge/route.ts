// API: EmailForge — sequências de e-mail
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarSequenciaEmail } from '@/lib/agents/emailforge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const tiposValidos = ['boas_vindas', 'carrinho_abandonado', 'lancamento', 'pos_venda', 'reativacao', 'blackfriday', 'upsell', 'newsletter']
    const { tipo = 'boas_vindas', produto, nomeLead, nomeLoja, desconto = 10, preco = 97, publico } = body || {}
    if (!tiposValidos.includes(tipo)) return NextResponse.json({ error: `Tipo inválido. Use: ${tiposValidos.join(', ')}` }, { status: 400 })
    const out = gerarSequenciaEmail({
      tipo: tipo as any,
      produto: produto || 'o produto',
      nomeLead: nomeLead || 'Cliente',
      nomeLoja: nomeLoja || 'KIYVO',
      desconto: Number(desconto) || 10,
      preco: Number(preco) || 97,
      publico,
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
