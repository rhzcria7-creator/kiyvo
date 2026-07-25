// ─────────────────────────────────────────────────────────────
// Recommendation Skill v0.0.1 — AG-KIT skill para recomendações
// Quem comprou comprou também + Trending + Personalizado
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'

const recInputSchema = z.object({
  productId: z.string().optional(),
  userId: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().int().positive().max(20).default(8),
  type: z.enum(['similar', 'trending', 'personalized', 'also_bought', 'category']).default('also_bought'),
})

export type RecommendationInput = z.infer<typeof recInputSchema>

export interface Recommendation {
  id: string
  title: string
  slug: string
  price: number
  originalPrice: number | null
  rating: number
  totalSales: number
  thumbnail: string
  sellerName: string
  category: string
  reason: string // Por que foi recomendado
  score: number
}

/**
 * Busca recomendações baseadas em diferentes estratégias
 */
export async function getRecommendations(input: RecommendationInput): Promise<Recommendation[]> {
  const validated = recInputSchema.parse(input)

  // Em produção:
  // similar: SELECT * FROM products WHERE category = X AND id != Y ORDER BY rating DESC, sales DESC
  // also_bought: SELECT p.* FROM order_items oi1 JOIN order_items oi2 ON oi1.order_id = oi2.order_id JOIN products p ON oi2.product_id = p.id WHERE oi1.product_id = X AND oi2.product_id != X GROUP BY p.id ORDER BY COUNT(*) DESC
  // trending: SELECT * FROM products WHERE boost_expires_at > NOW() ORDER BY (sales_7d * 2 + views_7d) DESC
  // personalized: baseado em histórico do usuário + categoria favorita

  return []
}

/**
 * Busca trending products (mais vendidos/quentes)
 */
export async function getTrending(limit: number = 8): Promise<Recommendation[]> {
  return getRecommendations({ type: 'trending', limit })
}

/**
 * "Quem comprou também comprou"
 */
export async function getAlsoBought(productId: string, limit: number = 8): Promise<Recommendation[]> {
  return getRecommendations({ type: 'also_bought', productId, limit })
}

/**
 * Recomendações personalizadas para usuário
 */
export async function getPersonalized(userId: string, limit: number = 8): Promise<Recommendation[]> {
  return getRecommendations({ type: 'personalized', userId, limit })
}
