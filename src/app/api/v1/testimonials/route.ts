// ─────────────────────────────────────────────────────────────
// Testimonials API v0.0.1 — Depoimentos de usuários
// Aprovados, destacados, com fotos
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

const MOCK_TESTIMONIALS = [
  { id: '1', name: 'Ana Carolina', role: 'Vendedora', avatar: '', text: 'A melhor plataforma para vender cursos! Taxa zero nas primeiras 5 mil vendas é imbatível.', rating: 5, productCount: 12, memberSince: '2024' },
  { id: '2', name: 'Rafael Oliveira', role: 'Comprador', avatar: '', text: 'Comprei vários templates aqui. Entrega imediata e suporte excelente.', rating: 5, productCount: 23, memberSince: '2024' },
  { id: '3', name: 'Juliana Santos', role: 'Afiliada', avatar: '', text: 'As maiores comissões do mercado. 50% em alguns produtos é surreal!', rating: 5, productCount: 45, memberSince: '2024' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const featured = searchParams.get('featured') === 'true'

  const supabase = await trySupabase()
  if (!supabase) return successResponse(MOCK_TESTIMONIALS.slice(0, limit))

  let query = supabase.from('reviews').select('*, profiles(full_name, avatar_url)').not('comment', 'is', null).not('rating', 'is', null)
  if (featured) query = query.gte('rating', 4)
  query = query.order('created_at', { ascending: false }).limit(limit)

  const { data, error } = await query
  if (error) return errorResponse(error.message)

  const testimonials = (data || []).map((r: any) => ({
    id: r.id,
    name: r.profiles?.full_name || 'Usuário',
    role: r.is_verified ? 'Comprador Verificado' : 'Comprador',
    avatar: r.profiles?.avatar_url || '',
    text: r.comment,
    rating: r.rating,
    productId: r.product_id,
    createdAt: r.created_at,
  }))

  return successResponse(testimonials)
}
