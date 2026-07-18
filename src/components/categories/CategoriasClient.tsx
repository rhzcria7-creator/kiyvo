'use client'

// ─────────────────────────────────────────────────────────────
// CategoriasClient — Grid de categorias interativo
// Recebe dados via props do server component
// ─────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/shared/PageTransition'
import { AlertCircle, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string | null
  product_count: number
  is_featured: boolean
}

export function CategoriasClient({
  categories,
  error: initialError,
}: {
  categories: CategoryData[]
  error: string | null
}) {
  // Error state
  if (initialError) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">
            Todas as Categorias
          </h1>
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 dark:text-surface-400 text-sm">{initialError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm mt-2"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">
            Todas as Categorias
          </h1>
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FolderOpen size={32} className="text-surface-300" />
            <p className="text-surface-500 dark:text-surface-400 text-lg font-display font-bold">
              Nenhuma categoria disponível
            </p>
            <p className="text-surface-400 dark:text-surface-500 text-sm">
              Categorias serão adicionadas em breve.
            </p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">
          Todas as Categorias
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          Encontre ativos digitais de todos os tipos
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Card key={cat.id} delay={i * 0.03}>
              <Link href={`/categoria/${cat.slug}`} className="block group">
                <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      {cat.icon || '📦'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="font-display font-bold text-white text-sm">{cat.name}</h2>
                    <p className="text-xs text-white/70">{cat.product_count} anúncios</p>
                  </div>
                  {cat.is_featured && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-brand-500 text-white text-xs font-bold rounded-full">
                        ⭐
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
