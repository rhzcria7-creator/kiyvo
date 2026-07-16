'use client'

import { mockReviews } from '@/data/mockReviews'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function Reviews() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 mb-2">
          Avaliações Recentes
        </h2>
        <p className="text-surface-500 text-sm mb-8">O que nossos usuários estão dizendo</p>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {mockReviews.map((review, i) => (
            <Card key={review.id} delay={i * 0.08} className="min-w-[280px] sm:min-w-[320px] snap-start shrink-0">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-surface-900 font-display">{review.user}</p>
                    <p className="text-xs text-surface-400">{review.createdAt}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-surface-600 leading-relaxed">{review.comment}</p>
                <p className="mt-2 text-xs text-surface-400 font-medium">Comprou: {review.product}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
