// ─────────────────────────────────────────────────────────────
// Open Graph Image Generator v0.0.1 — OG images dinâmicas
// Gera imagens para compartilhamento em redes sociais
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'KIYVO — Marketplace de Produtos Digitais'
  const description = searchParams.get('description') || 'Compre e venda tudo que é digital com a menor taxa do Brasil.'
  const type = searchParams.get('type') || 'default'

  // Em produção: usar @vercel/og ou resvg para gerar imagem real
  // Aqui: retornamos HTML que será renderizado como imagem pelo Vercel OG

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Accent shapes -->
  <circle cx="1100" cy="100" r="200" fill="url(#accent)" opacity="0.1"/>
  <circle cx="100" cy="500" r="150" fill="url(#accent)" opacity="0.08"/>
  
  <!-- Logo -->
  <text x="60" y="100" font-family="system-ui, sans-serif" font-size="32" font-weight="800" fill="white">KIYVO</text>
  
  <!-- Title -->
  <text x="60" y="220" font-family="system-ui, sans-serif" font-size="56" font-weight="800" fill="white" width="800">
    ${escapeXml(title)}
  </text>
  
  <!-- Description -->
  <text x="60" y="320" font-family="system-ui, sans-serif" font-size="24" fill="#94a3b8" width="700">
    ${escapeXml(description)}
  </text>
  
  <!-- Features -->
  <rect x="60" y="400" rx="8" width="180" height="40" fill="#1e293b"/>
  <text x="100" y="426" font-family="system-ui, sans-serif" font-size="16" fill="#22c55e" font-weight="600">● Taxa Zero 5K</text>
  
  <rect x="270" y="400" rx="8" width="180" height="40" fill="#1e293b"/>
  <text x="310" y="426" font-family="system-ui, sans-serif" font-size="16" fill="#3b82f6" font-weight="600">● Saque 1 Dia</text>
  
  <rect x="480" y="400" rx="8" width="220" height="40" fill="#1e293b"/>
  <text x="520" y="426" font-family="system-ui, sans-serif" font-size="16" fill="#a855f7" font-weight="600">● 200+ Agentes IA</text>
  
  <!-- URL -->
  <text x="60" y="560" font-family="system-ui, sans-serif" font-size="20" fill="#64748b">kiyvo.com.br</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
