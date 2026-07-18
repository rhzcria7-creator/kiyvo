// ─────────────────────────────────────────────────────────────
// FeaturedProductsServer — Busca produtos em destaque no servidor
// Dados passados para o client component via props
// Reduz 'use client' na home page
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { FeaturedProductsClient } from './FeaturedProductsClient'

interface FeaturedProduct {
  id: string
  title: string
  slug: string
  base_price: number
  original_price: number | null
  image: string
  category: string
  categorySlug: string
  type: string
  deliveryType: string
  rating: number
  sales: number
  reviews: number
  seller: {
    id: string
    name: string
    avatar: string
    rating: number
    sales: number
    verified: boolean
    memberSince: string
  }
}

export async function FeaturedProducts() {
  let products: FeaturedProduct[] = []

  try {
    const supabase = createClient()

    const { data } = await supabase
      .from('products')
      .select(`
        id, title, slug, base_price, original_price,
        status, is_featured, sales_count, rating, review_count,
        delivery_type, created_at,
        categories:category_id (name, slug),
        vendors:vendor_id (store_name, logo_url, rating_avg, total_sales, level),
        product_images (image_url, is_primary, alt_text)
      `)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('sales_count', { ascending: false })
      .limit(6)

    if (data) {
      products = data.map((p: Record<string, unknown>) => {
        const vendor = (p.vendors || {}) as Record<string, unknown>
        const images = (p.product_images || []) as Array<Record<string, unknown>>
        const category = (p.categories || {}) as Record<string, unknown>
        const primaryImage = images.find((img) => img.is_primary) || images[0]

        return {
          id: p.id as string,
          title: p.title as string,
          slug: p.slug as string,
          base_price: Number(p.base_price || 0),
          original_price: p.original_price ? Number(p.original_price) : null,
          image: (primaryImage?.image_url as string) || '/placeholder-product.svg',
          category: (category.name as string) || 'Digital',
          categorySlug: (category.slug as string) || 'digital',
          type: 'digital',
          deliveryType: (p.delivery_type as string) || 'automatic',
          rating: Number(p.rating || 0),
          sales: Number(p.sales_count || 0),
          reviews: Number(p.review_count || 0),
          seller: {
            id: String(vendor.id || ''),
            name: (vendor.store_name as string) || 'Vendedor',
            avatar: (vendor.logo_url as string) || '',
            rating: Number(vendor.rating_avg || 0),
            sales: Number(vendor.total_sales || 0),
            verified: (vendor.level as string) === 'gold' || (vendor.level as string) === 'diamond',
            memberSince: String(vendor.created_at || ''),
          },
        }
      })
    }
  } catch {
    // Se Supabase não estiver configurado, retorna array vazio
    // O client component mostra estado vazio
  }

  return <FeaturedProductsClient products={products} />
}
