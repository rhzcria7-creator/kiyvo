// ─────────────────────────────────────────────────────────────
// Collections API v0.0.1 — Coleções curadas de produtos
// Curadoria manual + automática por algoritmo
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET() {
  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({
      collections: [
        { id: '1', name: '🔥 Mais Vendidos', slug: 'mais-vendidos', productCount: 0 },
        { id: '2', name: '💎 Premium Selection', slug: 'premium', productCount: 0 },
        { id: '3', name: '🚀 Produtos em Alta', slug: 'em-alta', productCount: 0 },
      ],
    })
  }

  const collections = [
    {
      id: 'top_selling',
      name: '🔥 Mais Vendidos',
      slug: 'mais-vendidos',
      description: 'Os produtos mais populares do marketplace',
      icon: '🔥',
      query: { sort: 'sales', limit: 8 },
    },
    {
      id: 'premium',
      name: '💎 Premium Selection',
      slug: 'premium',
      description: 'Produtos selecionados com os melhores ratings',
      icon: '💎',
      query: { minRating: 4.5, sort: 'rating', limit: 8 },
    },
    {
      id: 'trending',
      name: '🚀 Em Alta',
      slug: 'em-alta',
      description: 'Produtos com boost e crescimento rápido',
      icon: '🚀',
      query: { hasBoost: true, sort: 'sales', limit: 8 },
    },
    {
      id: 'new_arrivals',
      name: '🆕 Novidades',
      slug: 'novidades',
      description: 'Os produtos mais recentes do marketplace',
      icon: '🆕',
      query: { sort: 'newest', limit: 8 },
    },
    {
      id: 'best_value',
      name: '💰 Melhor Custo-Benefício',
      slug: 'melhor-custo-beneficio',
      description: 'Produtos com maior relação qualidade/preço',
      icon: '💰',
      query: { sort: 'rating', maxPrice: 50, limit: 8 },
    },
    {
      id: 'tax_free',
      name: '🛡️ Tax Free',
      slug: 'tax-free',
      description: 'Produtos sem taxa de serviço adicional',
      icon: '🛡️',
      query: { taxFree: true, sort: 'sales', limit: 8 },
    },
  ]

  // Buscar contagem de produtos para cada coleção
  const collectionsWithCount = await Promise.all(
    collections.map(async (col) => {
      let query = supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)

      if (col.query.minRating) query = query.gte('rating', col.query.minRating)
      if (col.query.hasBoost) query = query.eq('has_boost', true)
      if (col.query.maxPrice) query = query.lte('price', col.query.maxPrice)
      if (col.query.taxFree) query = query.eq('is_tax_free', true)

      const { count } = await query
      return { ...col, productCount: count || 0 }
    })
  )

  return successResponse({ collections: collectionsWithCount })
}
