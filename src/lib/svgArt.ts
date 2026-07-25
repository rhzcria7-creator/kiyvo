// ─────────────────────────────────────────────────────────────
// KIYVO — Gerador de arte SVG (capas, banners e avatares)
//
// Gera SVGs determinísticos e bonitos para produtos e vendedores
// quando não há foto real. Assim o marketplace NUNCA fica com
// visual vazio/"parceiro de IA": todo produto e toda loja ganham
// uma capa, um banner e um avatar com a identidade KIYVO.
//
// Comentários em PT-BR. Código/identificadores em EN.
// ─────────────────────────────────────────────────────────────

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// Paleta de gradientes KIYVO (pares de HSL agradáveis, jamais "AI genérico")
const PALETTES: Array<[number, number]> = [
  [255, 199], [18, 280], [330, 265], [200, 145], [160, 95],
  [25, 340], [300, 220], [140, 25], [190, 265], [350, 30],
  [220, 160], [275, 200], [15, 145], [95, 200], [320, 260],
]

export function pickHue(seed: string): [number, number] {
  return PALETTES[hashString(seed) % PALETTES.length]
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function toDataUri(svg: string): string {
  // Remove quebras de linha para compactar e evita caracteres problemáticos.
  const cleaned = svg.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim()
  return `data:image/svg+xml,${encodeURIComponent(cleaned)}`
}

function emojiFor(categoria?: string): string {
  const map: Record<string, string> = {
    marketing: '📈', copywriting: '✍️', planilhas: '📊', templates: '🎨',
    social: '📱', vendas: '💰', mentoria: '🎯', software: '⚙️',
    ebook: '📖', curso: '📚', saude: '💪', financas: '💹', design: '🎨',
    video: '🎥', afiliados: '🤝', beleza: '💄', gastronomia: '🍳',
    tecnologia: '💻', juridico: '⚖️', produtividade: '⏰', profissionais: '🧑‍⚕️',
    prompts: '🤖', servico: '🛎️', consultoria: '🧭', pack: '📦',
    script: '📝', idiomas: '🌍', livros: '📚', desenvolvimento: '🧑‍💻',
    streaming: '📺', musica: '🎵', giftcards: '🎁', jogos: '🎮',
    assinaturas: '⭐', seguranca: '🛡️', templatesv: '🎨',
  }
  return (categoria && map[categoria.toLowerCase()]) || '✨'
}

// ── CAPA DE PRODUTO (400x300) ──────────────────────────────
export function productCoverDataUri(opts: {
  title?: string
  emoji?: string
  categoria?: string
  seed?: string
}): string {
  const seed = opts.seed || opts.title || opts.categoria || 'kiyvo'
  const [h1, h2] = pickHue(seed)
  const emoji = opts.emoji || emojiFor(opts.categoria)
  const label = esc((opts.categoria || '').toUpperCase())
  const title = esc((opts.title || '').slice(0, 34))
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${h1},85%,58%)"/>
        <stop offset="1" stop-color="hsl(${h2},80%,46%)"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="22%" r="80%">
        <stop offset="0" stop-color="rgba(255,255,255,0.55)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <rect width="400" height="300" fill="url(#r)"/>
    <circle cx="330" cy="250" r="120" fill="rgba(0,0,0,0.12)"/>
    <circle cx="60" cy="40" r="70" fill="rgba(255,255,255,0.12)"/>
    <text x="200" y="155" font-size="96" text-anchor="middle" dominant-baseline="central">${esc(emoji)}</text>
    <text x="20" y="32" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="2">KIYVO</text>
    ${label ? `<rect x="20" y="252" width="${Math.min(220, label.length * 11 + 24)}" height="30" rx="15" fill="rgba(0,0,0,0.30)"/>
    <text x="34" y="272" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="800" fill="#fff" letter-spacing="1">${label}</text>` : ''}
    ${title ? `<text x="20" y="40" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" fill="#fff">${title}</text>` : ''}
  </svg>`
  return toDataUri(svg)
}

// ── BANNER DE LOJA/VENDEDOR (1200x320) ─────────────────────
export function vendorBannerDataUri(opts: {
  name?: string
  categoria?: string
  seed?: string
}): string {
  const seed = opts.seed || opts.name || 'kiyvo'
  const [h1, h2] = pickHue(seed + 'banner')
  const name = esc(opts.name || 'Loja KIYVO')
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" width="1200" height="320" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${h1},82%,56%)"/>
        <stop offset="1" stop-color="hsl(${h2},78%,42%)"/>
      </linearGradient>
      <radialGradient id="br" cx="78%" cy="30%" r="80%">
        <stop offset="0" stop-color="rgba(255,255,255,0.45)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="320" fill="url(#b)"/>
    <rect width="1200" height="320" fill="url(#br)"/>
    <circle cx="980" cy="60" r="220" fill="rgba(255,255,255,0.10)"/>
    <circle cx="1060" cy="280" r="160" fill="rgba(0,0,0,0.10)"/>
    <g transform="translate(80,120)">
      <rect x="0" y="0" width="64" height="64" rx="18" fill="rgba(255,255,255,0.95)"/>
      <text x="32" y="44" font-size="38" text-anchor="middle" font-family="Arial" font-weight="900" fill="hsl(${h1},80%,45%)">K</text>
      <text x="84" y="34" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="800" fill="rgba(255,255,255,0.95)" letter-spacing="3">KIYVO</text>
      <text x="0" y="118" font-family="Arial,Helvetica,sans-serif" font-size="46" font-weight="900" fill="#fff">${name}</text>
      <text x="2" y="160" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.85)">Produtos digitais · Entrega imediata · Compra protegida</text>
    </g>
  </svg>`
  return toDataUri(svg)
}

// ── AVATAR DE VENDEDOR (200x200) ───────────────────────────
export function vendorAvatarDataUri(opts: { name?: string; seed?: string }): string {
  const seed = opts.seed || opts.name || 'kiyvo'
  const [h1, h2] = pickHue(seed + 'avatar')
  const initials = esc(
    (opts.name || 'K')
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'K',
  )
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${h1},80%,58%)"/>
        <stop offset="1" stop-color="hsl(${h2},78%,44%)"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#a)"/>
    <circle cx="160" cy="40" r="70" fill="rgba(255,255,255,0.12)"/>
    <text x="100" y="118" font-size="84" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" fill="#fff">${initials}</text>
  </svg>`
  return toDataUri(svg)
}

// ── LOGO KIYVO (512x512) ───────────────────────────────────
export function kiyvoLogoDataUri(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7C3AED"/>
        <stop offset="1" stop-color="#4F46E5"/>
      </linearGradient>
    </defs>
    <rect x="56" y="56" width="400" height="400" rx="110" fill="url(#lg)"/>
    <text x="256" y="340" font-size="260" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" fill="#fff">K</text>
  </svg>`
  return toDataUri(svg)
}
