// ─────────────────────────────────────────────────────────────
// GET /api/users/me — Retorna o usuário atual + perfil
// Usado pelo checkout, header, etc.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 120, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 })

    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        email_confirmed: !!user.email_confirmed_at,
      },
      profile: profile || null,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
