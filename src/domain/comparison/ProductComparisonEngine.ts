// ─────────────────────────────────────────────────────────────
// Product Comparison Engine v0.0.1 — Comparação de produtos
// Tabela comparativa lado a lado, diferenças destacadas
// ─────────────────────────────────────────────────────────────

export interface ComparableProduct {
  id: string
  title: string
  slug: string
  price: number
  originalPrice: number | null
  rating: number
  reviewCount: number
  totalSales: number
  category: string
  sellerName: string
  sellerLevel: string
  sellerRating: number
  deliveryType: string
  isTaxFree: boolean
  hasBoost: boolean
  features: string[]
  tags: string[]
  thumbnail: string
}

export interface ComparisonAttribute {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'rating'
  values: Record<string, string | number | boolean>
  differences: boolean
  bestValue?: string // productId with best value
}

export class ProductComparisonEngine {
  MAX_COMPARE = 6

  compareProducts(products: ComparableProduct[]): {
    products: ComparableProduct[]
    attributes: ComparisonAttribute[]
    summary: { bestPrice: string; bestRating: string; bestSelling: string }
  } {
    if (products.length < 2 || products.length > this.MAX_COMPARE) {
      throw new Error(`Compare entre 2 e ${this.MAX_COMPARE} produtos`)
    }

    const attributes: ComparisonAttribute[] = []

    // Preço
    const prices = Object.fromEntries(products.map(p => [p.id, p.price]))
    const minPrice = Math.min(...Object.values(prices))
    const bestPrice = products.find(p => p.price === minPrice)?.id || ''

    attributes.push({
      key: 'price',
      label: 'Preço',
      type: 'number',
      values: prices,
      differences: new Set(Object.values(prices)).size > 1,
      bestValue: bestPrice,
    })

    // Rating
    const ratings = Object.fromEntries(products.map(p => [p.id, p.rating]))
    const maxRating = Math.max(...Object.values(ratings))
    const bestRating = products.find(p => p.rating === maxRating)?.id || ''

    attributes.push({
      key: 'rating',
      label: 'Avaliação',
      type: 'rating',
      values: ratings,
      differences: new Set(Object.values(ratings)).size > 1,
      bestValue: bestRating,
    })

    // Vendas
    const sales = Object.fromEntries(products.map(p => [p.id, p.totalSales]))
    const maxSales = Math.max(...Object.values(sales))
    const bestSelling = products.find(p => p.totalSales === maxSales)?.id || ''

    attributes.push({
      key: 'sales',
      label: 'Vendas',
      type: 'number',
      values: sales,
      differences: new Set(Object.values(sales)).size > 1,
      bestValue: bestSelling,
    })

    // Review Count
    attributes.push({
      key: 'reviewCount',
      label: 'Avaliações',
      type: 'number',
      values: Object.fromEntries(products.map(p => [p.id, p.reviewCount])),
      differences: true,
    })

    // Seller Level
    attributes.push({
      key: 'sellerLevel',
      label: 'Nível do Vendedor',
      type: 'text',
      values: Object.fromEntries(products.map(p => [p.id, p.sellerLevel])),
      differences: true,
    })

    // Tax Free
    attributes.push({
      key: 'isTaxFree',
      label: 'Sem Taxa',
      type: 'boolean',
      values: Object.fromEntries(products.map(p => [p.id, p.isTaxFree])),
      differences: true,
    })

    // Delivery
    attributes.push({
      key: 'deliveryType',
      label: 'Entrega',
      type: 'text',
      values: Object.fromEntries(products.map(p => [p.id, p.deliveryType === 'instant' ? 'Imediata' : 'Manual'])),
      differences: true,
    })

    // Features intersection
    const allFeatures = Array.from(new Set(products.flatMap(p => p.features)))
    for (const feature of allFeatures) {
      const featureValues = Object.fromEntries(products.map(p => [p.id, p.features.includes(feature)]))
      attributes.push({
        key: `feature_${feature}`,
        label: feature,
        type: 'boolean',
        values: featureValues,
        differences: new Set(Object.values(featureValues)).size > 1,
      })
    }

    return {
      products,
      attributes,
      summary: { bestPrice, bestRating, bestSelling },
    }
  }

  generateShareText(products: ComparableProduct[], summary: { bestPrice: string; bestRating: string; bestSelling: string }): string {
    const lines = products.map(p => {
      const badges = []
      if (p.id === summary.bestPrice) badges.push('💰 Melhor Preço')
      if (p.id === summary.bestRating) badges.push('⭐ Melhor Avaliado')
      if (p.id === summary.bestSelling) badges.push('🔥 Mais Vendido')
      return `${p.title}: R$ ${p.price.toFixed(2)} ${badges.length ? '(' + badges.join(', ') + ')' : ''}`
    })
    return `Comparação KIYVO:\n${lines.join('\n')}\n\nVeja mais em kiyvo.com.br`
  }
}

export const productComparisonEngine = new ProductComparisonEngine()
