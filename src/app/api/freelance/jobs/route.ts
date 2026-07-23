// GET /api/freelance/jobs         → lista jobs
// POST /api/freelance/jobs        → cria job (usuário autenticado)
import { NextRequest, NextResponse } from 'next/server'
import { getJobs, createJob } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'
import type { FreelanceCategory } from '@/lib/agents/types'

export const runtime = 'nodejs'

const CATEGORIAS_VALIDAS: FreelanceCategory[] = ['design', 'copywriting', 'desenvolvimento', 'video', 'marketing', 'traducao', 'audio', 'suporte', 'outro']

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const cat = url.searchParams.get('categoria')
  const busca = url.searchParams.get('q')?.toLowerCase() || ''
  let jobs = getJobs(true)
  if (cat && cat !== 'todas') jobs = jobs.filter((j) => j.categoria === cat)
  if (busca) jobs = jobs.filter((j) => (j.titulo + j.descricao + j.habilidades.join(' ')).toLowerCase().includes(busca))
  return NextResponse.json({ jobs })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return NextResponse.json({ error: 'Faça login para publicar um job.' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('nome, username, plano').eq('id', data.user.id).single()
    const body = (await request.json().catch(() => ({}))) as {
      titulo?: string; categoria?: string; descricao?: string; orcamentoMin?: number; orcamentoMax?: number; prazoDias?: number; urgente?: boolean; habilidades?: string[]
    }
    if (!body.titulo || body.titulo.length < 8) return NextResponse.json({ error: 'Título precisa ter ao menos 8 caracteres.' }, { status: 400 })
    if (!CATEGORIAS_VALIDAS.includes(body.categoria as FreelanceCategory)) return NextResponse.json({ error: 'Categoria inválida.' }, { status: 400 })
    if (!body.descricao || body.descricao.length < 30) return NextResponse.json({ error: 'Descrição precisa ter ao menos 30 caracteres.' }, { status: 400 })
    const orcMin = Number(body.orcamentoMin), orcMax = Number(body.orcamentoMax)
    if (isNaN(orcMin) || isNaN(orcMax) || orcMin < 20 || orcMax < orcMin) return NextResponse.json({ error: 'Orçamento inválido. Mínimo R$20.' }, { status: 400 })

    const nome = String((profile as { nome?: string; username?: string } | null)?.nome || (profile as { username?: string } | null)?.username || 'Usuário KIYVO')

    const job = createJob({
      titulo: String(body.titulo).slice(0, 120),
      categoria: body.categoria as FreelanceCategory,
      descricao: String(body.descricao).slice(0, 3000),
      orcamentoMin: orcMin,
      orcamentoMax: orcMax,
      prazoDias: Math.max(1, Math.min(90, Number(body.prazoDias) || 7)),
      contratanteId: data.user.id,
      contratanteNome: nome,
      urgente: !!body.urgente,
      habilidades: Array.isArray(body.habilidades) ? body.habilidades.slice(0, 10).map((h) => String(h).slice(0, 30)) : [],
    })
    return NextResponse.json({ job })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar job.' }, { status: 500 })
  }
}
