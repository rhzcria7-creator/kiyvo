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
      { protocol: 'https', hostname: 'cdn.playdex.com.br' },
      { protocol: 'https', hostname: 'cdn.kiyvo.com.br' },
      { protocol: 'https', hostname: 'ytiyqkliojawihfnlwzo.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://js.stripe.com https://m.stripe.network",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.stripe.com https://api.stripe.com wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "media-src 'self' https:",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Content Type Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Frame Options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=(self)',
            ].join(', '),
          },
        ],
      },
    ]
  },

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
