import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Playdex — Marketplace de Ativos Digitais para Jogos',
  description: 'Compre e venda contas, keys, itens, gold e gift cards com total segurança. +1M jogadores confiam na Playdex.',
  keywords: ['jogos', 'contas', 'keys', 'steam', 'valorant', 'minecraft', 'marketplace'],
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
