// POST /api/agents/copywriter
// Gera copy otimizada: títulos, bullets, descrição, CTAs, tags.
import { NextRequest, NextResponse } from 'next/server'
import { generateCopy } from '@/lib/agents/copywriter'
import { getPlanForUser, canUse, incrementUsage } from '@/lib/agents/plans'
import { getUsage, setUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'
import type { CopyRequest } from '@/lib/agents/types'

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
    if (!canUse(plano, usage, 'copiesPorDia')) {
      return NextResponse.json(
        { error: 'Limite diário de copies atingido.', limite: plano.limites.copiesPorDia, plano: plano.nome, upgrade: true },
        { status: 429 },
      )
    }

    const body = (await request.json().catch(() => ({}))) as Partial<CopyRequest> & { variante?: number }
    if (!body.produto || body.produto.trim().length < 2) {
      return NextResponse.json({ error: 'Informe o nome do produto.' }, { status: 400 })
    }

    const req: CopyRequest = {
      produto: String(body.produto).slice(0, 80),
      categoria: body.categoria,
      publico: body.publico || 'geral',
      tom: body.tom || 'confiavel',
      beneficios: Array.isArray(body.beneficios) ? body.beneficios.slice(0, 6).map(String) : undefined,
      preco: typeof body.preco === 'number' ? body.preco : undefined,
    }

    const result = generateCopy(req, Number(body.variante || 0))
    setUsage(userId, incrementUsage(usage, 'copiesPorDia'))

    return NextResponse.json({ result, plano: plano.nome, restantes: plano.limites.copiesPorDia - usage.copiesHoje - 1 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar copy.' }, { status: 500 })
  }
}
