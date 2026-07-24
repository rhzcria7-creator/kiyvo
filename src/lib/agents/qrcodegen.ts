// Agente QRGenerator — gera QR Code visual estilizado (SVG com logo KIYVO central)
// Para QR real legível, recomenda-se a biblioteca "qrcode" no backend.
export interface QRInput {
  texto: string
  tamanho?: number
  corPrimaria?: string
  corFundo?: string
}
export interface QRResult {
  svg: string
  textoOriginal: string
  dica: string
}

export function gerarQRInspirado(input: QRInput): QRResult {
  const { texto, tamanho = 200, corPrimaria = '#0F172A', corFundo = '#FFFFFF' } = input
  const cells = 21
  const cellSize = tamanho / cells
  let seed = 0
  for (let i = 0; i < texto.length; i++) seed = (seed * 31 + texto.charCodeAt(i)) >>> 0
  function rnd(x: number, y: number) {
    const v = Math.sin(seed + x * 374.761 + y * 938.57) * 10000
    return v - Math.floor(v)
  }
  let rects = ''
  function addFinder(ox: number, oy: number) {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      const borda = i === 0 || i === 6 || j === 0 || j === 6
      const centro = i >= 2 && i <= 4 && j >= 2 && j <= 4
      if (borda || centro) {
        rects += `<rect x="${ox + i * cellSize}" y="${oy + j * cellSize}" width="${cellSize}" height="${cellSize}" fill="${corPrimaria}"/>`
      }
    }
  }
  addFinder(0, 0)
  addFinder((cells - 7) * cellSize, 0)
  addFinder(0, (cells - 7) * cellSize)
  for (let x = 0; x < cells; x++) for (let y = 0; y < cells; y++) {
    const inFinder = (x < 8 && y < 8) || (x >= cells - 8 && y < 8) || (x < 8 && y >= cells - 8)
    const inLogo = x >= 8 && x <= 12 && y >= 8 && y <= 12
    if (inFinder || inLogo) continue
    if (rnd(x, y) > 0.55) {
      rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${corPrimaria}"/>`
    }
  }
  const cx = tamanho / 2
  const cy = tamanho / 2
  const logoR = cellSize * 2.5
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}">
  <rect width="${tamanho}" height="${tamanho}" fill="${corFundo}" rx="${tamanho * 0.05}" ry="${tamanho * 0.05}"/>
  ${rects}
  <circle cx="${cx}" cy="${cy}" r="${logoR + cellSize}" fill="${corFundo}"/>
  <circle cx="${cx}" cy="${cy}" r="${logoR}" fill="${corPrimaria}"/>
  <text x="${cx}" y="${cy + cellSize * 0.8}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="${cellSize * 2.2}" fill="${corFundo}">K</text>
</svg>`.trim()
  return {
    svg,
    textoOriginal: texto,
    dica: 'QR estético KIYVO para demonstração visual. QR real é gerado via Stripe/PagSeguro no checkout.',
  }
}
