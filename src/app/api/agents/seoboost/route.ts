export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import { generateSeo } from '@/lib/agents/seoboost'
import { trackUsage, checkLimit } from '@/lib/agents/storage'
import { AGENT_LIMITS } from '@/lib/agents/plans'

const LIMITS = { free: 2, plus: 15, pro: 50, vendor_pro: 200, staff: 9999 }

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 15, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || `anon_${ip.replace(/\./g, '_')}`
    const plano = user ? (await supabase.from('profiles').select('plano,role').eq('id', user.id).single()).data?.plano as string || 'free' : 'free'
    const limitKey = (plano in LIMITS ? plano : 'free') as keyof typeof LIMITS
    if (!checkLimit(userId, 'seoboost', AGENT_LIMITS.adoptimizer[limitKey] ?? LIMITS.free))
      return NextResponse.json({ error: 'Limite diário atingido' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const titulo = typeof body.titulo === 'string' ? sanitizeInput(body.titulo).slice(0, 120) : ''
    if (!titulo) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })

    const r = generateSeo({
      titulo,
      descricao: typeof body.descricao === 'string' ? sanitizeInput(body.descricao).slice(0, 2000) : '',
      categoria: typeof body.categoria === 'string' ? body.categoria : '',
      preco: Number(body.preco) || undefined,
      marca: 'KIYVO',
    })

    trackUsage(userId, 'seoboost')
    return NextResponse.json({ ok: true, result: r })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
