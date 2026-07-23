// API: ScriptForge — roteiros Reels/TikTok/VSL
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { gerarRoteiroVideo } from '@/lib/agents/scriptforge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { produto = '', nicho = 'marketing', duracao = 30, tom = 'influencer', publico = 'criadores', preco, formato = 'reels', objetivo = 'vender' } = body || {}
    if (!produto || produto.length < 2) return NextResponse.json({ error: 'Informe o produto' }, { status: 400 })
    const d = Number(duracao)
    const du = [15, 30, 60, 90].includes(d) ? (d as 15 | 30 | 60 | 90) : 30
    const out = gerarRoteiroVideo({
      produto: produto.slice(0, 80),
      nicho: nicho.slice(0, 80),
      duracao: du,
      tom: (['influencer', 'ceo', 'amigo', 'urgente', 'tutorial'] as const).includes(tom) ? tom : 'influencer',
      publico: publico.slice(0, 80),
      preco: preco ? Number(preco) : undefined,
      formato: (['reels', 'tiktok', 'shorts', 'vsl', 'stories'] as const).includes(formato) ? formato : 'reels',
      objetivo: (['vender', 'engajar', 'leads', 'audiencia'] as const).includes(objetivo) ? objetivo : 'vender',
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
