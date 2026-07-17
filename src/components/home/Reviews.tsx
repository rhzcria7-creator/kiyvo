// ─────────────────────────────────────────────────────────────
// Reviews — Avaliações reais do Supabase
// Busca reviews mais recentes, zero mock
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

interface Review {
  id: string
  user_name: string
  avatar_url: string | null
  rating: number
  comment: string
  product_title: string
  created_at: string
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/v1/reviews?limit=8')
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch {
        // Erro silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  // Formata data relativa
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 30) return `${diffDays}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  if (!loading && reviews.length === 0) {
    return null // Não mostra seção se não há reviews
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white mb-2">
          Avaliações Recentes
        </h2>
        <p className="text-surface-500 dark:text-surface-400 text-sm mb-8">O que nossos usuários estão dizendo</p>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="min-w-[280px] sm:min-w-[320px] card-base p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-24" />
                    <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-16" />
                  </div>
                </div>
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-full mb-2" />
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-2/3" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
            {reviews.map((review, i) => (
              <Card key={review.id} delay={i * 0.08} className="min-w-[280px] sm:min-w-[320px] snap-start shrink-0">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {review.avatar_url ? (
                      <img src={review.avatar_url} alt={review.user_name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                          {review.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white font-display">{review.user_name}</p>
                      <p className="text-xs text-surface-400">{formatRelativeTime(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} className={j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-300'} />
                    ))}
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{review.comment}</p>
                  <p className="mt-2 text-xs text-surface-400 font-medium">Comprou: {review.product_title}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
