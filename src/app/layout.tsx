import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Playdex — Marketplace de Produtos Digitais',
  description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais. +1M usuários confiam na Playdex.',
  keywords: ['marketplace digital', 'produtos digitais', 'jogos', 'software', 'cursos online', 'e-books', 'templates', 'gift cards', 'licenças'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
