import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return { name: 'KIYVO', short_name: 'KIYVO', description: 'Marketplace seguro de produtos digitais.', start_url: '/', display: 'standalone', background_color: '#FAFAFA', theme_color: '#2563EB', lang: 'pt-BR', icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }
}
