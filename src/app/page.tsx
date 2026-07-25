// ─────────────────────────────────────────────────────────────
// KIYVO HOME v0.0.1 — Bento Grid + FlashSale + Trending + DailyDeals
// Apple/Linear taste: oklch gradients, glassmorphism, framer motion
// ─────────────────────────────────────────────────────────────

import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import BentoGrid from '@/components/ui/BentoGrid'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeDiferenciais } from '@/components/home/HomeDiferenciais'
import { HomeComparativo } from '@/components/home/HomeComparativo'
import { HomeComoFunciona } from '@/components/home/HomeComoFunciona'
import { HomeParaQuem } from '@/components/home/HomeParaQuem'
import { HomeNumeros } from '@/components/home/HomeNumeros'
import { HomeAgentes } from '@/components/home/HomeAgentes'
import { HomeFAQ } from '@/components/home/HomeFAQ'
import { HomeCTA } from '@/components/home/HomeCTA'
import { HomeDoisPublicos } from '@/components/home/HomeDoisPublicos'
import { FeaturedProductsV2 } from '@/components/home/FeaturedProductsV2'
import { HomeCategories } from '@/components/home/HomeCategories'
import { HomeCompradores } from '@/components/home/HomeCompradores'
import { RecentlyViewed } from '@/components/home/RecentlyViewed'
import { TrendingNow } from '@/components/home/TrendingNow'

const DailyDeals = dynamic(() => import('@/components/home/DailyDeals'), { ssr: false })
const FlashSaleBar = dynamic(() => import('@/components/home/FlashSaleBar'), { ssr: false })

export const metadata: Metadata = {
  title: 'KIYVO — Marketplace de Produtos Digitais | Taxa Zero nas primeiras 5K',
  description: 'Venda e compre produtos digitais, cursos, templates, serviços. Taxa Zero nas primeiras 5.000 vendas, saque em 1 dia via PIX, 200+ agentes de IA.',
  keywords: ['marketplace produtos digitais', 'vender cursos online', 'hotmart alternativa', 'kiwify alternativa', 'taxa baixa vender curso', 'kiyvo'],
  alternates: { canonical: 'https://kiyvo.com.br' },
  openGraph: {
    title: 'KIYVO — Marketplace justo de produtos digitais (0% nas primeiras 5 mil vendas)',
    description: 'Venda cursos, templates e serviços digitais com a menor taxa do Brasil. Saque em 1 dia.',
    url: 'https://kiyvo.com.br',
    siteName: 'KIYVO',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'KIYVO' }],
  },
  robots: { index: true, follow: true },
}

export default function HomePage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] overflow-x-hidden">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: 'KIYVO',
                url: 'https://kiyvo.com.br',
                logo: 'https://kiyvo.com.br/logo-full.svg',
                description: 'Marketplace brasileiro de produtos digitais com taxa justa.',
              },
              {
                '@type': 'WebSite',
                name: 'KIYVO',
                url: 'https://kiyvo.com.br',
                inLanguage: 'pt-BR',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://kiyvo.com.br/buscar?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
            ],
          }),
        }}
      />

      <HomeHero />
      <FlashSaleBar />

      {/* Bento Grid Home - 12 cols */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <BentoGrid
          cards={[
            {
              id: 'stats',
              size: 'lg',
              children: (
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">KIYVO em Números</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                      { label: 'Usuários', value: '1M+' },
                      { label: 'Produtos', value: '789+' },
                      { label: 'Vendedores', value: '12K+' },
                      { label: 'Taxa Média', value: '3.5%' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              id: 'daily-deals',
              size: 'lg',
              children: (
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Ofertas do Dia</h2>
                    <span className="text-xs text-zinc-400">12 maiores descontos</span>
                  </div>
                  <DailyDeals />
                </div>
              ),
            },
            {
              id: 'trending',
              size: 'xl',
              rowSpan: 2,
              gradient: true,
              children: (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">🔥 Trending Now</h2>
                  <TrendingNow />
                </div>
              ),
            },
            {
              id: 'featured',
              size: 'full',
              children: (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">⭐ Destaques</h2>
                  <FeaturedProductsV2 />
                </div>
              ),
            },
            {
              id: 'categories',
              size: 'md',
              children: (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Categorias</h2>
                  <HomeCategories />
                </div>
              ),
            },
            {
              id: 'how-it-works',
              size: 'md',
              children: (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Como Funciona</h2>
                  <HomeComoFunciona />
                </div>
              ),
            },
            {
              id: 'testimonials',
              size: 'lg',
              children: (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">O que dizem</h2>
                  <HomeCompradores />
                </div>
              ),
            },
            {
              id: 'diferenciais',
              size: 'full',
              gradient: true,
              children: (
                <div className="p-6 md:p-8">
                  <HomeDiferenciais />
                </div>
              ),
            },
            {
              id: 'agentes',
              size: 'full',
              children: (
                <div className="p-6 md:p-8">
                  <HomeAgentes />
                </div>
              ),
            },
            {
              id: 'faq',
              size: 'lg',
              children: (
                <div className="p-6 md:p-8">
                  <HomeFAQ />
                </div>
              ),
            },
            {
              id: 'cta',
              size: 'full',
              children: (
                <HomeCTA />
              ),
            },
          ]}
        />
      </section>

      <HomeNumeros />
      <HomeDoisPublicos />
      <RecentlyViewed />
      <HomeComparativo />
      <HomeParaQuem />
    </main>
  )
}
