// ─────────────────────────────────────────────────────────────
// Cart Store — Gerenciamento de estado do carrinho (Zustand)
// Carrinho multi-vendedor com cálculo de taxas em tempo real
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FeeEngine, type FeeCalculation, type SellerPlan, type PaymentMethod } from '@/domain/fees/FeeEngine'
import type { LicenseType } from '@/domain/fees/FeeEngine'

const feeEngine = new FeeEngine()

/** Item do carrinho */
export interface CartItemData {
  productId: string
  productTitle: string
  productImage: string
  productPrice: number
  productType: string
  categorySlug: string
  sellerId: string
  sellerName: string
  sellerAvatar: string
  sellerPlan: SellerPlan
  licenseType: LicenseType
  deliveryType: string
  affiliateCode?: string
  addedAt: string
}

/** Grupo de itens por vendedor */
export interface CartSellerGroup {
  sellerId: string
  sellerName: string
  sellerAvatar: string
  items: CartItemData[]
  subtotal: number
  feeCalculation: FeeCalculation | null
}

/** Estado do carrinho */
interface CartState {
  items: CartItemData[]
  couponCode: string | null
  couponDiscount: number
  paymentMethod: PaymentMethod

  // Ações
  addItem: (item: CartItemData) => void
  removeItem: (productId: string, licenseType: LicenseType) => void
  updateLicense: (productId: string, licenseType: LicenseType) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  setPaymentMethod: (method: PaymentMethod) => void

  // Derivados
  getGroups: () => CartSellerGroup[]
  getSubtotal: () => number
  getTotalBuyerFees: () => number
  getTotal: () => number
  getItemCount: () => number
  isInCart: (productId: string) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      paymentMethod: 'pix',

      addItem: (item) => {
        const { items } = get()
        // Verificar se já existe
        const exists = items.find(
          (i) => i.productId === item.productId && i.licenseType === item.licenseType
        )
        if (exists) return // Já está no carrinho

        set({ items: [...items, { ...item, addedAt: new Date().toISOString() }] })
      },

      removeItem: (productId, licenseType) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.licenseType === licenseType)
          ),
        })
      },

      updateLicense: (productId, licenseType) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, licenseType } : i
          ),
        })
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),

      getGroups: () => {
        const { items, paymentMethod, couponDiscount } = get()
        const sellerMap = new Map<string, CartItemData[]>()

        // Agrupar por vendedor
        for (const item of items) {
          const group = sellerMap.get(item.sellerId) || []
          group.push(item)
          sellerMap.set(item.sellerId, group)
        }

        // Calcular taxas por grupo
        const groups: CartSellerGroup[] = []
        sellerMap.forEach((sellerItems, sellerId) => {
          const subtotal = sellerItems.reduce((sum, item) => sum + item.productPrice, 0)
          const firstItem = sellerItems[0]

          // Calcular taxas usando FeeEngine
          let feeCalculation: FeeCalculation | null = null
          if (subtotal > 0) {
            feeCalculation = feeEngine.calculate({
              price: subtotal,
              sellerPlan: firstItem.sellerPlan || 'free',
              paymentMethod,
              hasAffiliate: sellerItems.some((i) => i.affiliateCode),
            })
          }

          groups.push({
            sellerId,
            sellerName: firstItem.sellerName,
            sellerAvatar: firstItem.sellerAvatar,
            items: sellerItems,
            subtotal,
            feeCalculation,
          })
        })

        return groups
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.productPrice, 0)
      },

      getTotalBuyerFees: () => {
        const groups = get().getGroups()
        return groups.reduce((sum, g) => sum + (g.feeCalculation?.buyerServiceFee || 0), 0)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const buyerFees = get().getTotalBuyerFees()
        const { couponDiscount } = get()
        const couponAmount = subtotal * (couponDiscount / 100)
        return Math.max(0, subtotal + buyerFees - couponAmount)
      },

      getItemCount: () => get().items.length,

      isInCart: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: 'kiyvo-cart', // localStorage key
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        paymentMethod: state.paymentMethod,
      }),
    }
  )
)
