// v0.0.1 — Cotação server-side para carrinho multi-vendedor; não confia em preço do cliente.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, getSafeAdminClient } from '@/lib/auth/server'
import { quoteMultiVendorCheckout, type CheckoutItem } from '@/domain/checkout/MultiVendorCheckout'
import type { KiyvoSellerPlan } from '@/domain/fees/FeeEngine'

const schema = z.object({ items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(25) })).min(1).max(50) })
const plans = new Set<KiyvoSellerPlan>(['free', 'plus', 'pro', 'vendor_pro'])

export async function POST(request: NextRequest) {
  const { user, adminClient, error } = await requireAuth()
  if (error || !user) return NextResponse.json({ error: error || 'Faça login para continuar.' }, { status: 401 })
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Carrinho inválido.' }, { status: 400 })
    const admin = getSafeAdminClient(adminClient)
    const productIds = parsed.data.items.map((item) => item.productId)
    const { data: products, error: productsError } = await admin.from('products').select('id,base_price,price,vendor_id,status,vendors(id,plan,sales_count)').in('id', productIds)
    if (productsError || !products || products.length !== productIds.length) return NextResponse.json({ error: 'Um ou mais produtos não estão disponíveis.' }, { status: 409 })
    const productsById = new Map(products.map((product) => [String(product.id), product as Record<string, unknown>]))
    const items: CheckoutItem[] = parsed.data.items.map((line) => {
      const product = productsById.get(line.productId)
      if (!product || !['published', 'approved', 'active'].includes(String(product.status))) throw new Error('Produto indisponível.')
      const vendor = (product.vendors ?? {}) as Record<string, unknown>
      const plan = String(vendor.plan ?? 'free') as KiyvoSellerPlan
      if (!plans.has(plan)) throw new Error('Plano do vendedor inválido.')
      const price = Number(product.base_price ?? product.price)
      if (!Number.isFinite(price) || price <= 0) throw new Error('Preço de produto inválido.')
      return { productId: line.productId, sellerId: String(product.vendor_id ?? vendor.id), sellerPlan: plan, unitPrice: price, quantity: line.quantity }
    })
    const salesBySeller = Object.fromEntries(items.map((item) => {
      const product = productsById.get(item.productId) as Record<string, unknown>
      const vendor = (product.vendors ?? {}) as Record<string, unknown>
      return [item.sellerId, Number(vendor.sales_count ?? 0)]
    }))
    return NextResponse.json({ data: quoteMultiVendorCheckout(items, salesBySeller) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível calcular a cotação.' }, { status: 422 })
  }
}
