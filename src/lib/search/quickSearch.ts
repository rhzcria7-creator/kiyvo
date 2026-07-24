'use client'
// QUICK SEARCH — busca instantânea sobre os 789 produtos.
// Executada client-side, sem chamada de rede. Com debounce.
// Comentários em PT-BR.
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'
import { STORES } from '@/lib/catalog/stores'

export interface QuickProduct {
  id: string
  slug: string
  titulo: string
  preco: number
  preco_de?: number | null
  categoria?: string
  vendedor_nome?: string
  emoji?: string
  gradient?: string
  rating?: number
  total_vendas?: number
}

const ALL: QuickProduct[] = [
  ...DEMO_PRODUCTS.map(p => ({
    id: p.id, slug: p.slug, titulo: p.titulo, preco: p.preco, preco_de: p.preco_de,
    categoria: p.categoria, vendedor_nome: p.vendedor_nome, emoji: p.emoji,
    gradient: p.gradient, rating: p.rating, total_vendas: p.total_vendas,
  })),
  ...GG_PRODUCTS.map(p => ({
    id: p.id, slug: p.slug, titulo: p.titulo, preco: p.preco, preco_de: p.preco_de,
    categoria: p.categoria, vendedor_nome: p.vendedor_nome, emoji: p.emoji,
    gradient: p.gradient, rating: p.rating, total_vendas: p.total_vendas,
  })),
  ...MEGA_PRODUCTS.map(p => ({
    id: p.id, slug: p.slug, titulo: p.titulo, preco: p.preco, preco_de: p.preco_de,
    categoria: p.categoria, vendedor_nome: p.vendedor_nome, emoji: p.emoji,
    gradient: p.gradient, rating: p.rating, total_vendas: p.total_vendas,
  })),
]

export interface QuickStore {
  id: string
  name: string
  handle: string
  category: string
  color: string
  logo: string
  rating: number
  verified: boolean
}

const STORES_ALL: QuickStore[] = STORES.map(s => ({
  id: s.id, name: s.name, handle: s.handle, category: s.category,
  color: s.color, logo: s.logo, rating: s.rating, verified: s.verified,
}))

export interface SearchResult {
  produtos: QuickProduct[]
  lojas: QuickStore[]
  sugestoes: string[]
  total: number
}

// Normaliza string (remove acentos, lowercase)
export function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Busca com ranking
export function quickSearch(query: string, limit = 6): SearchResult {
  const q = norm(query.trim())
  if (!q) return { produtos: [], lojas: [], sugestoes: [], total: 0 }

  const words = q.split(/\s+/).filter(w => w.length >= 2)
  if (words.length === 0) return { produtos: [], lojas: [], sugestoes: [], total: 0 }

  // Score por produto
  const scored = ALL.map(p => {
    const hay = norm(`${p.titulo} ${p.categoria || ''} ${p.vendedor_nome || ''}`)
    let score = 0
    for (const w of words) {
      if (hay.includes(w)) score += 3
      if (norm(p.titulo).startsWith(w)) score += 4
      if (norm(p.categoria || '').includes(w)) score += 1
    }
    // Bônus por popularidade (vendas/rating)
    score += Math.min(2, (p.total_vendas || 0) / 500)
    score += ((p.rating || 4) - 4) * 0.5
    return { p, score }
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score)

  const produtos = scored.slice(0, limit).map(x => x.p)

  // Lojas
  const lojas = STORES_ALL.filter(s => {
    const h = norm(`${s.name} ${s.category}`)
    return words.some(w => h.includes(w))
  }).slice(0, 3)

  // Sugestões de categorias/palavras
  const sugestoes: string[] = []
  const categorias = Array.from(new Set(ALL.map(p => p.categoria).filter(Boolean))) as string[]
  for (const c of categorias) {
    if (norm(c).includes(q) || words.some(w => norm(c).includes(w))) sugestoes.push(c)
    if (sugestoes.length >= 4) break
  }

  return { produtos, lojas, sugestoes, total: scored.length }
}

// Pega produtos em destaque (mais vendidos / melhor rating)
export function getTrending(limit = 8): QuickProduct[] {
  return [...ALL]
    .sort((a, b) => (b.total_vendas || 0) - (a.total_vendas || 0) || (b.rating || 0) - (a.rating || 0))
    .slice(0, limit)
}

export function getOfertas(limit = 12): QuickProduct[] {
  return [...ALL]
    .filter(p => p.preco_de && p.preco_de > p.preco)
    .map(p => ({ ...p, _pct: (p.preco_de! - p.preco) / p.preco_de! }))
    .sort((a: any, b: any) => b._pct - a._pct)
    .slice(0, limit) as QuickProduct[]
}

// Histórico de buscas
const HIST_KEY = 'kiyvo_search_history'
const HIST_MAX = 10

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addSearchHistory(term: string): void {
  try {
    const t = term.trim()
    if (t.length < 2) return
    const cur = getSearchHistory().filter(x => x.toLowerCase() !== t.toLowerCase())
    const next = [t, ...cur].slice(0, HIST_MAX)
    localStorage.setItem(HIST_KEY, JSON.stringify(next))
  } catch {}
}

export function clearSearchHistory(): void {
  try { localStorage.removeItem(HIST_KEY) } catch {}
}
