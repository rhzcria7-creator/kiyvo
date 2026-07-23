export const runtime = 'nodejs'
// ─────────────────────────────────────────────────────────────
// GET /api/freelance/bids?job_id=xxx  -> lista bids de um job
// POST /api/freelance/bids           -> cria bid (freelancer)
// Autenticado: apenas quem estiver logado pode dar bid.
// Rate limit simples por IP para evitar spam.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'

function unauth() {
  return NextResponse.json({ error: 'Entre para enviar proposta' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('job_id')
    if (!jobId) return NextResponse.json({ error: 'job_id obrigatório' }, { status: 400 })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('freelance_bids')
      .select('*, profiles(id,nome,username,avatar_url,badges,kd_points)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bids: data || [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 8, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas propostas. Aguarde 1 min.' }, { status: 429 })

    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return unauth()

    const body = await req.json().catch(() => ({}))
    const jobId = typeof body.job_id === 'string' ? body.job_id.trim() : ''
    const price = Number(body.price)
    const days = Number(body.days)
    const message = typeof body.message === 'string' ? sanitizeInput(body.message).slice(0, 500) : ''

    if (!jobId) return NextResponse.json({ error: 'Job inválido' }, { status: 400 })
    if (!Number.isFinite(price) || price <= 0 || price > 100000)
      return NextResponse.json({ error: 'Preço inválido (máx R$ 100.000)' }, { status: 400 })
    if (!Number.isFinite(days) || days < 1 || days > 365)
      return NextResponse.json({ error: 'Prazo inválido (1 a 365 dias)' }, { status: 400 })

    // Job existe e está open?
    const { data: job } = await supabase
      .from('freelance_jobs')
      .select('id, client_id, status, title')
      .eq('id', jobId)
      .single()
    if (!job) return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 })
    if (job.status !== 'open') return NextResponse.json({ error: 'Job fechado' }, { status: 400 })
    if (job.client_id === user.id) return NextResponse.json({ error: 'Você não pode dar bid no seu próprio job' }, { status: 400 })

    // Bid duplicado?
    const { data: existing } = await supabase
      .from('freelance_bids')
      .select('id')
      .eq('job_id', jobId)
      .eq('freelancer_id', user.id)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'Você já enviou proposta para este job' }, { status: 409 })

    const { data: bid, error } = await supabase
      .from('freelance_bids')
      .insert({
        job_id: jobId,
        freelancer_id: user.id,
        price: Math.round(price * 100) / 100,
        days: Math.floor(days),
        message,
        status: 'pending',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notifica o cliente (nao quebra se a tabela nao tiver colunas exatas)
    supabase.from('notifications').insert({
      user_id: job.client_id,
      type: 'freelance_bid',
      title: 'Nova proposta 📨',
      message: `Alguém enviou proposta de R$ ${price.toFixed(2)} em "${job.title.slice(0,40)}"`,
      link: `/freelance/jobs/${jobId}`,
    }).then(() => null, () => null)

    return NextResponse.json({ ok: true, bid })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao enviar proposta'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
