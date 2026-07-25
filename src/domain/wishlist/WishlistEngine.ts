// ─────────────────────────────────────────────────────────────
// Wishlist Engine v0.0.1 — Lista de desejos + Follow Store
// Notifica quando produto entra em promoção
// ─────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  productTitle: string
  productPrice: number
  productThumbnail: string
  notifyOnSale: boolean
  createdAt: string
}

export interface FollowedStore {
  id: string
  userId: string
  sellerId: string
  sellerName: string
  sellerAvatar: string
  createdAt: string
}

export class WishlistEngine {
  /**
   * Verifica se preço caiu (para notificação)
   */
  checkPriceDrop(currentPrice: number, wishlistedPrice: number): { dropped: boolean; percent: number } {
    if (currentPrice >= wishlistedPrice) return { dropped: false, percent: 0 }
    const percent = Math.round((1 - currentPrice / wishlistedPrice) * 100)
    return { dropped: percent >= 5, percent }
  }
}

export const wishlistEngine = new WishlistEngine()
