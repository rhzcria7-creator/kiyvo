export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// POST /api/agents/adoptimizer
// Body: { productTitle, productPrice, productCategory, productDescription,
//         platform, dailyBudget }
// Retorna análise completa de anúncio (otimização de CPA/ROAS).
// Limite por plano: ver AGENT_LIMITS em plans.ts (campo 'adoptimizer').
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackUsage, checkLimit } from '@/lib/agents/storage'
import { AGENT_LIMITS } from '@/lib/agents/plans'
import { sanitizeInput, rateLimit } from '@/lib/security'
import { optimizeAd } from '@/lib/agents/adoptimizer'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 15, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde 1 minuto.' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || `anon_${ip.replace(/\./g, '_')}`
    const userPlan = user ? ((await supabase.from('profiles').select('plano,role').eq('id', user.id).single()).data?.plano as string || 'free') : 'free'

    const allowed = checkLimit(userId, 'adoptimizer', AGENT_LIMITS.adoptimizer[userPlan as keyof typeof AGENT_LIMITS.adoptimizer] ?? AGENT_LIMITS.adoptimizer.free)
    if (!allowed) {
      return NextResponse.json({ error: 'Limite diário atingido. Faça upgrade do plano para otimizações ilimitadas.' }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    const productTitle = typeof body.productTitle === 'string' ? sanitizeInput(body.productTitle).slice(0, 120) : ''
    const productPrice = Number(body.productPrice)
    const productCategory = typeof body.productCategory === 'string' ? body.productCategory : 'default'
    const productDescription = typeof body.productDescription === 'string' ? sanitizeInput(body.productDescription).slice(0, 500) : ''
    const platform = (['meta', 'tiktok', 'google', 'youtube'] as const).includes(body.platform) ? body.platform : 'meta'
    const dailyBudget = Number(body.dailyBudget) || 0

    if (!productTitle || productTitle.length < 5) {
      return NextResponse.json({ error: 'Informe o título do produto (mín. 5 caracteres).' }, { status: 400 })
    }
    if (!Number.isFinite(productPrice) || productPrice < 1 || productPrice > 100000) {
      return NextResponse.json({ error: 'Preço inválido (R$1 a R$100.000).' }, { status: 400 })
    }

    const result = optimizeAd({
      productTitle, productPrice, productCategory,
      productDescription, platform, dailyBudget,
    })

    trackUsage(userId, 'adoptimizer')

    return NextResponse.json({ ok: true, result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro no AdOptimizer'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
