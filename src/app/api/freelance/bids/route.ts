// POST /api/freelance/bids (fallback para storage local)
// Supabase é tentado primeiro; se falhar (falta de tabela), usa storage local
// com validações de preço RIGOROSAS anti-fraude (não deixa R$1 nem R$1M)
import { NextRequest, NextResponse } from 'next/server'
import { getJob, addBid, getBids, getJobs } from '@/lib/agents/storage'
import { rateLimit, sanitizeInput } from '@/lib/security'

export const runtime = 'nodejs'

// Limites de preço por categoria (R$) — evita spam de R$1 ou lances absurdos
const PRICE_LIMITS: Record<string, { min: number; max: number }> = {
  design: { min: 50, max: 10000 },
  copywriting: { min: 80, max: 15000 },
  desenvolvimento: { min: 300, max: 50000 },
  video: { min: 100, max: 20000 },
  marketing: { min: 150, max: 30000 },
  traducao: { min: 80, max: 5000 },
  audio: { min: 80, max: 8000 },
  suporte: { min: 200, max: 10000 },
  outro: { min: 30, max: 100000 },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('job_id')
  if (!jobId) return NextResponse.json({ error: 'job_id obrigatório' }, { status: 400 })
  return NextResponse.json({ bids: getBids(jobId) })
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 8, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas propostas. Aguarde 1 minuto.' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const jobId = typeof body.job_id === 'string' ? body.job_id.trim() : ''
    const price = Number(body.price)
    const days = Number(body.days)
    const message = typeof body.message === 'string' ? sanitizeInput(body.message).slice(0, 500) : ''

    if (!jobId) return NextResponse.json({ error: 'Job inválido.' }, { status: 400 })

    // Validações RIGOROSAS de preço
    if (!Number.isFinite(price) || isNaN(price))
      return NextResponse.json({ error: 'Preço inválido — informe um número.' }, { status: 400 })

    // Carrega job (pode estar no storage local)
    const job = getJob(jobId) || getJobs().find(j => j.id === jobId)
    if (!job) {
      // Tenta listar todos para ver
      return NextResponse.json({ error: 'Job não encontrado.' }, { status: 404 })
    }

    // Limites por categoria
    const limites = PRICE_LIMITS[job.categoria] || PRICE_LIMITS.outro

    // Validação contra o orçamento do job e limites gerais
    if (price < limites.min) {
      return NextResponse.json({
        error: `Valor muito baixo! Para ${job.categoria}, o mínimo aceito é R$ ${limites.min.toFixed(2).replace('.', ',')}. Valores abaixo disso são suspeitos ou injustos.`
      }, { status: 400 })
    }
    if (price > limites.max) {
      return NextResponse.json({
        error: `Valor muito alto! Para ${job.categoria}, o máximo aceito é R$ ${limites.max.toFixed(2).replace('.', ',')}.`
      }, { status: 400 })
    }
    // Se o job tem orçamento máximo, o lance não pode passar 2x (anti-spam)
    if (price > job.orcamentoMax * 2) {
      return NextResponse.json({
        error: `Seu lance (R$ ${price.toFixed(2)}) está mais do que o dobro do orçamento máximo do job (R$ ${job.orcamentoMax.toFixed(2)}).`
      }, { status: 400 })
    }
    // Lance não pode ser menor que 50% do mínimo (anti-leilão baixo)
    if (price < job.orcamentoMin * 0.5) {
      return NextResponse.json({
        error: `Lance muito baixo comparado ao orçamento mínimo (R$ ${job.orcamentoMin.toFixed(2)}). Pelo menos metade do mínimo é recomendado.`
      }, { status: 400 })
    }

    if (!Number.isFinite(days) || days < 1 || days > 365)
      return NextResponse.json({ error: 'Prazo deve ser entre 1 e 365 dias.' }, { status: 400 })

    if (message.length < 15)
      return NextResponse.json({ error: 'Escreva uma mensagem de apresentação com ao menos 15 caracteres (mostre profissionalismo).' }, { status: 400 })

    // Tenta usar Supabase primeiro; se falhar, cai no storage local
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Usuário autenticado — tentar salvar no Supabase
        const { data: existing } = await supabase
          .from('freelance_bids').select('id').eq('job_id', jobId).eq('freelancer_id', user.id).maybeSingle()
        if (existing) return NextResponse.json({ error: 'Você já enviou proposta para este job.' }, { status: 409 })

        const { data: bid, error } = await supabase.from('freelance_bids').insert({
          job_id: jobId,
          freelancer_id: user.id,
          price: Math.round(price * 100) / 100,
          days: Math.floor(days),
          message,
          status: 'pending',
        }).select().single()
        if (!error) return NextResponse.json({ ok: true, bid, source: 'supabase' })
        // Se falhar, cai para storage local
      }
    } catch {
      /* cai no storage local */
    }

    // Fallback: storage local (funciona sem Supabase logado)
    const freelancerId = `anon_${ip.replace(/\./g, '_')}`
    const bidsExistentes = getBids(jobId)
    if (bidsExistentes.some(b => b.freelancerId === freelancerId)) {
      return NextResponse.json({ error: 'Você já enviou proposta para este job.' }, { status: 409 })
    }

    const bid = addBid({
      jobId,
      freelancerId,
      freelancerNome: 'Freelancer',
      valor: Math.round(price * 100) / 100,
      prazoDias: Math.floor(days),
      mensagem: message,
    })

    return NextResponse.json({ ok: true, bid, source: 'local' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao enviar proposta'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
