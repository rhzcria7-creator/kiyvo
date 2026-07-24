'use client'
// Store de NOTIFICAÇÕES do usuário (persiste em localStorage).
// Eventos de compra, venda, KD Points ganhos, review recebida, seguidor, cupom, sistema.
// Comentários em PT-BR.
import { create } from 'zustand'

export type NotifTipo = 'compra' | 'venda' | 'review' | 'kd' | 'cupom' | 'sistema' | 'follow' | 'afiliado' | 'freela'

export interface Notificacao {
  id: string
  tipo: NotifTipo
  titulo: string
  mensagem: string
  link?: string
  criadaEm: string
  lida: boolean
  icone: string
}

interface NotifStore {
  items: Notificacao[]
  loaded: boolean
  unread: number
  init: () => void
  push: (n: Omit<Notificacao, 'id' | 'criadaEm' | 'lida'>) => void
  marcarLida: (id: string) => void
  marcarTodasLidas: () => void
  limpar: () => void
  listar: () => Notificacao[]
}

const STORAGE_KEY = 'kiyvo_notifications'
const MAX = 60

function save(list: Notificacao[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}
function uid() { return 'n-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5) }

function iconePorTipo(t: NotifTipo): string {
  const m: Record<NotifTipo, string> = {
    compra: '🛒', venda: '💰', review: '⭐', kd: '🏅', cupom: '🎟️',
    sistema: '🔔', follow: '❤️', afiliado: '🤝', freela: '💼',
  }
  return m[t] || '🔔'
}

// Seed inicial (boas-vindas)
const seed: Omit<Notificacao, 'id' | 'criadaEm' | 'lida'>[] = [
  { tipo: 'sistema', titulo: 'Bem-vindo à KIYVO!', mensagem: 'Sua conta foi criada. Explore produtos, lojas e a Kiya.', icone: '🎉', link: '/buscar' },
  { tipo: 'kd', titulo: '+150 KD Points de boas-vindas', mensagem: 'Você ganhou pontos para usar em descontos.', icone: '🏅', link: '/recompensas' },
  { tipo: 'cupom', titulo: 'Cupom BEMVINDO10', mensagem: 'Aproveite 10% de desconto na primeira compra.', icone: '🎟️', link: '/ofertas' },
]

export const useNotif = create<NotifStore>((set, get) => ({
  items: [],
  loaded: false,
  unread: 0,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      let items: Notificacao[]
      if (raw) {
        items = JSON.parse(raw)
      } else {
        const now = Date.now()
        items = seed.map((s, i) => ({
          ...s, id: uid(),
          criadaEm: new Date(now - i * 60000).toISOString(),
          lida: false,
        }))
      }
      set({
        items,
        loaded: true,
        unread: items.filter(x => !x.lida).length,
      })
      save(items)
    } catch { set({ loaded: true }) }
  },

  push: (n) => {
    const nn: Notificacao = {
      ...n,
      id: uid(),
      icone: n.icone || iconePorTipo(n.tipo),
      criadaEm: new Date().toISOString(),
      lida: false,
    }
    const next = [nn, ...get().items].slice(0, MAX)
    set({ items: next, unread: next.filter(x => !x.lida).length })
    save(next)
    // Tenta vibrar no mobile
    try { navigator.vibrate?.(50) } catch {}
  },

  marcarLida: (id) => {
    const next = get().items.map(x => x.id === id ? { ...x, lida: true } : x)
    set({ items: next, unread: next.filter(x => !x.lida).length })
    save(next)
  },

  marcarTodasLidas: () => {
    const next = get().items.map(x => ({ ...x, lida: true }))
    set({ items: next, unread: 0 })
    save(next)
  },

  limpar: () => { set({ items: [], unread: 0 }); save([]) },
  listar: () => get().items,
}))
