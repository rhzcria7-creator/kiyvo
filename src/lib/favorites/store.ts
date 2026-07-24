'use client'
// ─────────────────────────────────────────────────────────────
// Store de favoritos em localStorage (sem login necessário)
// Funciona 100% client-side, sincroniza entre abas via storage event
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand'

interface FavItem {
  id: string
  titulo: string
  preco: number
  preco_de?: number | null
  gradient?: string
  emoji?: string
  slug?: string
  categoria?: string
  vendedor_nome?: string
  adicionadoEm: number
}

interface FavStore {
  items: FavItem[]
  loaded: boolean
  init: () => void
  toggle: (item: Omit<FavItem, 'adicionadoEm'>) => void
  isFav: (id: string) => boolean
  remove: (id: string) => void
  clear: () => void
}

const STORAGE_KEY = 'kiyvo_favorites'

export const useFavorites = create<FavStore>((set, get) => ({
  items: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const items = raw ? (JSON.parse(raw) as FavItem[]) : []
      set({ items, loaded: true })
    } catch {
      set({ items: [], loaded: true })
    }
  },

  toggle: (item) => {
    const { items } = get()
    const exists = items.find((i) => i.id === item.id)
    let next: FavItem[]
    if (exists) {
      next = items.filter((i) => i.id !== item.id)
    } else {
      next = [...items, { ...item, adicionadoEm: Date.now() }]
    }
    set({ items: next })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* noop */ }
  },

  isFav: (id) => get().items.some((i) => i.id === id),

  remove: (id) => {
    const next = get().items.filter((i) => i.id !== id)
    set({ items: next })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* noop */ }
  },

  clear: () => {
    set({ items: [] })
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
  },
}))
