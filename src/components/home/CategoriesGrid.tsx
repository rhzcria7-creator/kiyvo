'use client'

import Link from 'next/link'
import Image from 'next/image'
import { mockCategories } from '@/data/mockCategories'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function CategoriesGrid() {
  const featured = mockCategories.filter(c => c.featured)

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900">
              Categorias Populares
            </h2>
            <p className="mt-1 text-surface-500 text-sm">Encontre os produtos digitais mais negociados</p>
          </div>
          <Link
            href="/categorias"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors font-display"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featured.map((category, i) => (
            <Card key={category.id} delay={i * 0.05} hover3d>
              <Link href={`/categoria/${category.slug}`} className="block group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5">
                      {category.icon && <span className="text-base">{category.icon}</span>}
                      <h3 className="font-display font-bold text-white text-sm truncate">{category.name}</h3>
                    </div>
                    <p className="text-xs text-white/70">{category.productCount} anúncios</p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>

        <Link
          href="/categorias"
          className="sm:hidden flex items-center justify-center gap-1 mt-4 text-sm font-semibold text-brand-600"
        >
          Ver todas as categorias <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
