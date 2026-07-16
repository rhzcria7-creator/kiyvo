'use client'

import Link from 'next/link'
import Image from 'next/image'
import { mockCategories } from '@/data/mockCategories'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/shared/PageTransition'

export default function CategoriasPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-2">Todas as Categorias</h1>
        <p className="text-surface-500 mb-8">Encontre ativos digitais para o seu jogo favorito</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mockCategories.map((cat, i) => (
            <Card key={cat.id} delay={i * 0.03}>
              <Link href={`/categoria/${cat.slug}`} className="block group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="font-display font-bold text-white text-sm">{cat.name}</h2>
                    <p className="text-xs text-white/70">{cat.productCount} anúncios</p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
