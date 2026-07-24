export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// GET /api/referral/stats -> dados de indicação do usuário logado
// Gera referral_code automaticamente se não existir.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function randCode(len = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Garante referral_code
    let { data: profile } = await supabase
      .from('profiles')
      .select('id, nome, referral_code, kd_points, referred_by')
      .eq('id', user.id)
      .single()

    let code = profile?.referral_code
    if (!code) {
      // gera único
      for (let attempt = 0; attempt < 5; attempt++) {
        const c = randCode()
        const { data: exists } = await supabase.from('affiliates').select('id').eq('referral_code', c).maybeSingle()
        const { data: existsP } = await supabase.from('profiles').select('id').eq('referral_code', c).maybeSingle()
        if (!exists && !existsP) { code = c; break }
      }
      if (!code) code = randCode(12)
      await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
    }

    // Estatísticas (conta via affiliates, fallback 0)
    let clicks = 0, signups = 0, conversions = 0, earnings = 0
    const { data: aff } = await supabase
      .from('affiliates')
      .select('total_clicks,total_signups,total_conversions,available_earnings,pending_earnings')
      .eq('user_id', user.id)
      .maybeSingle()

    if (aff) {
      clicks = Number(aff.total_clicks) || 0
      signups = Number(aff.total_signups) || 0
      conversions = Number(aff.total_conversions) || 0
      earnings = Number(aff.available_earnings) || 0
    }

    return NextResponse.json({
      referral_code: code,
      referral_link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'}/r/${code}`,
      kd_points: Number(profile?.kd_points) || 0,
      clicks, signups, conversions,
      commission_pct: 8,
      first_buy_bonus_brl: 5,
      friend_discount_pct: 5,
      available_earnings: earnings,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao carregar indicações'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
