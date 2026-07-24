'use client'
// Reviews store (persiste em localStorage)
// Clientes logados podem avaliar, comentar, postar fotos/vídeos/arquivos e dar like.
import { create } from 'zustand'

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number         // 1-5
  title: string
  body: string
  media: {
    fotos: string[]
    video?: string
    arquivos: { nome: string; url: string }[]
  }
  likes: string[]       // userIds
  verified: boolean
  recommends: boolean   // recomenda?
  createdAt: string
}

interface ReviewStore {
  reviews: Review[]
  loaded: boolean
  init: () => void
  add: (r: Omit<Review, 'id' | 'createdAt' | 'likes'>) => Review
  toggleLike: (reviewId: string, userId: string) => void
  listForProduct: (productId: string) => Review[]
  avgForProduct: (productId: string) => number
  countForProduct: (productId: string) => number
}

const STORAGE_KEY = 'kiyvo_reviews'

function save(r: Review[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)) } catch { /* noop */ } }
function uid() { return 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

// Reviews iniciais DEMO para produtos populares
const seedReviews: Omit<Review, 'id' | 'createdAt' | 'likes'>[] = [
  { productId: 'd-001', userId: 'demo', userName: 'Ana Souza', rating: 5, title: 'Muito bom!', body: 'Produto chegou certinho, exatamente como descrito. Recomendo demais!', media: { fotos: [], arquivos: [] }, verified: true, recommends: true },
  { productId: 'd-001', userId: 'demo2', userName: 'Carlos M.', rating: 4, title: 'Bom, mas...', body: 'Atendeu o esperado. Poderia ter mais material de apoio.', media: { fotos: [], arquivos: [] }, verified: true, recommends: true },
  { productId: 'd-007', userId: 'demo3', userName: 'Julia P.', rating: 5, title: 'Incrível!', body: 'Melhor curso que já comprei. O suporte responde rápido.', media: { fotos: [], arquivos: [] }, verified: true, recommends: true },
  { productId: 'd-015', userId: 'demo4', userName: 'Pedro R.', rating: 5, title: 'Recomendo!', body: 'Template salvou horas de trabalho, vale cada centavo.', media: { fotos: [], arquivos: [] }, verified: true, recommends: true },
]

export const useReviews = create<ReviewStore>((set, get) => ({
  reviews: [],
  loaded: false,
  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        set({ reviews: JSON.parse(raw) as Review[], loaded: true })
      } else {
        const seeded = seedReviews.map(s => ({ ...s, id: uid(), likes: [], createdAt: new Date(Date.now() - Math.random()*60*24*3600*1000).toISOString() } as Review))
        set({ reviews: seeded, loaded: true })
        save(seeded)
      }
    } catch { set({ reviews: [], loaded: true }) }
  },
  add: (r) => {
    const review: Review = { ...r, id: uid(), likes: [], createdAt: new Date().toISOString() }
    const next = [review, ...get().reviews]
    set({ reviews: next }); save(next); return review
  },
  toggleLike: (rid, uid) => {
    const next = get().reviews.map(r => {
      if (r.id !== rid) return r
      return { ...r, likes: r.likes.includes(uid) ? r.likes.filter(x => x !== uid) : [...r.likes, uid] }
    })
    set({ reviews: next }); save(next)
  },
  listForProduct: (pid) => get().reviews.filter(r => r.productId === pid).sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()),
  avgForProduct: (pid) => {
    const list = get().reviews.filter(r => r.productId === pid)
    if (!list.length) return 4.8
    return list.reduce((s, r) => s + r.rating, 0) / list.length
  },
  countForProduct: (pid) => get().reviews.filter(r => r.productId === pid).length,
}))
