import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/auth/context'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { ScrollProgress } from '@/components/ui/AdvancedAnimations'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playdex.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Playdex — Marketplace de Produtos Digitais',
    template: '%s | Playdex',
  },
  description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais. +1M usuários confiam na Playdex.',
  keywords: ['marketplace digital', 'produtos digitais', 'jogos', 'software', 'cursos online', 'e-books', 'templates', 'gift cards', 'licenças', 'streaming', 'APIs', 'domínios'],
  authors: [{ name: 'Playdex', url: BASE_URL }],
  creator: 'Playdex',
  publisher: 'Playdex',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'Playdex',
    title: 'Playdex — Marketplace de Produtos Digitais',
    description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Playdex — Marketplace de Produtos Digitais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playdex — Marketplace de Produtos Digitais',
    description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards e muito mais.',
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Structured Data — JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Playdex',
              url: BASE_URL,
              description: 'Marketplace de produtos digitais — jogos, software, cursos, e-books, templates, gift cards e muito mais.',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE_URL}/buscar?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Playdex',
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              sameAs: [
                'https://twitter.com/playdex',
                'https://discord.gg/playdex',
                'https://youtube.com/@playdex',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                url: `${BASE_URL}/suporte`,
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <ScrollProgress />
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#0F172A',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'var(--font-display)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
