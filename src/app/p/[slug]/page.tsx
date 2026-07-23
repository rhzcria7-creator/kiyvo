// /p/[slug] — Server Component para Página de Produto
// Tenta Supabase; se falhar/não encontrar, cai para DEMO_PRODUCTS para não deixar a página vazia.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductPageClient } from '@/components/product/ProductPageClient'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'

// Todos os produtos para busca (fallback sem Supabase)
const ALL_DEMO = [...DEMO_PRODUCTS, ...GG_PRODUCTS]

interface PageProps {
  params: Promise<{ slug: string }>
}

function normalizeProduct(raw: Record<string, unknown>): Record<string, unknown> {
  // Normaliza nomes de campos (title→titulo, base_price→preco, etc.)
  const p = { ...raw }
  if (!p.titulo && p.title) p.titulo = p.title
  if (!p.descricao_curta && p.short_description) p.descricao_curta = p.short_description
  if (!p.descricao && p.description) p.descricao = p.description
  if (p.preco === undefined && p.base_price !== undefined) p.preco = p.base_price
  if (p.preco_de === undefined && p.original_price !== undefined) p.preco_de = p.original_price
  if (!p.categoria && p.category) p.categoria = p.category
  if (!p.vendedor_nome && p.vendor) {
    const v = (p.vendor as Record<string, unknown>) || {}
    p.vendedor_nome = v.store_name || v.nome || 'Vendedor'
  }
  if (p.rating === undefined && p.average_rating !== undefined) p.rating = p.average_rating
  if (!p.total_reviews && p.review_count) p.total_reviews = p.review_count
  if (!p.total_vendas && p.sales_count) p.total_vendas = p.sales_count
  if (p.boost === undefined && p.is_featured !== undefined) p.boost = p.is_featured
  return p
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // Primeiro tentar demo
  const demo = ALL_DEMO.find(d => d.slug === slug || d.id === slug)
  if (demo) {
    return {
      title: `${demo.titulo} — KIYVO`,
      description: (demo as any).descricao_curta,
      openGraph: {
        title: `${demo.titulo} — KIYVO`,
        description: (demo as any).descricao_curta,
        url: `https://kiyvo.com.br/p/${(demo as any).slug}`,
        type: 'website',
        siteName: 'KIYVO',
      },
    }
  }
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('titulo,title,descricao_curta,short_description,preco,base_price')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()
    if (data) {
      const n = normalizeProduct(data as Record<string, unknown>)
      const title = String(n.titulo || 'Produto')
      const desc = String(n.descricao_curta || '').substring(0, 160)
      return {
        title: `${title} — KIYVO`,
        description: desc || `Compre ${title} na KIYVO`,
      }
    }
  } catch {}
  return { title: 'Produto — KIYVO' }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  // 1) Tentar demo primeiro (instantâneo)
  const demo = ALL_DEMO.find(d => d.slug === slug || d.id === slug)

  // 2) Tentar Supabase
  let product: Record<string, unknown> | null = null
  let reviews: Array<Record<string, unknown>> = []
  if (!demo) {
    try {
      const supabase = createClient()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .maybeSingle()
        if (data) {
          product = normalizeProduct(data as Record<string, unknown>)
        }
      }
    } catch {}
  } else {
    product = demo as unknown as Record<string, unknown>
  }

  if (!product) {
    // Tenta por ID literal
    const byId = ALL_DEMO.find(d => d.id === slug)
    if (byId) product = byId as unknown as Record<string, unknown>
  }

  if (!product) {
    notFound()
  }

  // JSON-LD
  const preco = Number(product.preco || 0)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.titulo,
    description: (product.descricao as string) || (product.descricao_curta as string) || '',
    url: `https://kiyvo.com.br/p/${slug}`,
    offers: {
      '@type': 'Offer',
      price: preco.toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'KIYVO' },
    },
    aggregateRating: Number(product.rating || 0) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating),
      reviewCount: Number(product.total_reviews || 0),
    } : undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductPageClient slug={slug} initialProduct={product} initialReviews={reviews} />
    </>
  )
}
