// BannerForge Agent - Gerador deterministico de banners/logos em SVG.
// Converte para PNG via @resvg/resvg-js. Nao depende de rede externa.
import type { BannerRequest, BannerResult } from './types'

type Paleta = { primaria: string; secundaria: string; fundo: string; texto: string }

const PALETTES: Record<string, Paleta[]> = {
  jogos: [
    { primaria: '#7C3AED', secundaria: '#EC4899', fundo: '#0F172A', texto: '#FFFFFF' },
    { primaria: '#EF4444', secundaria: '#F59E0B', fundo: '#1F2937', texto: '#FFFFFF' },
    { primaria: '#06B6D4', secundaria: '#3B82F6', fundo: '#0B0F1A', texto: '#FFFFFF' },
  ],
  streaming: [
    { primaria: '#E50914', secundaria: '#000000', fundo: '#0B0B0B', texto: '#FFFFFF' },
    { primaria: '#1DB954', secundaria: '#191414', fundo: '#121212', texto: '#FFFFFF' },
  ],
  software: [
    { primaria: '#2563EB', secundaria: '#06B6D4', fundo: '#FAFAFA', texto: '#0F172A' },
    { primaria: '#8B5CF6', secundaria: '#EC4899', fundo: '#FFFFFF', texto: '#0F172A' },
  ],
  cursos: [
    { primaria: '#F59E0B', secundaria: '#EF4444', fundo: '#1E1B4B', texto: '#FFFFFF' },
    { primaria: '#10B981', secundaria: '#3B82F6', fundo: '#ECFDF5', texto: '#0F172A' },
  ],
  giftcards: [
    { primaria: '#10B981', secundaria: '#06B6D4', fundo: '#FFFFFF', texto: '#0F172A' },
    { primaria: '#F59E0B', secundaria: '#EF4444', fundo: '#FFFBEB', texto: '#0F172A' },
  ],
  marketing: [
    { primaria: '#EC4899', secundaria: '#8B5CF6', fundo: '#FFFFFF', texto: '#0F172A' },
  ],
  musica: [
    { primaria: '#10B981', secundaria: '#000000', fundo: '#052E16', texto: '#FFFFFF' },
  ],
  seguranca: [
    { primaria: '#0891B2', secundaria: '#1E40AF', fundo: '#0B0F1A', texto: '#FFFFFF' },
  ],
  produtividade: [
    { primaria: '#6366F1', secundaria: '#A855F7', fundo: '#FFFFFF', texto: '#0F172A' },
  ],
  templates: [
    { primaria: '#EC4899', secundaria: '#F59E0B', fundo: '#FFFFFF', texto: '#0F172A' },
  ],
  default: [
    { primaria: '#2563EB', secundaria: '#7C3AED', fundo: '#FAFAFA', texto: '#0F172A' },
    { primaria: '#0F172A', secundaria: '#2563EB', fundo: '#FAFAFA', texto: '#0F172A' },
    { primaria: '#2563EB', secundaria: '#10B981', fundo: '#0F172A', texto: '#FFFFFF' },
  ],
}

function pickPalette(cat?: string, idx = 0): Paleta {
  const key = (cat || 'default').toLowerCase()
  const list = PALETTES[key] || PALETTES.default
  return list[idx % list.length]
}

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function backgroundPattern(w: number, h: number, seed: number, prim: string, dark: boolean): string {
  const tipo = seed % 5
  const opacity = dark ? 0.15 : 0.08
  let dots = ''
  if (tipo === 0) {
    for (let x = 20; x < w; x += 40) {
      for (let y = 20; y < h; y += 40) {
        const r = 1.5 + (((x * y + seed) >>> 0) % 3)
        dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${prim}" opacity="${opacity}" />`
      }
    }
    return dots
  }
  if (tipo === 1) {
    let lines = ''
    for (let i = -h; i < w + h; i += 30) {
      lines += `<line x1="${i}" y1="0" x2="${i + h}" y2="${h}" stroke="${prim}" stroke-width="1" opacity="${opacity}" />`
    }
    return lines
  }
  if (tipo === 2) {
    return `<circle cx="${w * 0.15}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.4}" fill="${prim}" opacity="${opacity * 1.5}" /><circle cx="${w * 0.85}" cy="${h * 0.75}" r="${Math.min(w, h) * 0.35}" fill="${prim}" opacity="${opacity * 1.2}" />`
  }
  if (tipo === 3) {
    return `<rect x="0" y="0" width="${w * 0.3}" height="${h}" fill="${prim}" opacity="${opacity * 0.6}" /><rect x="${w * 0.85}" y="${h * 0.7}" width="${w * 0.2}" height="${h * 0.3}" fill="${prim}" opacity="${opacity}" />`
  }
  let paths = ''
  for (let i = 0; i < 3; i++) {
    const cx = ((seed * (i + 1)) >>> 0) % w
    const cy = ((seed * (i + 2)) >>> 0) % h
    paths += `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.3}" fill="${prim}" opacity="${opacity * 0.7}" />`
  }
  return paths
}

function wrapTextSvg(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur.trim())
      cur = w
    } else {
      cur = (cur + ' ' + w).trim()
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function generateLogoMark(title: string, color: string, cx: number, cy: number, size: number): string {
  const letter = title.trim().charAt(0).toUpperCase() || 'K'
  const r = size / 2
  return `<g transform="translate(${cx - r}, ${cy - r})"><rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${color}" /><text x="${size / 2}" y="${size * 0.68}" font-family="Inter, system-ui, sans-serif" font-size="${size * 0.62}" font-weight="900" fill="#FFFFFF" text-anchor="middle">${esc(letter)}</text><rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.18}" height="${size * 0.18}" rx="${size * 0.05}" fill="#FFFFFF" opacity="0.4" /></g>`
}

function buildHero(req: BannerRequest, w: number, h: number, pal: Paleta, seed: number): string {
  const maxChars = Math.max(10, Math.floor(w / 28))
  const titleLines = wrapTextSvg(req.titulo, maxChars)
  const titleSize = w < 500 ? Math.min(56, w / 10) : Math.min(88, w / 14)
  const lineH = titleSize * 1.1
  const startY = h * 0.38
  let titlesSvg = ''
  titleLines.forEach((ln, i) => {
    titlesSvg += `<text x="${w * 0.08}" y="${startY + i * lineH}" font-family="Inter, system-ui, sans-serif" font-size="${titleSize}" font-weight="900" fill="${pal.texto}" letter-spacing="-0.02em">${esc(ln)}</text>`
  })
  const subY = startY + titleLines.length * lineH + titleSize * 0.4
  const sub = req.subtitulo || 'Produto digital com entrega instantanea'
  const tag = req.categoria ? req.categoria.toUpperCase() : 'KIYVO'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${pal.fundo}" /><stop offset="100%" stop-color="${pal.primaria}" stop-opacity="0.15" /></linearGradient><linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${pal.primaria}" /><stop offset="100%" stop-color="${pal.secundaria}" /></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)" />${backgroundPattern(w, h, seed, pal.primaria, pal.texto === '#FFFFFF')}<rect x="${w * 0.08}" y="${h * 0.18}" width="120" height="36" rx="18" fill="${pal.primaria}" opacity="0.95" /><text x="${w * 0.08 + 60}" y="${h * 0.18 + 24}" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.1em">${esc(tag)}</text>${titlesSvg}<text x="${w * 0.08}" y="${subY}" font-family="Inter, sans-serif" font-size="${Math.max(16, w / 42)}" font-weight="500" fill="${pal.texto}" opacity="0.8">${esc(sub)}</text><rect x="${w * 0.08}" y="${subY + titleSize * 0.6}" width="220" height="56" rx="28" fill="url(#btnGrad)" /><text x="${w * 0.08 + 110}" y="${subY + titleSize * 0.6 + 35}" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">COMPRAR AGORA</text>${generateLogoMark(req.titulo, pal.secundaria, w * 0.82, h * 0.5, Math.min(w, h) * 0.35)}</svg>`
}

function buildQuadrado(req: BannerRequest, w: number, h: number, pal: Paleta, seed: number): string {
  const maxChars = Math.max(10, Math.floor(w / 22))
  const titleLines = wrapTextSvg(req.titulo, maxChars)
  const titleSize = Math.min(64, w / 8)
  const lineH = titleSize * 1.1
  const startY = h * 0.5
  let t = ''
  titleLines.forEach((ln, i) => {
    t += `<text x="${w / 2}" y="${startY + i * lineH}" font-family="Inter, sans-serif" font-size="${titleSize}" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.02em">${esc(ln)}</text>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${pal.primaria}" /><stop offset="100%" stop-color="${pal.secundaria}" /></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)" />${backgroundPattern(w, h, seed, '#FFFFFF', true)}${generateLogoMark(req.titulo, '#FFFFFF', w / 2, h * 0.28, w * 0.22)}${t}<text x="${w / 2}" y="${h * 0.88}" font-family="Inter, sans-serif" font-size="${Math.max(14, w / 32)}" font-weight="700" fill="#FFFFFF" opacity="0.9" letter-spacing="0.15em">KIYVO &bull; ENTREGA INSTANTANEA</text></svg>`
}

function buildStory(req: BannerRequest, w: number, h: number, pal: Paleta, seed: number): string {
  const maxChars = Math.max(10, Math.floor(w / 18))
  const titleLines = wrapTextSvg(req.titulo, maxChars)
  const titleSize = Math.min(72, w / 6)
  const lineH = titleSize * 1.1
  let t = ''
  titleLines.forEach((ln, i) => {
    t += `<text x="${w / 2}" y="${h * 0.5 + i * lineH}" font-family="Inter, sans-serif" font-size="${titleSize}" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.02em">${esc(ln)}</text>`
  })
  const sub = req.subtitulo ? `<text x="${w / 2}" y="${h * 0.5 + titleLines.length * lineH + 36}" font-family="Inter, sans-serif" font-size="22" font-weight="500" fill="#FFFFFF" opacity="0.85" text-anchor="middle">${esc(req.subtitulo)}</text>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${pal.fundo}" /><stop offset="60%" stop-color="${pal.primaria}" stop-opacity="0.8" /><stop offset="100%" stop-color="${pal.secundaria}" /></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)" />${backgroundPattern(w, h, seed, '#FFFFFF', true)}<rect x="24" y="56" width="90" height="32" rx="16" fill="#FFFFFF" opacity="0.2" /><text x="69" y="77" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.15em">KIYVO</text>${generateLogoMark(req.titulo, '#FFFFFF', w / 2, h * 0.28, w * 0.32)}${t}${sub}<rect x="40" y="${h - 160}" width="${w - 80}" height="68" rx="34" fill="#FFFFFF" /><text x="${w / 2}" y="${h - 116}" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="${pal.primaria}" text-anchor="middle">VER OFERTA</text><text x="${w / 2}" y="${h - 50}" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF" opacity="0.8" text-anchor="middle" letter-spacing="0.2em">KIYVO.COM.BR</text></svg>`
}

function buildLogo(req: BannerRequest, w: number, h: number, pal: Paleta): string {
  const letter = req.titulo.trim().charAt(0).toUpperCase() || 'K'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${pal.primaria}" /><stop offset="100%" stop-color="${pal.secundaria}" /></linearGradient></defs><rect width="${w}" height="${h}" rx="${w * 0.18}" fill="url(#lg)" /><text x="${w / 2}" y="${h * 0.68}" font-family="Inter, sans-serif" font-size="${w * 0.58}" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.03em">${esc(letter)}</text><rect x="${w * 0.12}" y="${w * 0.12}" width="${w * 0.2}" height="${w * 0.08}" rx="${w * 0.04}" fill="#FFFFFF" opacity="0.35" /></svg>`
}

function buildCard(req: BannerRequest, w: number, h: number, pal: Paleta, seed: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${pal.fundo}" /><stop offset="100%" stop-color="${pal.fundo}" /></linearGradient></defs><rect width="${w}" height="${h}" rx="32" fill="url(#bg)" /><rect x="0" y="0" width="${w}" height="${h * 0.55}" rx="32" fill="${pal.primaria}" /><rect x="0" y="${h * 0.55 - 32}" width="${w}" height="32" fill="${pal.fundo}" />${backgroundPattern(w, h * 0.55, seed, '#FFFFFF', true)}${generateLogoMark(req.titulo, '#FFFFFF', w / 2, h * 0.28, Math.min(w, h) * 0.2)}<text x="24" y="${h * 0.7}" font-family="Inter, sans-serif" font-size="${Math.max(18, w / 22)}" font-weight="900" fill="${pal.texto}">${esc(req.titulo)}</text>${req.subtitulo ? `<text x="24" y="${h * 0.7 + 26}" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="${pal.texto}" opacity="0.6">${esc(req.subtitulo)}</text>` : ''}<rect x="24" y="${h - 60}" width="72" height="32" rx="16" fill="${pal.primaria}" /><text x="60" y="${h - 39}" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">R$</text><text x="108" y="${h - 37}" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="${pal.texto}">A partir</text></svg>`
}

function buildAnuncio(req: BannerRequest, w: number, h: number, pal: Paleta, seed: number): string {
  const label = req.titulo.length > 38 ? req.titulo.slice(0, 38) + '...' : req.titulo
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${pal.primaria}" /><stop offset="100%" stop-color="${pal.secundaria}" /></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)" />${backgroundPattern(w, h, seed, '#FFFFFF', true)}<text x="16" y="${h / 2 + 6}" font-family="Inter, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF" letter-spacing="-0.01em">${esc(label)}</text><rect x="${w - 100}" y="10" width="84" height="30" rx="15" fill="#FFFFFF" /><text x="${w - 58}" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="${pal.primaria}" text-anchor="middle">KIYVO</text></svg>`
}

export function generateBannerSvg(req: BannerRequest, variantIdx = 0) {
  const estilo = req.estilo || 'hero'
  let w = req.largura || 1200
  let h = req.altura || 630
  if (estilo === 'quadrado') { w = req.largura || 1080; h = req.altura || 1080 }
  if (estilo === 'story') { w = req.largura || 1080; h = req.altura || 1920 }
  if (estilo === 'logo') { w = req.largura || 512; h = req.altura || 512 }
  if (estilo === 'card') { w = req.largura || 320; h = req.altura || 400 }
  if (estilo === 'anuncio') { w = req.largura || 320; h = req.altura || 50 }

  const seed = hashSeed(req.titulo + (req.categoria || '') + variantIdx)
  const pal: Paleta = req.cores && req.cores.primaria
    ? { primaria: req.cores.primaria, secundaria: req.cores.secundaria || req.cores.primaria, fundo: req.cores.fundo || '#FAFAFA', texto: '#0F172A' }
    : pickPalette(req.categoria, variantIdx)

  let svg = ''
  switch (estilo) {
    case 'quadrado': svg = buildQuadrado(req, w, h, pal, seed); break
    case 'story': svg = buildStory(req, w, h, pal, seed); break
    case 'logo': svg = buildLogo(req, w, h, pal); break
    case 'card': svg = buildCard(req, w, h, pal, seed); break
    case 'anuncio': svg = buildAnuncio(req, w, h, pal, seed); break
    default: svg = buildHero(req, w, h, pal, seed); break
  }
  return { svg, paleta: pal, width: w, height: h }
}

export async function renderBannerPng(req: BannerRequest, variantIdx = 0): Promise<BannerResult> {
  const { svg, paleta, width, height } = generateBannerSvg(req, variantIdx)
  const mod = await import('@resvg/resvg-js')
  const Resvg = mod.Resvg
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } })
  const pngData = resvg.render().asPng()
  return { png: pngData as Buffer, svg, width, height, paleta }
}
