'use client'
// Store de COMPRAS do usuário — produtos comprados (entregues na biblioteca).
// Popula via localStorage (kiyvo_purchases). Para integrar com backend real, só substituir
// as funções de leitura/escrita por chamadas API. Comentários em PT-BR.
import { create } from 'zustand'

export interface Purchase {
  id: string
  productId: string
  productSlug?: string
  titulo: string
  preco: number
  emoji?: string
  gradient?: string
  categoria?: string
  vendedor_nome?: string
  arquivos?: { nome: string; url: string }[]
  compradoEm: string
  status: 'entregue' | 'processando'
}

const STORAGE_KEY = 'kiyvo_purchases'

interface PurchaseStore {
  purchases: Purchase[]
  loaded: boolean
  init: () => void
  add: (p: Omit<Purchase, 'id' | 'compradoEm' | 'status'>) => Purchase
  list: () => Purchase[]
  has: (productId: string) => boolean
}

function save(list: Purchase[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {} }
function load(): Purchase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
function uid() { return 'pur-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

export const usePurchases = create<PurchaseStore>((set, get) => ({
  purchases: [],
  loaded: false,
  init: () => {
    const purchases = load()
    set({ purchases, loaded: true })
  },
  add: (p) => {
    const purchase: Purchase = {
      ...p,
      id: uid(),
      compradoEm: new Date().toISOString(),
      status: 'entregue',
    }
    const next = [purchase, ...get().purchases]
    set({ purchases: next }); save(next)
    return purchase
  },
  list: () => get().purchases,
  has: (pid) => get().purchases.some(x => x.productId === pid),
}))
