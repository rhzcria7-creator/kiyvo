// ─────────────────────────────────────────────────────────────
// /p/[slug] — Server Component para Página de Produto
// Busca dados no servidor (SEO, OpenGraph, performance)
// Passa dados para o client component interativo
// ─────────────────────────────────────────────────────────────

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ProductPageClient } from '@/components/product/ProductPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Gerar metadata dinâmica para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const admin = createAdminClient()
    if (!admin) return { title: 'Produto — KIYVO' }

    const { data: product } = await admin
      .from('products')
      .select('title, description, base_price, slug, status')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (!product) return { title: 'Produto não encontrado — KIYVO' }

    const p = product as Record<string, unknown>
    const title = p.title as string
    const description = (p.description as string) || `Compre ${title} com segurança no KIYVO`
    const price = Number(p.base_price || 0)

    return {
      title: `${title} — KIYVO`,
      description: description.substring(0, 160),
      openGraph: {
        title: `${title} — KIYVO`,
        description: description.substring(0, 160),
        url: `https://kiyvo.com/p/${slug}`,
        type: 'website',
        siteName: 'KIYVO',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} — R$ ${price.toFixed(2)}`,
        description: description.substring(0, 160),
      },
    }
  } catch {
    return { title: 'Produto — KIYVO' }
  }
}

// ISR: revalidar a cada 5 minutos
export const revalidate = 300

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  let product: Record<string, unknown> | null = null
  let reviews: Array<Record<string, unknown>> = []

  try {
    const admin = createAdminClient()

    if (admin) {
      // Buscar produto com vendor e imagens
      const { data: productData } = await admin
        .from('products')
        .select(`
          id, title, slug, description, base_price, original_price,
          currency, stock_quantity, is_digital, delivery_type, status,
          rating, review_count, sales_count, views_count, is_featured, tags,
          category_id,
          vendors!inner(id, user_id, store_name, slug, logo_url, rating_avg, total_sales, level, commission_rate),
          product_images(id, image_url, alt_text, is_primary, sort_order),
          product_variants(id, sku, attributes, price_adjustment, stock)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (productData) {
        product = productData as Record<string, unknown>

        // Incrementar view count
        await admin.rpc('increment_product_views', { product_id_input: product.id })

        // Buscar reviews
        const { data: reviewsData } = await admin
          .from('reviews')
          .select('id, rating, comment, is_anonymous, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, username)')
          .eq('product_id', product.id)
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(20)

        reviews = (reviewsData || []) as Array<Record<string, unknown>>
      }
    }
  } catch {
    // Se Supabase não estiver disponível, component client tenta via API
  }

  if (!product) {
    // Não temos dados no servidor — o client tenta via API
    return <ProductPageClient slug={slug} initialProduct={null} initialReviews={[]} />
  }

  // Gerar JSON-LD para produto (SEO)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: (product.description as string) || '',
    url: `https://kiyvo.com/p/${slug}`,
    offers: {
      '@type': 'Offer',
      price: product.base_price,
      priceCurrency: 'BRL',
      availability: Number(product.stock_quantity || 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'Organization',
        name: 'KIYVO',
      },
    },
    aggregateRating: Number(product.review_count || 0) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient
        slug={slug}
        initialProduct={product}
        initialReviews={reviews}
      />
    </>
  )
}
