'use client'
// Store de PRODUTOS VISTOS RECENTEMENTE pelo usuário.
// Quando o usuário entra em /p/[slug], o produto é adicionado à lista (max 12).
// A home e outras páginas podem usar "Vistos recentemente" para recomendações.
// Comentários em PT-BR.
import { create } from 'zustand'

export interface RecentProduct {
  id: string
  slug?: string
  titulo: string
  preco: number
  preco_de?: number | null
  emoji?: string
  gradient?: string
  categoria?: string
  vendedor_nome?: string
  vistoEm: number
}

interface RecentStore {
  items: RecentProduct[]
  loaded: boolean
  init: () => void
  add: (p: Omit<RecentProduct, 'vistoEm'>) => void
  clear: () => void
  list: () => RecentProduct[]
}

const STORAGE_KEY = 'kiyvo_recent'
const MAX = 12

function save(list: RecentProduct[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}
function load(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentProduct[]) : []
  } catch { return [] }
}

export const useRecent = create<RecentStore>((set, get) => ({
  items: [],
  loaded: false,
  init: () => {
    if (typeof window === 'undefined') return
    set({ items: load(), loaded: true })
  },
  add: (p) => {
    const now = Date.now()
    const existe = get().items.filter(x => x.id !== p.id && x.slug !== p.slug)
    const next = [{ ...p, vistoEm: now }, ...existe].slice(0, MAX)
    set({ items: next })
    save(next)
  },
  clear: () => { set({ items: [] }); save([]) },
  list: () => get().items,
}))
