// ─────────────────────────────────────────────────────────────
// Categorias Page — Server Component com data fetching
// Busca categorias do Supabase no servidor (SEO-friendly)
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { CategoriasClient } from '@/components/categories/CategoriasClient'

interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string | null
  product_count: number
  is_featured: boolean
}

export default async function CategoriasPage() {
  let categories: CategoryData[] = []

  try {
    const supabase = createClient()

    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, icon, image_url, product_count, is_featured')
      .eq('is_active', true)
      .order('product_count', { ascending: false })
      .limit(50)

    if (data) {
      categories = data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        slug: c.slug as string,
        icon: (c.icon as string) || '📦',
        image_url: (c.image_url as string) || null,
        product_count: Number(c.product_count || 0),
        is_featured: (c.is_featured as boolean) || false,
      }))
    }
  } catch {
    // Silencioso: o Client tem fallback rico
  }

  // Gerar JSON-LD para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Categorias de Produtos Digitais — KIYVO',
    description: 'Explore todas as categorias de produtos digitais no marketplace KIYVO',
    url: 'https://kiyvo.com/categorias',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoriasClient categories={categories} error={null} />
    </>
  )
}
