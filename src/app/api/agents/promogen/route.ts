export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import { generatePromo, type PromoGoal, type PromoChannel } from '@/lib/agents/promogen'
import { trackUsage, checkLimit } from '@/lib/agents/storage'
import { AGENT_LIMITS } from '@/lib/agents/plans'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 10, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || `anon_${ip.replace(/\./g, '_')}`
    const plano = user ? (await supabase.from('profiles').select('plano,role').eq('id', user.id).single()).data?.plano as string || 'free' : 'free'
    if (!checkLimit(userId, 'promogen', (AGENT_LIMITS.adoptimizer as Record<string, number>)[plano] || 1))
      return NextResponse.json({ error: 'Limite diário' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const nome = typeof body.produtoNome === 'string' ? sanitizeInput(body.produtoNome).slice(0, 120) : ''
    if (!nome) return NextResponse.json({ error: 'Nome do produto obrigatório' }, { status: 400 })
    const preco = Number(body.precoAtual) || 0
    if (preco <= 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })

    const goal: PromoGoal = ['vender','liquidar','lancar','fidelizar'].includes(body.objetivo) ? body.objetivo : 'vender'
    const canal: PromoChannel = ['whatsapp','instagram','tiktok','email'].includes(body.canal) ? body.canal : 'instagram'

    const r = generatePromo({
      produtoNome: nome,
      precoAtual: preco,
      precoCusto: Number(body.precoCusto) || undefined,
      objetivo: goal,
      estoque: Number(body.estoque) || undefined,
      duracaoDias: Number(body.duracaoDias) || 7,
      canal,
    })
    trackUsage(userId, 'promogen')
    return NextResponse.json({ ok: true, result: r })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
