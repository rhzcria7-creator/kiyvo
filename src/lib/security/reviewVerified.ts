// ─────────────────────────────────────────────────────────────
// Review Verified v0.0.1 — Sistema de reviews verificadas
// Apenas compras verificadas podem avaliar
// Anti-fraude: detecção de review bombing, sock puppets, compra de reviews
// ─────────────────────────────────────────────────────────────

export interface ReviewVerification {
  reviewId: string
  productId: string
  buyerId: string
  orderId: string
  verified: boolean
  verificationMethod: 'purchase_confirmed' | 'delivery_confirmed' | 'manual'
  hasPhoto: boolean
  photoVerified: boolean
  kdPointsAwarded: number
  createdAt: string
}

export interface ReviewFraudCheck {
  suspicious: boolean
  score: number // 0-100
  flags: string[]
  reason?: string
}

const MAX_REVIEWS_PER_HOUR = 5
const MIN_ACCOUNT_AGE_HOURS = 24
const MIN_PURCHASE_VALUE_FOR_REVIEW = 0.50

/**
 * Verifica se uma review é de compra verificada
 */
export function verifyReviewPurchase(params: {
  buyerId: string
  productId: string
  orderId: string
  hasPurchased: boolean
  orderStatus: string
  deliveryStatus: string
}): ReviewVerification {
  const verified = params.hasPurchased &&
    (params.orderStatus === 'completed' || params.orderStatus === 'delivered') &&
    (params.deliveryStatus === 'delivered' || params.deliveryStatus === 'confirmed')

  return {
    reviewId: `rev_${Date.now()}`,
    productId: params.productId,
    buyerId: params.buyerId,
    orderId: params.orderId,
    verified,
    verificationMethod: verified ? 'purchase_confirmed' : 'delivery_confirmed',
    hasPhoto: false,
    photoVerified: false,
    kdPointsAwarded: verified ? 10 : 0, // 10 KD Points por review
    createdAt: new Date().toISOString(),
  }
}

/**
 * Detecta fraudes em reviews
 */
export function detectReviewFraud(params: {
  buyerId: string
  productId: string
  sellerId: string
  rating: number
  reviewText: string
  recentReviews: Array<{ buyerId: string; productId: string; rating: number; createdAt: string }>
  accountCreatedAt: string
  ipAddress: string
}): ReviewFraudCheck {
  const flags: string[] = []
  let score = 0

  // 1. Review bombing (muitas reviews em pouco tempo)
  const recentCount = params.recentReviews.filter(r => {
    const hoursAgo = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60)
    return hoursAgo < 1
  }).length

  if (recentCount > MAX_REVIEWS_PER_HOUR) {
    flags.push('Muitas reviews em 1 hora')
    score += 30
  }

  // 2. Conta muito nova
  const accountAgeHours = (Date.now() - new Date(params.accountCreatedAt).getTime()) / (1000 * 60 * 60)
  if (accountAgeHours < MIN_ACCOUNT_AGE_HOURS) {
    flags.push('Conta muito nova para review')
    score += 20
  }

  // 3. Rating extremo em produto de vendedor específico
  if (params.rating === 1 || params.rating === 5) {
    const sameSellerReviews = params.recentReviews.filter(r => r.productId !== params.productId)
    if (sameSellerReviews.length >= 3 && sameSellerReviews.every(r => r.rating === params.rating)) {
      flags.push('Padrão suspeito de ratings')
      score += 15
    }
  }

  // 4. Review genérica/detectada como fake
  if (params.reviewText.length < 20) {
    flags.push('Review muito curta')
    score += 5
  }

  // 5. Auto-review (comprador avalia próprio produto)
  if (params.buyerId === params.sellerId) {
    flags.push('Auto-review detectado')
    score += 50
  }

  return {
    suspicious: score >= 30,
    score,
    flags,
    reason: flags.length > 0 ? flags[0] : undefined,
  }
}

/**
 * Calcula reputação do vendedor baseado nas reviews
 */
export function calculateSellerReputation(reviews: Array<{ rating: number; verified: boolean }>): {
  averageRating: number
  totalReviews: number
  verifiedReviews: number
  percentPositive: number
  thermometer: 'green' | 'yellow' | 'red'
} {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      verifiedReviews: 0,
      percentPositive: 0,
      thermometer: 'yellow',
    }
  }

  const verifiedReviews = reviews.filter(r => r.verified)
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const positiveReviews = reviews.filter(r => r.rating >= 4).length

  const averageRating = Math.round((totalRating / reviews.length) * 10) / 10
  const percentPositive = Math.round((positiveReviews / reviews.length) * 100)

  // Termômetro estilo Mercado Livre
  const thermometer = percentPositive >= 90 && averageRating >= 4.5
    ? 'green'
    : percentPositive >= 70 && averageRating >= 3.5
    ? 'yellow'
    : 'red'

  return {
    averageRating,
    totalReviews: reviews.length,
    verifiedReviews: verifiedReviews.length,
    percentPositive,
    thermometer,
  }
}

/**
 * Verifica conteúdo NSFW em review
 */
export function checkNSFWContent(text: string): { hasNSFW: boolean; flaggedTerms: string[] } {
  const nsfwTerms = [
    /sexo/i, /porn/i, /xxx/i, /nude/i, /nu\d/i,
    /puta/i, /pinto/i, /buceta/i, /caralho/i,
    /conteúdo adulto/i, /maior 18/i, /18 anos/i,
    /onlyfans/i, /privacy/i,
  ]

  const flaggedTerms = nsfwTerms
    .filter(term => term.test(text))
    .map(term => term.source)

  return {
    hasNSFW: flaggedTerms.length > 0,
    flaggedTerms,
  }
}
