// ─────────────────────────────────────────────────────────────
// Delivery Token API v0.0.1 — Valida e consome token de download
// Real com Supabase, verifica IP bound, rate limit
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimitMiddleware } from '@/lib/rate-limit/supabaseRateLimit'
import { DeliveryService } from '@/lib/delivery/DeliveryService'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const rateLimitResult = await rateLimitMiddleware(request, 'download')
  if (rateLimitResult) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
  }

  const { token } = params
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const buyerId = request.headers.get('x-user-id') || ''

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      // Buscar token no Supabase
      const { data: tokenData, error } = await supabase
        .from('download_tokens')
        .select('*')
        .eq('token', token)
        .single()

      if (error || !tokenData) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
      }

      // Verificar expiração
      if (new Date(tokenData.expires_at) < new Date()) {
        await supabase.from('download_tokens').update({ is_active: false }).eq('id', tokenData.id)
        return NextResponse.json({ error: 'Token expirado' }, { status: 410 })
      }

      // Verificar IP bound
      if (tokenData.ip_bound && tokenData.ip_bound !== ip) {
        return NextResponse.json({ error: 'Token vinculado a outro IP' }, { status: 403 })
      }

      // Verificar limite
      if (tokenData.downloads_used >= tokenData.max_downloads) {
        await supabase.from('download_tokens').update({ is_active: false }).eq('id', tokenData.id)
        return NextResponse.json({ error: 'Limite de downloads atingido' }, { status: 403 })
      }

      // Incrementar downloads
      await supabase.from('download_tokens').update({
        downloads_used: tokenData.downloads_used + 1,
        last_downloaded_at: new Date().toISOString(),
        is_active: tokenData.downloads_used + 1 < tokenData.max_downloads,
      }).eq('id', tokenData.id)

      // Buscar arquivo do produto
      const { data: product } = await supabase
        .from('products')
        .select('file_url, title')
        .eq('id', tokenData.product_id)
        .single()

      if (!product?.file_url) {
        return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
      }

      // Log de auditoria
      await supabase.from('audit_logs').insert({
        action: 'delivery.download',
        actor_id: tokenData.buyer_id,
        target: tokenData.id,
        target_type: 'download_token',
        description: `Download do produto ${tokenData.product_id}`,
        ip,
      })

      // Redirecionar para o arquivo
      return NextResponse.redirect(product.file_url)
    } catch (err) {
      console.error('Delivery error:', err)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  }

  // Fallback
  const deliveryService = new DeliveryService()
  const tokenData = deliveryService.getTokenById(token)
  if (!tokenData) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    productName: 'Demo Product',
    remainingDownloads: tokenData.maxDownloads - tokenData.downloadsUsed,
    expiresAt: tokenData.expiresAt,
  })
}
