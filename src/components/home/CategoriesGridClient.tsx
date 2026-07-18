'use client'

// ─────────────────────────────────────────────────────────────
// CategoriesGridClient — Renderiza grid de categorias
// Recebe dados via props do server component
// ─────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string | null
  product_count: number
  is_active: boolean
}

export function CategoriesGridClient({ categories }: { categories: Category[] }) {
  const featured = categories.filter(c => c.is_active).slice(0, 8)

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
              Categorias Populares
            </h2>
            <p className="mt-1 text-surface-500 dark:text-surface-400 text-sm">Encontre os produtos digitais mais negociados</p>
          </div>
          <Link
            href="/categorias"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors font-display"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((category, i) => (
              <Card key={category.id} delay={i * 0.05} hover3d>
                <Link href={`/c/${category.slug}`} className="block group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-brand-800/20 flex items-center justify-center">
                        <span className="text-4xl">{category.icon || '📦'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5">
                        {category.icon && <span className="text-base">{category.icon}</span>}
                        <h3 className="font-display font-bold text-white text-sm truncate">{category.name}</h3>
                      </div>
                      <p className="text-xs text-white/70">{category.product_count || 0} anúncios</p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📦</p>
            <p className="font-display font-bold text-surface-900 dark:text-white">Categorias em construção</p>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Em breve todas as categorias estarão disponíveis</p>
          </div>
        )}
      </div>
    </section>
  )
}
