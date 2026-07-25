// ─────────────────────────────────────────────────────────────
// Cron API v0.0.1 — Tarefas agendadas automáticas
// Liberação de escrow, limpeza de tokens, expiração, etc
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { trySupabase, successResponse, errorResponse } from '@/lib/supabase/api-helper'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { secret, task } = body

  // Segurança: verificar secret
  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return errorResponse('Não autorizado', 401)
  }

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ message: 'Demo mode — no actions taken' })

  const results: Record<string, any> = {}

  switch (task) {
    case 'release_escrows': {
      // Liberar escrows expirados (7 dias)
      const { data: escrows } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('status', 'held')
        .lte('release_at', new Date().toISOString())

      let released = 0
      for (const escrow of escrows || []) {
        await supabase.from('escrow_transactions').update({
          status: 'released',
          released_at: new Date().toISOString(),
        }).eq('id', escrow.id)

        await supabase.from('wallet_transactions').insert({
          user_id: escrow.seller_id,
          type: 'escrow_release',
          amount: escrow.amount,
          description: `Liberação automática de escrow - Pedido ${escrow.order_id}`,
          reference_id: escrow.order_id,
          reference_type: 'order',
        })

        released++
      }

      results.releasedEscrows = released
      break
    }

    case 'expire_tokens': {
      // Expirar tokens de download vencidos
      const { data: tokens } = await supabase
        .from('download_tokens')
        .select('*')
        .eq('is_active', true)
        .lte('expires_at', new Date().toISOString())

      for (const token of tokens || []) {
        await supabase.from('download_tokens').update({ is_active: false }).eq('id', token.id)
      }

      results.expiredTokens = tokens?.length || 0
      break
    }

    case 'expire_pix': {
      // Marcar PIX pendentes como expirados
      const { data: pixPayments } = await supabase
        .from('pix_payments')
        .select('*')
        .eq('status', 'pending')
        .lte('expires_at', new Date().toISOString())

      for (const pix of pixPayments || []) {
        await supabase.from('pix_payments').update({ status: 'expired' }).eq('id', pix.id)
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', pix.order_id)
      }

      results.expiredPix = pixPayments?.length || 0
      break
    }

    case 'deactivate_boosts': {
      // Desativar boosts expirados
      const { data: boostedProducts } = await supabase
        .from('products')
        .select('id')
        .eq('has_boost', true)
        .lte('boost_expires_at', new Date().toISOString())

      for (const product of boostedProducts || []) {
        await supabase.from('products').update({
          has_boost: false,
          boost_expires_at: null,
        }).eq('id', product.id)
      }

      results.deactivatedBoosts = boostedProducts?.length || 0
      break
    }

    default:
      // Rodar todas as tarefas via fetch interno
      for (const t of ['release_escrows', 'expire_tokens', 'expire_pix', 'deactivate_boosts']) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          const resp = await fetch(baseUrl + '/api/v1/cron', {
            method: 'POST',
            body: JSON.stringify({ secret, task: t }),
            headers: { 'Content-Type': 'application/json' },
          })
          const data = await resp.json()
          if (data.data) results[t] = data.data
        } catch (e: any) {
          results[t] = 'error'
        }
      }
  }

  return successResponse({
    task,
    results,
    timestamp: new Date().toISOString(),
  })
}
