// GET /api/freelance/jobs — usa storage local (jobs demo realistas)
// POST /api/freelance/jobs — cria job com validações de segurança
import { NextRequest, NextResponse } from 'next/server'
import { getJobs, createJob } from '@/lib/agents/storage'
import { rateLimit, sanitizeInput } from '@/lib/security'
import type { FreelanceCategory } from '@/lib/agents/types'

export const runtime = 'nodejs'

const CATEGORIAS_VALIDAS: FreelanceCategory[] = ['design', 'copywriting', 'desenvolvimento', 'video', 'marketing', 'traducao', 'audio', 'suporte', 'outro']

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const cat = url.searchParams.get('categoria') || 'todas'
  const busca = (url.searchParams.get('q') || '').toLowerCase().trim()

  // Busca jobs do storage local (que já tem os demo + criados)
  let jobs = getJobs(true)

  // Filtrar categoria
  if (cat && cat !== 'todas') {
    jobs = jobs.filter(j => j.categoria === cat)
  }
  if (busca) {
    jobs = jobs.filter(j =>
      j.titulo.toLowerCase().includes(busca) ||
      j.descricao.toLowerCase().includes(busca) ||
      j.habilidades.some(h => h.toLowerCase().includes(busca))
    )
  }

  return NextResponse.json({ jobs })
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 5, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Muitos jobs criados. Aguarde 1 minuto.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const titulo = typeof body.titulo === 'string' ? sanitizeInput(body.titulo).slice(0, 120) : ''
    const categoria = typeof body.categoria === 'string' ? body.categoria : 'outro'
    const descricao = typeof body.descricao === 'string' ? sanitizeInput(body.descricao).slice(0, 3000) : ''
    const orcamentoMin = Number(body.orcamentoMin)
    const orcamentoMax = Number(body.orcamentoMax)
    const prazoDias = Number(body.prazoDias)
    const urgente = Boolean(body.urgente)
    const habilidades = Array.isArray(body.habilidades) ? body.habilidades.slice(0, 10).map((h: unknown) => sanitizeInput(String(h)).slice(0, 30)) : []

    // Validações
    if (titulo.length < 8) return NextResponse.json({ error: 'Título precisa ter ao menos 8 caracteres.' }, { status: 400 })
    if (!CATEGORIAS_VALIDAS.includes(categoria as FreelanceCategory)) return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 })
    if (descricao.length < 30) return NextResponse.json({ error: 'Descrição precisa ter ao menos 30 caracteres.' }, { status: 400 })

    // Limites de orçamento anti-fraude (não deixa preço absurdo)
    if (!Number.isFinite(orcamentoMin) || orcamentoMin < 30)
      return NextResponse.json({ error: 'Orçamento mínimo deve ser de pelo menos R$ 30.' }, { status: 400 })
    if (!Number.isFinite(orcamentoMax) || orcamentoMax < orcamentoMin)
      return NextResponse.json({ error: 'Orçamento máximo deve ser maior ou igual ao mínimo.' }, { status: 400 })
    if (orcamentoMax > 50000)
      return NextResponse.json({ error: 'Orçamento máximo de R$ 50.000 por job. Para projetos maiores, divida em etapas.' }, { status: 400 })
    if (orcamentoMax < orcamentoMin * 0.8)
      return NextResponse.json({ error: 'Orçamento máximo não pode ser menor que o mínimo.' }, { status: 400 })

    if (!Number.isFinite(prazoDias) || prazoDias < 1 || prazoDias > 90)
      return NextResponse.json({ error: 'Prazo deve ser entre 1 e 90 dias.' }, { status: 400 })

    // Tentar identificar usuário logado (Supabase); senão usa IP como identificador
    let contratanteId = `anon_${ip.replace(/\./g, '_')}`
    let contratanteNome = 'Visitante'
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        contratanteId = user.id
        const { data: profile } = await supabase.from('profiles').select('nome, username').eq('id', user.id).maybeSingle()
        contratanteNome = (profile as any)?.nome || (profile as any)?.username || user.email?.split('@')[0] || 'Cliente'
      }
    } catch { /* usa anon */ }

    const job = createJob({
      titulo,
      categoria: categoria as FreelanceCategory,
      descricao,
      orcamentoMin,
      orcamentoMax,
      prazoDias,
      contratanteId,
      contratanteNome,
      urgente,
      habilidades,
    })

    return NextResponse.json({ ok: true, job })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar job.' }, { status: 500 })
  }
}
