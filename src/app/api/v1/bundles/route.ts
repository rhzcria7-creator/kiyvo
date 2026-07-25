import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { bundleEngine } from '@/domain/bundle/BundleEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sellerId = searchParams.get('sellerId')
  const supabase = await trySupabase()
  if (!supabase) return successResponse({ bundles: [] })
  let query = supabase.from('bundles').select('*, products(*)')
  if (sellerId) query = query.eq('seller_id', sellerId)
  const { data } = await query.order('created_at', { ascending: false }).limit(20)
  return successResponse({ bundles: data || [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, description, productIds, sellerId } = body
  if (!name || !productIds || !sellerId) return errorResponse('name, productIds e sellerId obrigatórios')
  const supabase = await trySupabase()
  if (productIds.length < 2) return errorResponse('Mínimo 2 produtos para bundle')
  if (supabase) {
    const { data: products } = await supabase.from('products').select('id, title, price, thumbnail').in('id', productIds)
    if (!products || products.length < 2) return errorResponse('Produtos não encontrados')
    const bundleProducts = products.map((p: any) => ({ productId: p.id, title: p.title, price: Number(p.price), thumbnail: p.thumbnail || '', sellerId }))
    const bundle = bundleEngine.create({ name, description, products: bundleProducts, sellerId })
    const { data: saved, error } = await supabase.from('bundles').insert({ name, description, slug: bundle.slug, seller_id: sellerId, products: bundleProducts, original_total: bundle.originalTotal, bundle_price: bundle.bundlePrice, discount_percent: bundle.discountPercent }).select().single()
    if (error) return errorResponse(error.message)
    return successResponse(saved)
  }
  return successResponse(bundleEngine.create({ name, description, products: productIds.map((id: string) => ({ productId: id, title: 'Product', price: 0, thumbnail: '', sellerId })), sellerId }))
}
