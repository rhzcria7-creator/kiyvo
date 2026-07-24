'use client'
// KIYVO Shorts — rede social integrada (estilo Instagram/TikTok)
// Posts (fotos, vídeos, arquivos, texto), likes, comentários, seguir, repostar, denunciar.
import { create } from 'zustand'

export interface ShortComment {
  id: string
  userId: string
  userName: string
  body: string
  createdAt: string
  likes: string[]
}

export interface Short {
  id: string
  userId: string
  userName: string
  userHandle: string
  avatarEmoji: string
  verified?: boolean
  type: 'foto' | 'video' | 'texto' | 'arquivo'
  conteudo?: string       // base64 foto/video URL
  texto: string
  produtoRef?: string     // slug de produto vinculado
  likes: string[]
  comments: ShortComment[]
  reposts: string[]       // userIds que repostaram
  repostOf?: string       // id do short original (se repost)
  tags: string[]
  createdAt: string
}

interface Follow { userId: string; since: string }

interface ShortsStore {
  shorts: Short[]
  follows: Follow[]
  saved: string[]        // shortIds salvos
  loaded: boolean
  init: () => void
  create: (s: Omit<Short, 'id'|'createdAt'|'likes'|'comments'|'reposts'>) => Short
  like: (shortId: string, userId: string) => void
  comment: (shortId: string, userId: string, userName: string, body: string) => void
  follow: (userId: string) => void
  unfollow: (userId: string) => void
  isFollowing: (userId: string) => boolean
  repost: (shortId: string, userId: string, userName: string, userHandle: string, avatarEmoji: string) => void
  save: (shortId: string) => void
  feedForUser: (userId: string) => Short[]
  trending: () => Short[]
}

const STORAGE_KEY = 'kiyvo_shorts'
const FOLLOW_KEY = 'kiyvo_shorts_follows'
const SAVED_KEY = 'kiyvo_shorts_saved'
const MY_USER_ID = 'me' // usuário local (sem backend)

function saveItems(key: string, data: unknown) { try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* noop */ } }
function loadItems<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function uid() { return 's-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
function cid() { return 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4) }

// Shorts seed iniciais (p/ a rede parecer viva)
const SEED_SHORTS: Short[] = [
  { id: 's-1', userId: 's-digitalflow', userName: 'DigitalFlow', userHandle: '@digitalflow', avatarEmoji: '⚡', verified: true, type: 'texto', texto: 'Dica do dia: nunca venda sem um cupom de desconto ativo — mesmo que seja 5%. Converte 3x mais! 🚀', likes: ['u1','u2','u3'], comments: [{ id: 'c1', userId: 'u2', userName: 'João', body: 'Fato!', createdAt: new Date(Date.now()-3600_000).toISOString(), likes: [] }], reposts: [], tags: ['vendas','marketing'], createdAt: new Date(Date.now()-2*3600_000).toISOString() },
  { id: 's-2', userId: 's-copykings', userName: 'CopyKings', userHandle: '@copykings', avatarEmoji: '✍️', verified: true, type: 'texto', texto: 'Novo pack de copys de Black Friday disponível na loja 🎯 link no perfil.', likes: ['u1','u4'], comments: [], reposts: [], tags: ['copywriting','bf'], createdAt: new Date(Date.now()-5*3600_000).toISOString() },
  { id: 's-3', userId: 's-ai-lab', userName: 'AI Lab', userHandle: '@ailab', avatarEmoji: '🧠', verified: true, type: 'texto', texto: 'O Copiloto KIYVO gera copys 2x mais rápido com inteligência artificial. Gratuito com o plano free. 🤖', likes: ['u3','u2','u1','u5'], comments: [], reposts: [], tags: ['ia','copiloto'], createdAt: new Date(Date.now()-8*3600_000).toISOString() },
  { id: 's-4', userId: 's-cursostop', userName: 'CursosTop', userHandle: '@cursostop', avatarEmoji: '🎓', verified: true, type: 'texto', texto: 'Alunos do nosso curso já faturaram mais de R$2,3M em produtos digitais em 2025. O segredo? Consistência.', likes: ['u1','u2','u3','u4','u6'], comments: [], reposts: [], tags: ['curso','resultados'], createdAt: new Date(Date.now()-12*3600_000).toISOString() },
  { id: 's-5', userId: 's-templatehub', userName: 'TemplateHub BR', userHandle: '@templatehub', avatarEmoji: '🎨', verified: true, type: 'texto', texto: 'Pack novo de 500 templates Canva já está no ar 🎨 (50% OFF nas próximas 24h!)', likes: ['u2','u7'], comments: [], reposts: [], tags: ['templates','canva'], createdAt: new Date(Date.now()-20*3600_000).toISOString() },
]

export const useShorts = create<ShortsStore>((set, get) => ({
  shorts: [],
  follows: [],
  saved: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    const shorts = loadItems<Short[]>(STORAGE_KEY, SEED_SHORTS)
    const follows = loadItems<Follow[]>(FOLLOW_KEY, [])
    const saved = loadItems<string[]>(SAVED_KEY, [])
    set({ shorts, follows, saved, loaded: true })
  },

  create: (s) => {
    const short: Short = { ...s, id: uid(), likes: [], comments: [], reposts: [], createdAt: new Date().toISOString() }
    const next = [short, ...get().shorts]
    set({ shorts: next }); saveItems(STORAGE_KEY, next); return short
  },

  like: (sid, uid) => {
    const next = get().shorts.map(s => s.id === sid ? { ...s, likes: s.likes.includes(uid) ? s.likes.filter(x=>x!==uid) : [...s.likes, uid] } : s)
    set({ shorts: next }); saveItems(STORAGE_KEY, next)
  },

  comment: (sid, uid, uname, body) => {
    const c: ShortComment = { id: cid(), userId: uid, userName: uname, body, createdAt: new Date().toISOString(), likes: [] }
    const next = get().shorts.map(s => s.id === sid ? { ...s, comments: [...s.comments, c] } : s)
    set({ shorts: next }); saveItems(STORAGE_KEY, next)
  },

  follow: (userId) => {
    if (get().follows.some(f => f.userId === userId)) return
    const next = [...get().follows, { userId, since: new Date().toISOString() }]
    set({ follows: next }); saveItems(FOLLOW_KEY, next)
  },
  unfollow: (userId) => {
    const next = get().follows.filter(f => f.userId !== userId)
    set({ follows: next }); saveItems(FOLLOW_KEY, next)
  },
  isFollowing: (uid) => get().follows.some(f => f.userId === uid),

  repost: (sid, userId, uname, handle, avatar) => {
    const original = get().shorts.find(s => s.id === sid)
    if (!original) return
    const repost: Short = {
      id: uid(), userId: userId, userName: uname, userHandle: handle, avatarEmoji: avatar,
      type: 'texto', texto: `🔄 Repostado: ${original.texto}`, likes: [], comments: [],
      reposts: [], repostOf: sid, tags: original.tags,
      createdAt: new Date().toISOString(),
    }
    // incrementa reposts do original
    const next = get().shorts.map(s => s.id === sid ? { ...s, reposts: [...s.reposts, userId] } : s)
    set({ shorts: [repost, ...next] }); saveItems(STORAGE_KEY, [repost, ...next])
  },

  save: (sid) => {
    const next = get().saved.includes(sid) ? get().saved.filter(x=>x!==sid) : [...get().saved, sid]
    set({ saved: next }); saveItems(SAVED_KEY, next)
  },

  feedForUser: () => {
    const followed = get().follows.map(f => f.userId)
    // Meus posts + seguidos + lojas seed sempre aparecem
    const mine = get().shorts.filter(s => followed.includes(s.userId) || s.userId === MY_USER_ID || s.userId.startsWith('s-'))
    return mine.length ? mine : get().trending()
  },
  trending: () => [...get().shorts].sort((a,b) => b.likes.length + b.comments.length*2 - (a.likes.length + a.comments.length*2)),
}))

export { MY_USER_ID }
