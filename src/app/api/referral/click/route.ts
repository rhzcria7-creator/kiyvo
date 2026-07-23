export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// POST /api/referral/click  -> registra clique no link de indicação
// Body: { code }  (chamado pela página /r/[code])
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const code = typeof body.code === 'string' ? body.code.toUpperCase().trim() : ''
    if (!code) return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 })

    const supabase = createClient()

    // Garante affiliate row e incrementa clique
    const { data: aff } = await supabase
      .from('affiliates')
      .select('id, user_id, total_clicks')
      .eq('referral_code', code)
      .maybeSingle()

    if (aff) {
      await supabase.from('affiliates').update({ total_clicks: (Number(aff.total_clicks) || 0) + 1 }).eq('id', aff.id)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
