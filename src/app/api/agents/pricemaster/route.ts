// POST /api/agents/pricemaster
import { NextRequest, NextResponse } from 'next/server'
import { suggestPrice } from '@/lib/agents/pricemaster'
import { getPlanForUser, canUse, incrementUsage } from '@/lib/agents/plans'
import { getUsage, setUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let userId = 'anon'
    let userPlano = 'free'
    let userRole = ''
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        userId = data.user.id
        const { data: profile } = await supabase.from('profiles').select('plano, role').eq('id', userId).single()
        userPlano = (profile as { plano?: string } | null)?.plano || 'free'
        userRole = (profile as { role?: string } | null)?.role || ''
      }
    } catch {}

    const plano = getPlanForUser({ plano: userPlano as 'free', role: userRole })
    const usage = getUsage(userId)
    if (!canUse(plano, usage, 'pricingPorDia')) {
      return NextResponse.json(
        { error: 'Limite diário atingido.', upgrade: true },
        { status: 429 },
      )
    }

    const body = (await request.json().catch(() => ({}))) as {
      produto?: string; categoria?: string; custoFornecedor?: number; concorrentes?: number[]
    }
    if (!body.categoria) return NextResponse.json({ error: 'Informe a categoria.' }, { status: 400 })

    const result = suggestPrice({
      produto: body.produto || 'Produto digital',
      categoria: body.categoria,
      custoFornecedor: body.custoFornecedor,
      concorrentes: Array.isArray(body.concorrentes) ? body.concorrentes.filter((n) => typeof n === 'number') : undefined,
    })
    setUsage(userId, incrementUsage(usage, 'pricingPorDia'))

    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({ error: 'Erro no PriceMaster.' }, { status: 500 })
  }
}
