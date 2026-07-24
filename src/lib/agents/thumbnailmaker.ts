// Agente ThumbnailMaker — gera recomendações de thumbnail (composição, cores, textos)
// e retorna um SVG base. Backend-only (usado por páginas de agentes)
export interface ThumbnailInput {
  titulo: string
  estilo?: 'youtube' | 'tiktok' | 'instagram_reels' | 'curso' | 'produto'
  corPrimaria?: string
  mostrarRosto?: boolean
  nicho?: string
}
export interface ThumbnailResult {
  svg: string
  paleta: { fundo: string; primaria: string; secundaria: string; texto: string }
  dicas: string[]
  textos: string[]
  elementos: Array<{ tipo: string; posicao: string; texto?: string; cor?: string }>
}

const NICHOS_PALETA: Record<string, { fundo: string; primaria: string; secundaria: string; texto: string }> = {
  marketing: { fundo: '#1E3A8A', primaria: '#FBBF24', secundaria: '#EF4444', texto: '#FFFFFF' },
  fitness: { fundo: '#000000', primaria: '#DC2626', secundaria: '#10B981', texto: '#FFFFFF' },
  beleza: { fundo: '#831843', primaria: '#F472B6', secundaria: '#FCD34D', texto: '#FFFFFF' },
  financas: { fundo: '#064E3B', primaria: '#10B981', secundaria: '#F59E0B', texto: '#FFFFFF' },
  tech: { fundo: '#0F172A', primaria: '#06B6D4', secundaria: '#8B5CF6', texto: '#FFFFFF' },
  educacao: { fundo: '#1E40AF', primaria: '#FBBF24', secundaria: '#F97316', texto: '#FFFFFF' },
  default: { fundo: '#0F172A', primaria: '#2563EB', secundaria: '#F59E0B', texto: '#FFFFFF' },
}

export function gerarThumbnail(input: ThumbnailInput): ThumbnailResult {
  const { titulo, estilo = 'youtube', corPrimaria, nicho = 'default' } = input
  const key = Object.keys(NICHOS_PALETA).find(k => nicho.toLowerCase().includes(k)) || 'default'
  const paleta = { ...NICHOS_PALETA[key] }
  if (corPrimaria) paleta.primaria = corPrimaria
  const w = estilo === 'tiktok' || estilo === 'instagram_reels' ? 480 : 1280
  const h = estilo === 'tiktok' || estilo === 'instagram_reels' ? 854 : 720
  const palavras = titulo.split(/\s+/).slice(0, 6).join(' ')
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${paleta.fundo}"/>
      <stop offset="100%" stop-color="${paleta.primaria}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.25}" fill="${paleta.secundaria}" opacity="0.3"/>
  <circle cx="${w * 0.15}" cy="${h * 0.85}" r="${Math.min(w, h) * 0.2}" fill="${paleta.primaria}" opacity="0.3"/>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="Inter, Arial, sans-serif"
        font-weight="900" font-size="${Math.floor(w / 12)}" fill="${paleta.texto}" stroke="#000" stroke-width="3" paint-order="stroke">
    ${palavras.slice(0, 30)}
  </text>
  <rect x="40" y="${h - 90}" width="${w - 80}" height="6" rx="3" fill="${paleta.texto}" opacity="0.3"/>
  <text x="50" y="${h - 40}" font-family="Inter, Arial" font-weight="800" font-size="28" fill="${paleta.texto}">KIYVO</text>
</svg>`.trim()
  const dicas = [
    'Use contraste forte (fundo escuro + texto claro, ou vice-versa).',
    'Coloque rosto/expressão de emoção (aumenta CTR em 40%+).',
    'Texto: máximo 6 palavras, fontes black/grossas.',
    'Uma seta ou círculo vermelho apontando para o ponto principal.',
    'Evite poluição: 1 rosto + 1 texto + 1 elemento gráfico.',
    'Teste 3 versões e compare CTR no painel do agente AB Tester.',
  ]
  const textos = [palavras, 'GRÁTIS!', '2025', 'PASSO A PASSO']
  const elementos = [
    { tipo: 'faixa_vermelha', posicao: 'topo-esquerda', texto: 'NOVO!', cor: paleta.secundaria },
    { tipo: 'circulo_amarelo', posicao: 'canto-inferior-direito', texto: `${Math.floor(Math.random() * 20) + 80}%`, cor: paleta.primaria },
    { tipo: 'seta', posicao: 'direita', texto: '→', cor: paleta.secundaria },
  ]
  return { svg, paleta, dicas, textos, elementos }
}
