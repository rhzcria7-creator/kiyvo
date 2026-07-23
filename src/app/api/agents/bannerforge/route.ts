// POST /api/agents/bannerforge
// Gera banner/logo em SVG (e futuramente PNG via resvg).
// Body: { titulo, subtitulo?, categoria?, estilo?, largura?, altura?, variante?, format? }
import { NextRequest, NextResponse } from 'next/server'
import { generateBannerSvg } from '@/lib/agents/bannerforge'
import { getPlanForUser, canUse, incrementUsage } from '@/lib/agents/plans'
import { getUsage, setUsage } from '@/lib/agents/storage'
import { createClient } from '@/lib/supabase/server'
import type { BannerRequest } from '@/lib/agents/types'

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('plano, role')
          .eq('id', userId)
          .single()
        userPlano = (profile as { plano?: string } | null)?.plano || 'free'
        userRole = (profile as { role?: string } | null)?.role || ''
      }
    } catch {
      // sem auth = free anonimo
    }

    const plano = getPlanForUser({ plano: userPlano as 'free', role: userRole })
    const usage = getUsage(userId)
    if (!canUse(plano, usage, 'bannersPorDia')) {
      return NextResponse.json(
        { error: 'Limite diario de banners atingido.', limite: plano.limites.bannersPorDia, upgrade: true },
        { status: 429 },
      )
    }

    const body = (await request.json().catch(() => ({}))) as Partial<BannerRequest> & { variante?: number; download?: boolean; format?: 'svg' | 'png' }
    if (!body.titulo || body.titulo.trim().length < 2) {
      return NextResponse.json({ error: 'Informe um titulo.' }, { status: 400 })
    }

    const req: BannerRequest = {
      titulo: String(body.titulo).slice(0, 80),
      subtitulo: body.subtitulo ? String(body.subtitulo).slice(0, 120) : undefined,
      categoria: body.categoria,
      cores: body.cores,
      estilo: body.estilo || 'hero',
      largura: body.largura,
      altura: body.altura,
    }

    const { svg, width, height, paleta } = generateBannerSvg(req, Number(body.variante || 0))
    setUsage(userId, incrementUsage(usage, 'bannersPorDia'))

    // PNG: gerado no client via canvg/SVG→canvas (pra evitar problema com módulo nativo no webpack)
    // Por enquanto retorna SVG que os navegadores renderizam perfeitamente.
    const filename = `banner-${Date.now()}.svg`
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': body.download ? `attachment; filename="${filename}"` : 'inline',
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
        'X-Banner-Width': String(width),
        'X-Banner-Height': String(height),
        'X-Banner-Format': 'svg',
        'X-Banner-Palette': `${paleta.primaria}|${paleta.secundaria}|${paleta.fundo}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao gerar banner.', detalhe: error instanceof Error ? error.message : 'desconhecido' },
      { status: 500 },
    )
  }
}
