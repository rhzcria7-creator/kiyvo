'use client'

import { Hero } from '@/components/home/Hero'
import { CategoriesGrid } from '@/components/home/CategoriesGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Reviews } from '@/components/home/Reviews'
import { BlogSection } from '@/components/home/BlogSection'
import { PageTransition } from '@/components/shared/PageTransition'

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <CategoriesGrid />
      <FeaturedProducts />
      <Reviews />
      <BlogSection />

      {/* Trust banner */}
      <section className="py-16 bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { num: '1M+', label: 'Usuários ativos', sub: 'na plataforma' },
              { num: '500K+', label: 'Transações seguras', sub: 'realizadas' },
              { num: '4.8★', label: 'Avaliação média', sub: 'dos usuários' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display font-extrabold text-4xl text-white">{stat.num}</p>
                <p className="font-display font-semibold text-brand-400 mt-1">{stat.label}</p>
                <p className="text-sm text-surface-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
