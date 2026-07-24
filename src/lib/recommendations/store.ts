'use client'
// Store de RECOMENDAÇÕES da PLATAFORMA KIYVO (feedback público da empresa).
// Diferente de reviews de produto, aqui clientes avaliam a KIYVO como um todo,
// podem anexar fotos/vídeos/arquivos, dar like, seguir (somente logados),
// marcar como "recomenda" ou "não recomenda" e sugerir melhorias.
// Persiste em localStorage (kiyvo_platform_recs). Comentários em PT-BR.
import { create } from 'zustand'

export interface RecMedia {
  tipo: 'foto' | 'video' | 'arquivo'
  nome: string
  dataUrl: string
  sizeKb?: number
}

export interface PlatformRec {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number          // 1 a 5
  recommends: boolean     // recomenda a KIYVO?
  titulo: string
  corpo: string
  melhorias?: string      // sugestões de melhorias (opcional)
  categoria: 'comprador' | 'vendedor' | 'ambos'
  tags: string[]
  media: RecMedia[]
  likes: string[]         // userIds que deram like
  seguindo: boolean       // se o autor está seguindo a KIYVO
  createdAt: string
  approved: boolean
}

interface RecStore {
  recs: PlatformRec[]
  loaded: boolean
  init: () => void
  add: (r: Omit<PlatformRec, 'id' | 'createdAt' | 'approved' | 'likes'>) => PlatformRec
  remove: (id: string) => void
  toggleLike: (id: string, userId: string) => void
  listAprovadas: (categoria?: string) => PlatformRec[]
  stats: () => { total: number; media: number; recomendamPct: number; nps: number }
}

const STORAGE_KEY = 'kiyvo_platform_recs'
const MY_ID = 'me'

function save(list: PlatformRec[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch { /* noop */ }
}

function uid() { return 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

function seedInicial(): PlatformRec[] {
  const now = Date.now()
  const ago = (d: number) => new Date(now - d * 86400000).toISOString()
  return [
    {
      id: 'r-seed-1', userId: 'u-ana', userName: 'Ana Carolina',
      rating: 5, recommends: true, titulo: 'Vendi meu primeiro curso em 12 dias!',
      corpo: 'Achei que ia demorar meses para fazer a primeira venda, mas com o tráfego orgânico e a taxa zero da KIYVO eu consegui em menos de 2 semanas. Plataforma muito bem feita e sem enrolação.',
      categoria: 'vendedor', tags: ['primeira venda', 'taxa zero', 'suporte bom'], media: [],
      likes: ['u-bruna', 'u-caio', 'u-daniela'], seguindo: true, createdAt: ago(2), approved: true,
    },
    {
      id: 'r-seed-2', userId: 'u-bruno', userName: 'Bruno Ferreira',
      rating: 5, recommends: true, titulo: 'Comprei um pack de templates e recebi na hora',
      corpo: 'Entrega super rápida, o arquivo veio organizado e o vendedor respondeu minhas dúvidas em minutos. Muito melhor que os marketplaces que usei antes.',
      categoria: 'comprador', tags: ['entrega automática', 'rápido', 'qualidade'], media: [],
      likes: ['u-ana'], seguindo: true, createdAt: ago(5), approved: true,
    },
    {
      id: 'r-seed-3', userId: 'u-carla', userName: 'Carla Mendes',
      rating: 4, recommends: true, titulo: 'Ótima plataforma, só senti falta de app nativo',
      corpo: 'A experiência no mobile é muito boa, mas um app nativo ia ajudar bastante. No geral, curti muito, taxas justas e interface bonita.',
      melhorias: 'App nativo iOS/Android com notificações push.',
      categoria: 'ambos', tags: ['sugestão', 'mobile', 'taxas boas'], media: [],
      likes: [], seguindo: true, createdAt: ago(9), approved: true,
    },
    {
      id: 'r-seed-4', userId: 'u-diego', userName: 'Diego Souza',
      rating: 5, recommends: true, titulo: 'KYC foi chato mas necessário — me senti seguro',
      corpo: 'A verificação de identidade é bem completinha. Achei ótimo, pois como comprador eu sei que os vendedores são reais. Parabéns pela segurança.',
      categoria: 'comprador', tags: ['segurança', 'kyc', 'confiança'], media: [],
      likes: ['u-ana', 'u-bruno'], seguindo: true, createdAt: ago(14), approved: true,
    },
    {
      id: 'r-seed-5', userId: 'u-elena', userName: 'Elena Prado',
      rating: 5, recommends: true, titulo: 'Suporte me respondeu em 10 minutos no Telegram',
      corpo: 'Tive um problema com um download e o suporte me chamou no Telegram super rápido, resolveu em minutos. Adorei o atendimento humanizado.',
      categoria: 'ambos', tags: ['suporte', 'telegram', 'rápido'], media: [],
      likes: ['u-bruno', 'u-carla', 'u-diego'], seguindo: true, createdAt: ago(22), approved: true,
    },
  ]
}

export const usePlatformRecs = create<RecStore>((set, get) => ({
  recs: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      let recs: PlatformRec[] = raw ? JSON.parse(raw) : []
      if (!recs || recs.length === 0) {
        recs = seedInicial()
        save(recs)
      }
      set({ recs, loaded: true })
    } catch { set({ recs: seedInicial(), loaded: true }) }
  },

  add: (r) => {
    const rec: PlatformRec = {
      ...r, id: uid(), createdAt: new Date().toISOString(),
      approved: true, likes: [],
    }
    const next = [rec, ...get().recs]
    set({ recs: next }); save(next)
    return rec
  },

  remove: (id) => {
    const next = get().recs.filter(r => r.id !== id)
    set({ recs: next }); save(next)
  },

  toggleLike: (id, userId) => {
    const next = get().recs.map(r => {
      if (r.id !== id) return r
      const has = r.likes.includes(userId)
      return { ...r, likes: has ? r.likes.filter(u => u !== userId) : [...r.likes, userId] }
    })
    set({ recs: next }); save(next)
  },

  listAprovadas: (categoria) => {
    const list = get().recs.filter(r => r.approved)
    if (!categoria || categoria === 'todos') return list
    return list.filter(r => r.categoria === categoria)
  },

  stats: () => {
    const list = get().recs.filter(r => r.approved)
    const total = list.length
    const media = total === 0 ? 0 : list.reduce((s, r) => s + r.rating, 0) / total
    const rec = list.filter(r => r.recommends).length
    const detractors = list.filter(r => r.rating <= 2).length
    const promoters = list.filter(r => r.rating >= 5).length
    const nps = total === 0 ? 0 : Math.round(((promoters - detractors) / total) * 100)
    return { total, media: Math.round(media * 10) / 10, recomendamPct: total === 0 ? 0 : Math.round((rec / total) * 100), nps }
  },
}))
