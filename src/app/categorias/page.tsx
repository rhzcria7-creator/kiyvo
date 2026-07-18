'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/shared/PageTransition'
import { Loader2, AlertCircle, FolderOpen } from 'lucide-react'

interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string | null
  product_count: number
  is_featured: boolean
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/v1/categories?limit=50')
        if (!res.ok) throw new Error('Erro ao carregar categorias')
        const data = await res.json()
        setCategories(data.categories || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-2">Todas as Categorias</h1>
        <p className="text-surface-500 mb-8">Encontre ativos digitais de todos os tipos</p>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando categorias...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-2">Tentar novamente</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FolderOpen size={32} className="text-surface-300" />
            <p className="text-surface-500 text-lg font-display font-bold">Nenhuma categoria disponível</p>
            <p className="text-surface-400 text-sm">Categorias serão adicionadas em breve.</p>
          </div>
        )}

        {/* Categories grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <Card key={cat.id} delay={i * 0.03}>
                <Link href={`/categoria/${cat.slug}`} className="block group">
                  <div className="relative aspect-square overflow-hidden bg-surface-100">
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
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
