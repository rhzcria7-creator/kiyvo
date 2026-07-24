import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kiyvo — Marketplace de Produtos Digitais',
    short_name: 'Kiyvo',
    description: 'O marketplace de TUDO que é digital no Brasil. Compre e venda jogos, software, cursos, gift cards e mais.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#2563EB',
    lang: 'pt-BR',
    orientation: 'portrait',
    icons: [
      { src: `${BASE_URL}/favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
      { src: `${BASE_URL}/logo.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    categories: ['shopping', 'business', 'productivity'],
  }
}
