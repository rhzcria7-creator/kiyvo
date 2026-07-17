// robots.txt para SEO
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/conta/',
          '/admin/',
          '/checkout/',
          '/configuracoes',
          '/verificacao',
          '/anunciar',
          '/favoritos',
          '/chat',
          '/disputas',
          '/notificacoes',
          '/historico',
          '/assinatura',
          '/perfil',
          '/recompensas',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
