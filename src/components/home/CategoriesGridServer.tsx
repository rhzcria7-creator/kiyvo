// ─────────────────────────────────────────────────────────────
// CategoriesGridServer — Busca categorias no servidor
// Dados passados para o client component via props
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { CategoriesGridClient } from './CategoriesGridClient'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string | null
  product_count: number
  is_active: boolean
}

export async function CategoriesGrid() {
  let categories: Category[] = []

  try {
    const supabase = createClient()

    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, icon, image_url, product_count, is_active')
      .eq('is_active', true)
      .order('product_count', { ascending: false })
      .limit(8)

    if (data) {
      categories = data.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        slug: c.slug as string,
        icon: (c.icon as string) || '📦',
        image_url: (c.image_url as string) || null,
        product_count: Number(c.product_count || 0),
        is_active: (c.is_active as boolean) || true,
      }))
    }
  } catch {
    // Se Supabase não estiver configurado, retorna array vazio
  }

  return <CategoriesGridClient categories={categories} />
}
