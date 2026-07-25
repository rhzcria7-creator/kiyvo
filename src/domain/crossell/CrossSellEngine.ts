// ─────────────────────────────────────────────────────────────
// Cross-Sell Engine v0.0.1 — Venda cruzada inteligente
// "Quem comprou também comprou", upsell pós-compra, bundles sugeridos
// ─────────────────────────────────────────────────────────────

export interface CrossSellItem { productId: string; title: string; price: number; thumbnail: string; category: string; reason: string; score: number; matchType: 'also_bought' | 'complementary' | 'upgrade' | 'bundle' }

export class CrossSellEngine {
  suggestAlsoBought(currentProductId: string, allOrders: Array<{ items: string[] }>): string[] {
    const coOccurrences = new Map<string, number>()
    for (const order of allOrders) {
      if (order.items.includes(currentProductId)) {
        for (const item of order.items) {
          if (item !== currentProductId) coOccurrences.set(item, (coOccurrences.get(item) || 0) + 1)
        }
      }
    }
    return Array.from(coOccurrences.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id)
  }

  suggestComplementary(category: string): string[] {
    const complements: Record<string, string[]> = {
      'software': ['templates', 'plugins', 'fonts'],
      'cursos': ['ebooks', 'templates', 'software'],
      'ebooks': ['cursos', 'templates'],
      'templates': ['software', 'fonts', 'cursos'],
      'design': ['fonts', 'templates', 'software'],
      'jogos': ['software', 'assets'],
    }
    return complements[category] || []
  }

  calculateUpgrade(currentPrice: number, targetPrice: number): { upgradePrice: number; savingsPercent: number } {
    const upgradePrice = Math.max(0, targetPrice - currentPrice * 0.7)
    const savingsPercent = currentPrice > 0 ? Math.round((1 - upgradePrice / targetPrice) * 100) : 0
    return { upgradePrice: Math.round(upgradePrice * 100) / 100, savingsPercent }
  }

  rankItems(items: CrossSellItem[], maxResults = 4): CrossSellItem[] {
    return items.sort((a, b) => b.score - a.score).slice(0, maxResults)
  }
}
export const crossSellEngine = new CrossSellEngine()
