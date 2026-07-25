// ─────────────────────────────────────────────────────────────
// KIYVO — Lookup server-safe do catálogo
//
// Em modo local/demo, a home, busca e lojas exibem produtos dos
// catálogos (DEMO, GGMAX, MEGA) que NÃO existem no LocalDB. Para
// que o checkout consiga finalizar a compra de QUALQUER produto
// (corrigindo o "resto nada"), este módulo resolve um produto do
// catálogo pelo id, sem depender do navegador.
//
// Comentários em PT-BR.
// ─────────────────────────────────────────────────────────────

import { DEMO_PRODUCTS } from './demoProducts'
import { GG_PRODUCTS } from './ggmaxProducts'
import { MEGA_PRODUCTS } from './megaCatalog'

export interface CatalogProductLite {
  id: string
  slug: string
  titulo: string
  descricao_curta: string
  descricao: string
  preco: number
  preco_de: number | null
  categoria: string
  vendedor_nome: string
  vendor_id: string
  imagem_capa: string | null
  rating: number
  total_vendas: number
  total_reviews: number
  boost: boolean
  created_at: string
}

function normalize(p: Record<string, unknown>): CatalogProductLite {
  const precoDe = p.preco_de
  return {
    id: String(p.id ?? ''),
    slug: String(p.slug || p.id || ''),
    titulo: String(p.titulo || 'Produto KIYVO'),
    descricao_curta: String(p.descricao_curta || ''),
    descricao: String(p.descricao || ''),
    preco: Number(p.preco || 0),
    preco_de: precoDe ? Number(precoDe) : null,
    categoria: String(p.categoria || 'outro'),
    vendedor_nome: String(p.vendedor_nome || 'Vendedor KIYVO'),
    vendor_id: String(p.vendor_id || ''),
    imagem_capa: p.imagem_capa ? String(p.imagem_capa) : null,
    rating: Number(p.rating || 4.8),
    total_vendas: Number(p.total_vendas || 0),
    total_reviews: Number(p.total_reviews || 0),
    boost: Boolean(p.boost),
    created_at: String(p.created_at || new Date().toISOString()),
  }
}

let cache: CatalogProductLite[] | null = null

function all(): CatalogProductLite[] {
  if (cache) return cache
  cache = [
    ...(DEMO_PRODUCTS as unknown as Record<string, unknown>[]).map(normalize),
    ...(GG_PRODUCTS as unknown as Record<string, unknown>[]).map(normalize),
    ...(MEGA_PRODUCTS as unknown as Record<string, unknown>[]).map(normalize),
  ]
  return cache
}

// Busca um produto do catálogo pelo id (ex.: "d-001", "gg-...", "mega-...").
export function getCatalogProductById(id: string): CatalogProductLite | null {
  if (!id) return null
  return all().find((p) => p.id === id) ?? null
}
