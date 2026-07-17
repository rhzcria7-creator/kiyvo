import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playdex.com.br'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Playdex — Marketplace de Produtos Digitais',
    short_name: 'Playdex',
    description: 'Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards e muito mais.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#2563EB',
    orientation: 'portrait-primary',
    icons: [
      {
        src: `${BASE_URL}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${BASE_URL}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: `${BASE_URL}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'business', 'lifestyle'],
    lang: 'pt-BR',
    dir: 'ltr',
  }
}
