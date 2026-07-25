// ─────────────────────────────────────────────────────────────
// Bundle Engine v0.0.1 — Criador de bundles/pacotes
// Múltiplos produtos com preço promocional, desconto progressivo
// ─────────────────────────────────────────────────────────────

export interface BundleProduct { productId: string; title: string; price: number; thumbnail: string; sellerId: string }
export interface Bundle { id: string; name: string; description: string; slug: string; products: BundleProduct[]; originalTotal: number; bundlePrice: number; discountPercent: number; savings: number; sellerId: string; isActive: boolean; sales: number; createdAt: string }

export class BundleEngine {
  calculate(products: BundleProduct[], discountPercent: number): { originalTotal: number; bundlePrice: number; savings: number; discountPercent: number } {
    const originalTotal = products.reduce((s, p) => s + p.price, 0)
    const bundlePrice = Math.round(originalTotal * (1 - discountPercent / 100) * 100) / 100
    return { originalTotal, bundlePrice, savings: Math.round((originalTotal - bundlePrice) * 100) / 100, discountPercent }
  }
  suggestDiscount(productCount: number): number {
    if (productCount >= 5) return 40; if (productCount >= 3) return 25; if (productCount >= 2) return 15; return 0
  }
  create(params: { name: string; description: string; products: BundleProduct[]; sellerId: string }): Bundle {
    const discount = this.suggestDiscount(params.products.length)
    const { originalTotal, bundlePrice, savings } = this.calculate(params.products, discount)
    return { id: `bundle_${Date.now()}`, ...params, slug: params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), originalTotal, bundlePrice, discountPercent: discount, savings, isActive: true, sales: 0, createdAt: new Date().toISOString() }
  }
}
export const bundleEngine = new BundleEngine()
