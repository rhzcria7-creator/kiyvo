// POST /api/agents/nomesdominio
import { NextRequest, NextResponse } from 'next/server'
import { runNomesDominio } from '@/lib/agents/nomesdominio'
import { getPlanForUser } from '@/lib/agents/plans'
import { getUsage, setUsage, trackUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let userId = 'anon'
    let userPlano = 'free'
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        userId = data.user.id
        const { data: profile } = await supabase
          .from('profiles').select('plano,role').eq('id', userId).single()
        userPlano = (profile as any)?.plano || 'free'
      }
    } catch { /* anon ok */ }

    const input = await request.json()
    const plan = getPlanForUser({ plano: userPlano as any })
    const result = await runNomesDominio(input, { userId, plan } as any)

    if (userId !== 'anon') {
      try {
        const u = getUsage(userId)
        u.copiesHoje = (u.copiesHoje || 0) + 1
        setUsage(userId, u)
        trackUsage(userId, 'nomesdominio')
      } catch { /* ignore */ }
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro interno' }, { status: 500 })
  }
}
