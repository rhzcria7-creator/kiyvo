import { NextRequest } from 'next/server'
import { successResponse, trySupabase } from '@/lib/supabase/api-helper'
import { crossSellEngine } from '@/domain/crossell/CrossSellEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  const category = searchParams.get('category')
  const supabase = await trySupabase()

  let alsoBought: string[] = []
  let complementary: string[] = []

  if (supabase && productId) {
    const { data: orders } = await supabase.from('order_items').select('order_id, product_id')
    const orderGroups = new Map<string, string[]>()
    ;(orders || []).forEach((oi: any) => {
      const arr = orderGroups.get(oi.order_id) || []
      arr.push(oi.product_id)
      orderGroups.set(oi.order_id, arr)
    })
    const allOrders = Array.from(orderGroups.values()).map(items => ({ items }))
    alsoBought = crossSellEngine.suggestAlsoBought(productId, allOrders)
  }

  if (category) {
    complementary = crossSellEngine.suggestComplementary(category)
  }

  if (supabase && alsoBought.length > 0) {
    const { data: products } = await supabase.from('products').select('id, title, slug, price, thumbnail, category').in('id', alsoBought)
    return successResponse({
      alsoBought: products || [],
      complementary: [],
    })
  }

  if (supabase && complementary.length > 0) {
    const { data: products } = await supabase.from('products').select('id, title, slug, price, thumbnail, category').in('category', complementary).limit(4)
    return successResponse({
      alsoBought: [],
      complementary: products || [],
    })
  }

  return successResponse({ alsoBought: [], complementary: [] })
}
