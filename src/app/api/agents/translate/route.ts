export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import { translate, type Lang } from '@/lib/agents/translate'
import { createClient } from '@/lib/supabase/server'
import { trackUsage, checkLimit } from '@/lib/agents/storage'
import { AGENT_LIMITS } from '@/lib/agents/plans'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 20, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || `anon_${ip.replace(/\./g, '_')}`
    const plano = user ? (await supabase.from('profiles').select('plano,role').eq('id', user.id).single()).data?.plano as string || 'free' : 'free'
    if (!checkLimit(userId, 'translate', (AGENT_LIMITS.adoptimizer as Record<string, number>)[plano] || 1))
      return NextResponse.json({ error: 'Limite diário' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const text = typeof body.text === 'string' ? sanitizeInput(body.text).slice(0, 2000) : ''
    const target: Lang = ['pt', 'en', 'es'].includes(body.target) ? body.target : 'en'
    if (!text) return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 })

    const r = translate({ text, target })
    trackUsage(userId, 'translate')
    return NextResponse.json({ ok: true, result: r })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
