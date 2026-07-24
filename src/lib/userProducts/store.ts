'use client'
// Store de produtos criados pelo usuário (persiste em localStorage)
// v10.6: suporta mídia (capa, fotos, vídeo, banner, arquivos), múltiplas categorias,
// flags IA, estado do produto (ativo/pausado), tags.
import { create } from 'zustand'

export type ProdutoEstado = 'ativo' | 'pausado' | 'rascunho'
export type IALevel = 'sem_ia' | 'ajudou_ia' | 'feito_com_ia' | '100_ia'

export interface ProdutoArquivo {
  nome: string
  tipo: string
  sizeKb?: number
  dataUrl: string // base64 (em produção: URL do storage)
}

export interface ProdutoMidia {
  capa?: string           // base64 da capa
  banner?: string         // base64 do banner (16:5)
  fotos: string[]         // galeria (até 8 fotos)
  videoUrl?: string       // URL de vídeo (YouTube/MP4 externo)
  arquivos: ProdutoArquivo[] // arquivos para download (até 5)
}

export interface UserProduct {
  id: string
  slug: string
  titulo: string
  descricao_curta: string
  descricao: string
  preco: number
  preco_de: number | null
  categoria: string                // categoria principal (legado)
  categorias: string[]             // até 5 categorias
  tipo: string
  vendedor_nome: string
  gradient: string
  emoji: string
  imagem_capa: string | null
  midia: ProdutoMidia
  rating: number
  total_reviews: number
  total_vendas: number
  boost: boolean
  estado: ProdutoEstado
  ia_level: IALevel
  predominancia: 'brasil' | 'internacional' | null
  tags: string[]
  created_at: string
  updated_at: string
  user_id: string
}

const STORAGE_KEY = 'kiyvo_user_products'

const GRADIENTS = [
  'from-orange-400 to-red-500',
  'from-purple-500 to-pink-600',
  'from-blue-500 to-cyan-700',
  'from-emerald-400 to-green-700',
  'from-amber-400 to-orange-600',
  'from-pink-500 to-rose-700',
  'from-indigo-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-teal-400 to-emerald-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-400 to-indigo-600',
  'from-rose-400 to-red-600',
]

export const CATEGORIAS_VALIDAS = [
  'marketing','curso','copywriting','templates','ebook','software','planilhas',
  'design','social','saude','financas','beleza','gastronomia','juridico',
  'produtividade','prompts','video','pack','outro',
]

// Schema de criação — campos novos são opcionais para backward compatibility
type CreateInput = {
  titulo: string
  descricao_curta?: string
  descricao: string
  preco: number
  preco_de?: number | null
  categoria: string
  categorias?: string[]
  vendedor_nome: string
  emoji?: string
  gradient?: string
  estado?: ProdutoEstado
  ia_level?: IALevel
  predominancia?: 'brasil' | 'internacional' | null
  tags?: string[]
  midia?: Partial<ProdutoMidia>
}

interface UProductStore {
  products: UserProduct[]
  loaded: boolean
  init: () => void
  create: (data: CreateInput) => UserProduct
  update: (id: string, patch: Partial<UserProduct>) => void
  remove: (id: string) => void
  setEstado: (id: string, estado: ProdutoEstado) => void
}

function save(p: UserProduct[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch (e) {
    // localStorage cheio: remove arquivos grandes mais antigos
    console.warn('localStorage cheio, ignorando mídia grande')
  }
}

// Lê produtos diretamente do localStorage (síncrono, para uso em helpers de fusão)
export function getAllUserProductsSync(): UserProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserProduct[]) : []
  } catch { return [] }
}

function uid() {
  return 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80)
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random()*arr.length)]
}

// Comprime imagem para base64
async function compressImageFile(file: File, maxDim = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim/width, maxDim/height)
          width = Math.round(width*ratio); height = Math.round(height*ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no ctx'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const useUserProducts = create<UProductStore>((set, get) => ({
  products: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const products = raw ? (JSON.parse(raw) as UserProduct[]) : []
      // Back compat: adiciona campos novos em produtos antigos
      const migrated = products.map(p => ({
        ...p,
        categorias: p.categorias || (p.categoria ? [p.categoria] : ['outro']),
        midia: p.midia || { fotos: [], arquivos: [], capa: p.imagem_capa || undefined },
        estado: p.estado || 'ativo',
        ia_level: p.ia_level || 'sem_ia',
        predominancia: p.predominancia || null,
        tags: p.tags || [],
        updated_at: p.updated_at || p.created_at,
      }))
      set({ products: migrated, loaded: true })
    } catch {
      set({ products: [], loaded: true })
    }
  },

  create: (data) => {
    const id = uid()
    const slug = slugify(data.titulo) + '-' + id.slice(-4)
    const cats = (data.categorias && data.categorias.length > 0
      ? data.categorias.filter(c => CATEGORIAS_VALIDAS.includes(c)).slice(0, 5)
      : [CATEGORIAS_VALIDAS.includes(data.categoria) ? data.categoria : 'outro'])
    const now = new Date().toISOString()
    const newProduct: UserProduct = {
      id,
      slug,
      titulo: data.titulo.slice(0, 120),
      descricao_curta: (data.descricao_curta || data.descricao).slice(0, 180),
      descricao: data.descricao.slice(0, 65000), // 65k caracteres (pedido)
      preco: Math.max(1, Math.min(99999, Number(data.preco) || 0)),
      preco_de: data.preco_de ? Math.max(Number(data.preco_de) || 0, Number(data.preco)+0.01) : null,
      categoria: cats[0],
      categorias: cats,
      tipo: 'produto_usuario',
      vendedor_nome: data.vendedor_nome.slice(0, 60) || 'Você',
      emoji: data.emoji || '✨',
      gradient: data.gradient || pickRandom(GRADIENTS),
      imagem_capa: data.midia?.capa || null,
      midia: {
        capa: data.midia?.capa,
        banner: data.midia?.banner,
        fotos: data.midia?.fotos || [],
        videoUrl: data.midia?.videoUrl,
        arquivos: data.midia?.arquivos || [],
      },
      rating: 5.0,
      total_reviews: 0,
      total_vendas: 0,
      boost: true,
      estado: data.estado || 'ativo',
      ia_level: data.ia_level || 'sem_ia',
      predominancia: data.predominancia || null,
      tags: data.tags || [],
      created_at: now,
      updated_at: now,
      user_id: 'local-user',
    }
    const next = [newProduct, ...get().products]
    set({ products: next })
    save(next)
    return newProduct
  },

  update: (id, patch) => {
    const next = get().products.map(p => p.id === id ? { ...p, ...patch, updated_at: new Date().toISOString() } : p)
    set({ products: next })
    save(next)
  },

  setEstado: (id, estado) => {
    get().update?.(id, { estado })
    const next = get().products.map(p => p.id === id ? { ...p, estado, updated_at: new Date().toISOString() } : p)
    set({ products: next })
    save(next)
  },

  remove: (id) => {
    const next = get().products.filter(p => p.id !== id)
    set({ products: next })
    save(next)
  },
}))

export { compressImageFile }
