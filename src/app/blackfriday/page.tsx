import type { Metadata } from 'next'
import BlackFridayClient from './BlackFridayClient'

export const metadata: Metadata = {
  title: 'Black Friday KIYVO 2026 — Até 50% OFF em produtos digitais | KIYVO',
  description: 'Black Friday KIYVO 2026: até 60% OFF em cursos, templates, plugins, e-books e mais. Ofertas reais, sem pegadinhas.',
  keywords: ['black friday', 'black friday cursos', 'black friday ki-yvo'],
  alternates: { canonical: 'https://kiyvo.com.br/blackfriday' },
  openGraph: { title: 'Black Friday KIYVO 2026', description: 'Até 60% OFF', url: 'https://kiyvo.com.br/blackfriday', type: 'website' },
}

export default function Page() { return <BlackFridayClient /> }
