'use client'
// Store de Boosts (destaque pago) da KIYVO.
// Quando um vendedor compra um boost, o produto ganha destaque visual,
// aparece no topo de buscas/categorias e ganha mais tráfego.
// Pacotes: 6h R$4,90 · 24h R$14,90 · 7d R$69,90 · 30d R$199,90
// Persiste em localStorage (kiyvo_boosts).
// Comentários em PT-BR.
import { create } from 'zustand'

export interface BoostEntry {
  id: string
  productId: string
  plano: 'boost_6h' | 'boost_24h' | 'boost_7d' | 'boost_30d'
  inicio: string          // ISO
  expira: string          // ISO
  pago: boolean
}

export interface BoostPlano {
  id: BoostEntry['plano']
  label: string
  duracaoMs: number
  preco: number
  descricao: string
  multiplicador: number
}

export const BOOST_PLANOS: BoostPlano[] = [
  { id: 'boost_6h',   label: '6 horas',  duracaoMs: 6   * 3600 * 1000, preco: 4.90,  descricao: 'Destaque rápido',         multiplicador: 1.8 },
  { id: 'boost_24h',  label: '24 horas', duracaoMs: 24  * 3600 * 1000, preco: 14.90, descricao: 'Destaque diário',         multiplicador: 2.5 },
  { id: 'boost_7d',   label: '7 dias',   duracaoMs: 7   * 86400 * 1000, preco: 69.90, descricao: 'Destaque semanal',        multiplicador: 3.5 },
  { id: 'boost_30d',  label: '30 dias',  duracaoMs: 30  * 86400 * 1000, preco: 199.90, descricao: 'Super destaque mensal',   multiplicador: 5 },
]

interface BoostStore {
  boosts: BoostEntry[]
  loaded: boolean
  init: () => void
  comprar: (productId: string, plano: BoostEntry['plano']) => BoostEntry
  isBoosted: (productId: string) => BoostEntry | null
  listAtivos: () => BoostEntry[]
  removerExpirados: () => void
}

const STORAGE_KEY = 'kiyvo_boosts'

function save(boosts: BoostEntry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(boosts)) } catch {}
}
function uid() { return 'bst-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }

export const useBoost = create<BoostStore>((set, get) => ({
  boosts: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const boosts = JSON.parse(raw) as BoostEntry[]
        // Limpa expirados na inicialização
        const now = Date.now()
        const validos = boosts.filter(b => new Date(b.expira).getTime() > now)
        set({ boosts: validos, loaded: true })
        save(validos)
      } else {
        set({ boosts: [], loaded: true })
      }
    } catch {
      set({ boosts: [], loaded: true })
    }
  },

  comprar: (productId, plano) => {
    const planoObj = BOOST_PLANOS.find(p => p.id === plano)
    if (!planoObj) throw new Error('Plano inválido')
    // Remove boost anterior do mesmo produto
    const semAntigo = get().boosts.filter(b => b.productId !== productId)
    const agora = Date.now()
    const entry: BoostEntry = {
      id: uid(),
      productId,
      plano,
      inicio: new Date(agora).toISOString(),
      expira: new Date(agora + planoObj.duracaoMs).toISOString(),
      pago: true,
    }
    const next = [entry, ...semAntigo]
    set({ boosts: next })
    save(next)
    return entry
  },

  isBoosted: (productId) => {
    get().removerExpirados()
    const b = get().boosts.find(x => x.productId === productId)
    if (!b) return null
    if (new Date(b.expira).getTime() <= Date.now()) return null
    return b
  },

  listAtivos: () => {
    get().removerExpirados()
    const now = Date.now()
    return get().boosts.filter(b => new Date(b.expira).getTime() > now)
  },

  removerExpirados: () => {
    const now = Date.now()
    const validos = get().boosts.filter(b => new Date(b.expira).getTime() > now)
    if (validos.length !== get().boosts.length) {
      set({ boosts: validos })
      save(validos)
    }
  },
}))
