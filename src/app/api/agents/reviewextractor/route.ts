export const runtime = 'nodejs'
import { extrairInsightsReviews } from '@/lib/agents/reviewextractor'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    if (!Array.isArray(b.reviews) || b.reviews.length === 0) return Response.json({ error: 'Envie uma lista de reviews' }, { status: 400 })
    return Response.json(extrairInsightsReviews({ reviews: b.reviews, produto: b.produto }))
  } catch { return Response.json({ error: 'Erro' }, { status: 500 }) }
}
