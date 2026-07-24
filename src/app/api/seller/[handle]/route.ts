export const runtime = 'nodejs'
// GET /api/seller/[handle] — dados públicos da loja (vendedor real do LocalDB
// ou loja de catálogo). Retorna perfil + produtos no formato do ProductCard.
import { NextRequest, NextResponse } from 'next/server'
import { getSellerByHandle, getSellerProducts } from '@/lib/localdb'
import { STORES } from '@/lib/catalog/stores'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'

const ALL: Array<Record<string, unknown>> = [
  ...(DEMO_PRODUCTS as unknown as Array<Record<string, unknown>>).map((p) => ({ ...p, store_id: p.vendor_id })),
  ...(GG_PRODUCTS as unknown as Array<Record<string, unknown>>).map((p) => ({ ...p, store_id: p.vendor_id })),
  ...(MEGA_PRODUCTS as unknown as Array<Record<string, unknown>>),
]

function mapCatalogProduct(p: Record<string, unknown>) {
  return {
    id: p.id,
    slug: (p.slug as string) || (p.id as string),
    titulo: (p.titulo as string) || (p.title as string) || 'Produto',
    preco: Number(p.preco ?? p.price ?? 0),
    preco_de: (p.preco_de as number) ?? (p.original_price as number) ?? null,
    descricao_curta: (p.descricao_curta as string) ?? (p.short_description as string) ?? '',
    categoria: (p.categoria as string) ?? (p.category as string) ?? 'outro',
    vendedor_nome: (p.vendedor_nome as string) ?? (p.vendor_name as string) ?? '',
    vendor_id: p.vendor_id,
    imagem_capa: (p.imagem_capa as string) ?? (p.image as string) ?? (p.cover as string) ?? null,
    emoji: (p.emoji as string) ?? '✨',
    rating: Number(p.rating ?? 4.7),
    total_reviews: Number(p.total_reviews ?? p.reviews ?? 0),
    total_vendas: Number(p.total_vendas ?? p.sales ?? 0),
    verificado: Boolean(p.verificado ?? p.verified),
    gradient: (p.gradient as string) ?? 'from-brand-500 to-brand-700',
  }
}

export async function GET(request: NextRequest, { params }: { params: { handle: string } }) {
  const { handle } = params
  const clean = (handle || '').replace(/^@/, '').toLowerCase().trim()

  // 1) Vendedor real (LocalDB)
  const user = getSellerByHandle(clean)
  if (user) {
    const products = getSellerProducts(user.id).map((p) => ({
      id: p.id,
      slug: p.id,
      titulo: p.title,
      preco: p.price,
      preco_de: p.original_price ?? null,
      descricao_curta: p.description,
      categoria: p.category,
      vendedor_nome: user.username,
      vendor_id: user.id,
      vendor_handle: user.username,
      imagem_capa: p.image || null,
      rating: p.rating,
      total_reviews: p.reviews,
      total_vendas: p.sales,
      verificado: user.verification_status === 'verified',
      gradient: 'from-brand-500 to-brand-700',
    }))
    return NextResponse.json({
      found: true,
      source: 'user',
      seller: {
        handle: user.username,
        name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        bio: user.bio,
        tags: user.tags,
        plan: user.seller_plan,
        rating: user.rating,
        total_sales: user.total_sales,
        total_purchases: user.total_purchases,
        is_verified: user.verification_status === 'verified',
        joined: user.created_at,
        followers: 0,
      },
      products,
    })
  }

  // 2) Loja de catálogo (STORES)
  const store = STORES.find((s) => s.handle.replace('@', '').toLowerCase() === clean)
  if (store) {
    const products = ALL.filter(
      (p) => p.store_id === store.id || p.vendedor_nome === store.name || p.vendor_id === store.id,
    ).map((p) => ({ ...mapCatalogProduct(p), vendor_handle: store.handle.replace('@', '') }))
    return NextResponse.json({
      found: true,
      source: 'store',
      seller: {
        handle: store.handle.replace('@', ''),
        name: store.name,
        username: store.handle,
        avatar_url: null,
        banner_url: null,
        bio: store.bio,
        tags: [store.category],
        plan: store.plan,
        rating: store.rating,
        total_sales: store.sales,
        total_purchases: 0,
        is_verified: store.verified,
        joined: store.since,
        followers: store.followers,
        logo: store.logo,
        color: store.color,
        city: store.city,
      },
      products,
    })
  }

  return NextResponse.json({ found: false }, { status: 404 })
}
