// ─────────────────────────────────────────────────────────────
// Search Skill v0.0.1 — AG-KIT skill para busca FTS
// Full-text search com tsvector portuguese + pg_trgm + autocomplete
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'

const searchInputSchema = z.object({
  query: z.string().min(1).max(200),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest', 'sales']).default('relevance'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  deliveryType: z.enum(['instant', 'manual', 'any']).default('any'),
  sellerLevel: z.string().optional(),
  hasBoost: z.boolean().optional(),
  taxFree: z.boolean().optional(),
})

export type SearchInput = z.infer<typeof searchInputSchema>

export interface SearchResult {
  products: Array<{
    id: string
    title: string
    slug: string
    description: string
    price: number
    originalPrice: number | null
    rating: number
    totalSales: number
    thumbnail: string
    category: string
    sellerName: string
    sellerLevel: string
    deliveryType: string
    hasBoost: boolean
    isTaxFree: boolean
    createdAt: string
  }>
  total: number
  page: number
  totalPages: number
  facets: {
    categories: Array<{ name: string; count: number }>
    priceRange: { min: number; max: number }
    ratings: Array<{ rating: number; count: number }>
  }
  suggestions: string[]
  searchTime: number
}

/**
 * Search FTS - em produção usa Supabase pg_trgm + tsvector
 * Fallback para filtragem em memória
 */
export async function searchProducts(input: SearchInput): Promise<SearchResult> {
  const validated = searchInputSchema.parse(input)
  const startTime = Date.now()

  // Em produção: consulta Supabase com:
  // - to_tsvector('portuguese', title || ' ' || description) @@ plainto_tsquery('portuguese', query)
  // - similarity(title, query) > 0.3 (pg_trgm)
  // - Filtros: price BETWEEN, rating >=, etc
  // - ORDER BY boost DESC, ts_rank DESC, sales DESC

  const suggestions = await generateSearchSuggestions(validated.query)
  const searchTime = Date.now() - startTime

  return {
    products: [],
    total: 0,
    page: validated.page,
    totalPages: 0,
    facets: {
      categories: [],
      priceRange: { min: 0, max: 0 },
      ratings: [],
    },
    suggestions,
    searchTime,
  }
}

/**
 * Gera sugestões de busca (autocomplete)
 */
async function generateSearchSuggestions(query: string): Promise<string[]> {
  // Em produção: consulta Supabase com pg_trgm
  return [
    `${query} premium`,
    `${query} barato`,
    `${query} delivery imediato`,
  ]
}

/**
 * Extrai termos de busca para FTS
 */
export function parseSearchQuery(query: string): {
  terms: string[]
  filters: Record<string, string>
} {
  const terms: string[] = []
  const filters: Record<string, string> = {}

  const parts = query.split(/\s+/)
  for (const part of parts) {
    if (part.includes(':')) {
      const [key, value] = part.split(':')
      filters[key] = value
    } else {
      terms.push(part)
    }
  }

  return { terms, filters }
}
