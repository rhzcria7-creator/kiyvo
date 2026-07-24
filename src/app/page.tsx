// ===========================================================================
// KIYVO — HOME (página inicial) v10
// Foco: SEO (palavras-chave BR), conversão, diferenciais, schema.org,
//        comparação honesta com concorrentes, call-to-actions claros,
//        mobile-first, Framer Motion, sem "cara de IA".
// ===========================================================================
import { Metadata } from 'next'
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
import { DailyDeals } from '@/components/home/DailyDeals'

export const metadata: Metadata = {
  title: 'KIYVO — O marketplace de tudo que é digital. 0% de taxa nas primeiras 5 mil vendas.',
  description:
    'Venda e compre produtos digitais, cursos, templates, serviços e freelances na KIYVO. Taxa Zero nas primeiras 5.000 vendas, saque em 1 dia via PIX, 200+ agentes de IA gratuitos. O marketplace mais justo do Brasil.',
  keywords: [
    'marketplace produtos digitais brasil',
    'vender cursos online brasil',
    'hotmart alternativa',
    'kiwify alternativa',
    'monetizze alternativa',
    'eduzz alternativa',
    'plataforma vender infoproduto',
    'plataforma de afiliados brasil',
    'taxa baixa vender curso',
    'kiyvo',
    'freelance digital brasil',
    'produtos digitais',
    'copyscape, templates, plugins, cursos',
  ],
  alternates: { canonical: 'https://kiyvo.com.br' },
  openGraph: {
    title: 'KIYVO — Marketplace justo de produtos digitais (0% nas primeiras 5 mil vendas)',
    description:
      'Venda cursos, templates e serviços digitais com a menor taxa do Brasil. Saque em 1 dia, 200+ agentes de IA gratuitos, e sem pegadinhas.',
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
    <>
      <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] overflow-x-hidden">
        {/* JSON-LD Organization + Website + Product */}
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
                  sameAs: ['https://www.instagram.com/kiyvo.oficial', 'https://x.com/kiyvo'],
                  description: 'Marketplace brasileiro de produtos digitais com taxa justa.',
                  founder: { '@type': 'Person', name: 'KIYVO' },
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
                {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  reviewCount: '2147',
                  itemReviewed: { '@type': 'Organization', name: 'KIYVO' },
                },
              ],
            }),
          }}
        />

        <HomeHero />
        <HomeNumeros />
        <DailyDeals />
        <TrendingNow />
        <FeaturedProductsV2 />
        <HomeCategories />
        <HomeCompradores />
        <HomeDoisPublicos />
        <RecentlyViewed />
        <HomeDiferenciais />
        <HomeComoFunciona />
        <HomeParaQuem />
        <HomeComparativo />
        <HomeAgentes />
        <HomeFAQ />
        <HomeCTA />
      </main>
    </>
  )
}
