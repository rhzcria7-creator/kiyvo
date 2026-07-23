// POST /api/agents/bonusmaker
import { NextRequest, NextResponse } from 'next/server'
import { runGeradorBonus } from '@/lib/agents/v93-monetization'
import { getPlanForUser } from '@/lib/agents/plans'
import { getUsage, setUsage, trackUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    let userId = 'anon', userPlano = 'free'
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        userId = data.user.id
        const { data: p } = await supabase.from('profiles').select('plano,role').eq('id', userId).single()
        userPlano = (p as any)?.plano || 'free'
      }
    } catch {}
    const input = await request.json()
    const result = await runGeradorBonus(input, { userId, plan: getPlanForUser({ plano: userPlano as any }) } as any)
    if (userId !== 'anon') { try { const u = getUsage(userId); u.copiesHoje=(u.copiesHoje||0)+1; setUsage(userId,u); trackUsage(userId,'bonusmaker') } catch {} }
    return NextResponse.json(result)
  } catch (e: any) { return NextResponse.json({ok:false,error:e?.message||'Erro'},{status:500})}
}
