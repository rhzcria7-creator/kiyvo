// ─────────────────────────────────────────────────────────────
// Categorias Metadata — SEO para listagem de categorias
// ─────────────────────────────────────────────────────────────

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorias — Explore todos os produtos digitais',
  description: 'Encontre jogos, software, cursos, e-books, templates, gift cards e muito mais. Navegue por categorias no marketplace KIYVO.',
  openGraph: {
    title: 'Categorias de Produtos Digitais — KIYVO',
    description: 'Explore todas as categorias de produtos digitais no marketplace KIYVO',
    url: 'https://kiyvo.com/categorias',
  },
}

export default function CategoriasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
