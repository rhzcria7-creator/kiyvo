/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js'],
  },
  webpack: (config) => {
    return config
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // CDN legado Playdex (mantido para compatibilidade com assets antigos)
      { protocol: 'https', hostname: 'cdn.playdex.com.br' },
      // CDN oficial KIYVO
      { protocol: 'https', hostname: 'cdn.kiyvo.com.br' },
      { protocol: 'https', hostname: 'ytiyqkliojawihfnlwzo.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },

  // Redirects permanentes de rotas legadas (rebrand Playdex → Kiyvo / PD Points → KD Points)
  async redirects() {
    return [
      {
        source: '/tutorial/pd-points',
        destination: '/tutorial/kd-points',
        permanent: true,
      },
      {
        source: '/tutorial/pd-points/:path*',
        destination: '/tutorial/kd-points/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
