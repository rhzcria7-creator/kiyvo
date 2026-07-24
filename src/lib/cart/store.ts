'use client'
// ─────────────────────────────────────────────────────────────
// Store de carrinho em localStorage (sem login necessário)
// Suporta adicionar/remover/alterar qtd, limpar, calcular totais.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand'

export interface CartItem {
  id: string
  titulo: string
  preco: number
  preco_de?: number | null
  gradient?: string
  emoji?: string
  slug?: string
  categoria?: string
  vendedor_nome?: string
  qty: number
  adicionadoEm: number
}

interface CartStore {
  items: CartItem[]
  loaded: boolean
  init: () => void
  add: (item: Omit<CartItem, 'qty' | 'adicionadoEm'> & { qty?: number }) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  total: () => { subtotal: number; desconto: number; total: number; totalPix: number; itens: number }
  isInCart: (id: string) => boolean
}

const STORAGE_KEY = 'kiyvo_cart'

function save(items: CartItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* noop */ }
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const items = raw ? (JSON.parse(raw) as CartItem[]) : []
      set({ items, loaded: true })
    } catch {
      set({ items: [], loaded: true })
    }
  },

  add: (item) => {
    const { items } = get()
    const qtyAdd = item.qty || 1
    const existing = items.find((i) => i.id === item.id)
    let next: CartItem[]
    if (existing) {
      next = items.map((i) =>
        i.id === item.id ? { ...i, qty: Math.min(i.qty + qtyAdd, 99) } : i
      )
    } else {
      next = [
        ...items,
        { ...item, qty: Math.min(qtyAdd, 99), adicionadoEm: Date.now() },
      ]
    }
    set({ items: next })
    save(next)
  },

  remove: (id) => {
    const next = get().items.filter((i) => i.id !== id)
    set({ items: next })
    save(next)
  },

  setQty: (id, qty) => {
    const safe = Math.max(1, Math.min(qty, 99))
    const next = get().items.map((i) => (i.id === id ? { ...i, qty: safe } : i))
    set({ items: next })
    save(next)
  },

  clear: () => {
    set({ items: [] })
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
  },

  total: () => {
    const items = get().items
    const subtotal = items.reduce((acc, i) => acc + (i.preco_de || i.preco) * i.qty, 0)
    const atual = items.reduce((acc, i) => acc + i.preco * i.qty, 0)
    const desconto = Math.max(0, subtotal - atual)
    const total = atual
    const totalPix = total * 0.95
    const itens = items.reduce((acc, i) => acc + i.qty, 0)
    return { subtotal, desconto, total, totalPix, itens }
  },

  isInCart: (id) => get().items.some((i) => i.id === id),
}))
