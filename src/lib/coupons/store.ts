'use client'
// Store de cupons de VENDEDOR (localStorage)
// Vendedor é OBRIGADO a criar ao menos 1 cupom de 2-70% ao publicar produto.
// Cupons são aplicados no checkout/carrinho em produtos deste vendedor.
import { create } from 'zustand'

export interface SellerCoupon {
  id: string
  code: string
  percent: number        // 2% a 70%
  productId?: string     // específico de um produto (opcional)
  maxUses?: number       // limite de usos (opcional)
  usedCount: number
  minValue?: number      // valor mínimo
  validUntil?: string    // ISO data
  active: boolean
  createdAt: string
  sellerName: string
}

interface CouponStore {
  coupons: SellerCoupon[]
  loaded: boolean
  init: () => void
  create: (c: Omit<SellerCoupon, 'id' | 'usedCount' | 'createdAt' | 'active'>) => SellerCoupon
  remove: (id: string) => void
  toggle: (id: string) => void
  findByCode: (code: string, productId?: string, total?: number) => SellerCoupon | null
  listBySeller: (name: string) => SellerCoupon[]
  useCoupon: (id: string) => void
  validatePercent: (percent: number) => { ok: boolean; error?: string }
}

const STORAGE_KEY = 'kiyvo_seller_coupons'

function save(list: SellerCoupon[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch { /* noop */ }
}

function uid() { return 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

export const useSellerCoupons = create<CouponStore>((set, get) => ({
  coupons: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const coupons = raw ? (JSON.parse(raw) as SellerCoupon[]) : []
      set({ coupons, loaded: true })
    } catch { set({ coupons: [], loaded: true }) }
  },

  validatePercent: (percent) => {
    if (!Number.isFinite(percent) || percent < 2) return { ok: false, error: 'Cupom deve ter no mínimo 2% de desconto' }
    if (percent > 70) return { ok: false, error: 'Cupom não pode ultrapassar 70%' }
    return { ok: true }
  },

  create: (c) => {
    const p = Number(c.percent)
    const v = get().validatePercent(p)
    if (!v.ok) throw new Error(v.error)
    const coupon: SellerCoupon = {
      id: uid(),
      code: c.code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16),
      percent: p,
      productId: c.productId,
      maxUses: c.maxUses,
      usedCount: 0,
      minValue: c.minValue,
      validUntil: c.validUntil,
      active: true,
      createdAt: new Date().toISOString(),
      sellerName: c.sellerName,
    }
    if (coupon.code.length < 3) throw new Error('Código deve ter pelo menos 3 caracteres')
    const next = [coupon, ...get().coupons]
    set({ coupons: next })
    save(next)
    return coupon
  },

  remove: (id) => {
    const next = get().coupons.filter(c => c.id !== id)
    set({ coupons: next }); save(next)
  },

  toggle: (id) => {
    const next = get().coupons.map(c => c.id === id ? { ...c, active: !c.active } : c)
    set({ coupons: next }); save(next)
  },

  useCoupon: (id) => {
    const next = get().coupons.map(c => c.id === id ? { ...c, usedCount: c.usedCount + 1 } : c)
    set({ coupons: next }); save(next)
  },

  findByCode: (code, productId, total) => {
    const c = code.toUpperCase().trim()
    const now = new Date()
    return get().coupons.find(coupon => {
      if (!coupon.active) return false
      if (coupon.code !== c) return false
      if (coupon.productId && productId && coupon.productId !== productId) return false
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return false
      if (coupon.validUntil && new Date(coupon.validUntil) < now) return false
      if (coupon.minValue && total && total < coupon.minValue) return false
      return true
    }) || null
  },

  listBySeller: (name) => get().coupons.filter(c => c.sellerName === name),
}))
