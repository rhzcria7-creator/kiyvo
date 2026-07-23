import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/auth/context'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { ScrollProgress } from '@/components/ui/AdvancedAnimations'
import { CommandK, CommandKButton } from '@/components/ui/CommandK'
import ClickSpark from '@/components/ui/ClickSpark'
import { ReferralProvider } from '@/components/referral/ReferralProvider'
import { UpdateBanner } from '@/components/layout/UpdateBanner'

const KiyaWidget = dynamic(() => import('@/components/support/KiyaWidget'), { ssr: false })

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Kiyvo — Marketplace de Produtos Digitais',
    template: '%s | Kiyvo',
  },
  description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais. +1M usuários confiam na Kiyvo.',
  keywords: ['marketplace digital', 'produtos digitais', 'jogos', 'software', 'cursos online', 'e-books', 'templates', 'gift cards', 'licenças', 'streaming', 'APIs', 'domínios'],
  authors: [{ name: 'Kiyvo', url: BASE_URL }],
  creator: 'Kiyvo',
  publisher: 'Kiyvo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'Kiyvo',
    title: 'Kiyvo — Marketplace de Produtos Digitais',
    description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Kiyvo — Marketplace de Produtos Digitais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiyvo — Marketplace de Produtos Digitais',
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.svg',
    shortcut: '/favicon.svg',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Fontes — preload para performance (não bloqueia render) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        {/* Structured Data — JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Kiyvo',
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
              name: 'Kiyvo',
              url: BASE_URL,
              logo: `${BASE_URL}/logo-full.svg`,
              sameAs: [
                'https://twitter.com/kiyvo',
                'https://discord.gg/kiyvo',
                'https://youtube.com/@kiyvo',
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
      <body className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white antialiased selection:bg-brand-600 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <ClickSpark />
            <ScrollProgress />
            <UpdateBanner />
            <Header />
            <ReferralProvider />
            <div className="flex-1">{children}</div>
            <Footer />
            <KiyaWidget />
            <CommandK />
            <CommandKButton />
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
