// ─────────────────────────────────────────────────────────────
// Robots.txt Dinâmico v0.0.1
// ─────────────────────────────────────────────────────────────

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiyvo.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/_next/',
          '/auth/',
          '/2fa/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
