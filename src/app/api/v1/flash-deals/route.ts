// ─────────────────────────────────────────────────────────────
// Flash Deals API v0.0.1 — Ofertas relâmpago com timer
// Produtos com desconto por tempo limitado
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET() {
  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({
      deals: [],
      nextDealAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    })
  }

  const now = new Date().toISOString()

  const { data: deals } = await supabase
    .from('flash_deals')
    .select('*, products!inner(title, slug, thumbnail, rating, total_sales)')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('starts_at', { ascending: false })
    .limit(10)

  // Próximo deal
  const { data: nextDeal } = await supabase
    .from('flash_deals')
    .select('starts_at')
    .eq('is_active', true)
    .gt('starts_at', now)
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return successResponse({
    deals: (deals || []).map((d: any) => ({
      id: d.id,
      productId: d.product_id,
      title: d.products?.title,
      slug: d.products?.slug,
      thumbnail: d.products?.thumbnail,
      originalPrice: d.original_price,
      dealPrice: d.deal_price,
      discountPercent: Math.round((1 - d.deal_price / d.original_price) * 100),
      rating: d.products?.rating,
      sales: d.products?.total_sales,
      endsAt: d.ends_at,
      soldCount: d.sold_count,
      maxQuantity: d.max_quantity,
      remaining: d.max_quantity - d.sold_count,
    })),
    nextDealAt: nextDeal?.starts_at || null,
  })
}
