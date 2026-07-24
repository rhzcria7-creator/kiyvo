'use client'
// Helper que mescla produtos da API com produtos criados pelo usuário no localStorage
// para que produtos publicados pelo formulario de /anunciar apareçam instantaneamente no catálogo.
import { getAllUserProductsSync } from '@/lib/userProducts/store'
import type { Product } from '@/components/ProductCard'

export function mergeUserProducts(products: Product[]): Product[] {
  try {
    const user = getAllUserProductsSync()
    if (!user.length) return products
    const userAsProduct: Product[] = user.map((u) => ({
      id: u.id,
      slug: u.slug,
      titulo: u.titulo,
      descricao_curta: u.descricao_curta,
      preco: u.preco,
      preco_de: u.preco_de,
      categoria: u.categoria,
      tipo: u.tipo,
      vendedor_nome: u.vendedor_nome,
      gradient: u.gradient,
      emoji: u.emoji,
      imagem_capa: u.imagem_capa || u.midia?.capa || null,
      rating: u.rating,
      total_reviews: u.total_reviews,
      total_vendas: u.total_vendas,
      boost: true, // novos produtos ganham destaque automático
    }))
    return [...userAsProduct, ...products]
  } catch {
    return products
  }
}
