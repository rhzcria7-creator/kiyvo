// ─────────────────────────────────────────────────────────────
// SeoScore - Auditoria SEO de paginas/produtos (0-100)
// Analisa titulo, descricao, headings, keywords, imagens, links,
// tamanho, CTAs, emojis e retorna correcoes pontuais.
// ─────────────────────────────────────────────────────────────

export interface SeoScoreInput {
  titulo: string
  descricao: string
  preco?: number
  imagens?: number
  bullets?: string[]
  categoria?: string
  tags?: string[]
}

export interface SeoCheck {
  categoria: 'titulo' | 'descricao' | 'imagens' | 'palavras-chave' | 'preco' | 'bullets' | 'emoji'
  pontuacao: number  // 0-10 por item
  status: 'ok' | 'aviso' | 'ruim'
  mensagem: string
  sugestao?: string
}

export interface SeoScoreResult {
  score: number
  nota: 'excelente' | 'bom' | 'medio' | 'ruim' | 'critico'
  checks: SeoCheck[]
  resumo: string
  topKeywords: string[]
  emojisRecomendados: string[]
  sugestaoTitulo: string
  sugestaoDescricao: string
}

const EMOJIS_POR_CATEGORIA: Record<string, string[]> = {
  jogos: ['🎮', '🔥', '🏆', '⚡'],
  software: ['💻', '⚡', '🔑', '🚀'],
  cursos: ['📚', '🎓', '✅', '📈'],
  streaming: ['🎬', '📺', '🎵', '⭐'],
  giftcards: ['🎁', '💳', '💰', '🎉'],
  templates: ['🎨', '✨', '📱', '🖼️'],
  ia: ['🤖', '🧠', '⚡', '✨'],
  default: ['🚀', '✅', '⭐', '🔥'],
}

export function analyzeSeo(input: SeoScoreInput): SeoScoreResult {
  const checks: SeoCheck[] = []

  // 1. Título
  const tl = input.titulo.length
  if (tl >= 30 && tl <= 60) checks.push({ categoria: 'titulo', pontuacao: 10, status: 'ok', mensagem: `Título tem ${tl} caracteres (faixa ideal 30-60).` })
  else if (tl < 15) checks.push({ categoria: 'titulo', pontuacao: 2, status: 'ruim', mensagem: `Título muito curto (${tl} chars).`, sugestao: 'Título deve ter entre 30-60 caracteres com benefício principal.' })
  else if (tl > 70) checks.push({ categoria: 'titulo', pontuacao: 4, status: 'aviso', mensagem: `Título longo (${tl} chars)`, sugestao: 'Reduza para 60 caracteres ou menos (corta no Google).' })
  else checks.push({ categoria: 'titulo', pontuacao: 6, status: 'aviso', mensagem: `Título ok mas pode melhorar (${tl} chars).` })

  // 2. Descrição
  const dl = input.descricao.length
  if (dl >= 400 && dl <= 2000) checks.push({ categoria: 'descricao', pontuacao: 10, status: 'ok', mensagem: `Descrição com ${dl} caracteres (ideal).` })
  else if (dl < 100) checks.push({ categoria: 'descricao', pontuacao: 1, status: 'ruim', mensagem: `Descrição muito curta (${dl} chars).`, sugestao: 'Adicione pelo menos 400 caracteres com bullets, benefícios e FAQ.' })
  else if (dl < 400) checks.push({ categoria: 'descricao', pontuacao: 5, status: 'aviso', mensagem: `Descrição curta (${dl} chars).`, sugestao: 'Expandir para 400-2000 caracteres para melhor SEO.' })
  else checks.push({ categoria: 'descricao', pontuacao: 7, status: 'aviso', mensagem: `Descrição pode otimizar (${dl} chars).` })

  // 3. Imagens
  const imgs = input.imagens || 0
  if (imgs >= 3) checks.push({ categoria: 'imagens', pontuacao: 10, status: 'ok', mensagem: `${imgs} imagens (bom).` })
  else if (imgs === 0) checks.push({ categoria: 'imagens', pontuacao: 1, status: 'ruim', mensagem: 'Sem imagens.', sugestao: 'Adicione pelo menos 3 imagens (capa + detalhes + prova social).' })
  else checks.push({ categoria: 'imagens', pontuacao: 5, status: 'aviso', mensagem: `Apenas ${imgs} imagem(ns).`, sugestao: 'Mínimo 3 imagens para confiança.' })

  // 4. Keywords
  const kws = (input.tags || []).length
  if (kws >= 5) checks.push({ categoria: 'palavras-chave', pontuacao: 10, status: 'ok', mensagem: `${kws} tags.` })
  else if (kws === 0) checks.push({ categoria: 'palavras-chave', pontuacao: 2, status: 'ruim', mensagem: 'Sem tags.', sugestao: 'Adicione 5-10 tags relevantes.' })
  else checks.push({ categoria: 'palavras-chave', pontuacao: 5, status: 'aviso', mensagem: `Apenas ${kws} tags.` })

  // 5. Preço
  if (input.preco && input.preco > 0) checks.push({ categoria: 'preco', pontuacao: 10, status: 'ok', mensagem: 'Preço definido.' })
  else checks.push({ categoria: 'preco', pontuacao: 2, status: 'ruim', mensagem: 'Preço não informado.', sugestao: 'Defina o preço (obrigatório para anúncio vivo).' })

  // 6. Bullets
  const bs = (input.bullets || []).length
  if (bs >= 4) checks.push({ categoria: 'bullets', pontuacao: 10, status: 'ok', mensagem: `${bs} bullets.` })
  else if (bs === 0) checks.push({ categoria: 'bullets', pontuacao: 2, status: 'ruim', mensagem: 'Sem bullets.', sugestao: 'Adicione 4-6 bullets destacando benefícios.' })
  else checks.push({ categoria: 'bullets', pontuacao: 5, status: 'aviso', mensagem: `Apenas ${bs} bullets.` })

  // 7. Emoji
  // Detecta emojis via código de pontos
  const textoCompleto = input.titulo + ' ' + input.descricao
  let hasEmoji = false
  for (let i = 0; i < textoCompleto.length; i++) {
    const cp = textoCompleto.codePointAt(i) || 0
    if ((cp >= 0x1F300 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF) || (cp >= 0x1F900 && cp <= 0x1F9FF)) {
      hasEmoji = true; break
    }
  }
  if (hasEmoji) checks.push({ categoria: 'emoji', pontuacao: 8, status: 'ok', mensagem: 'Emojis presentes (ajudam CTR em redes).' })
  else checks.push({ categoria: 'emoji', pontuacao: 4, status: 'aviso', mensagem: 'Sem emojis no título/descrição.', sugestao: 'Emojis aumentam CTR em ~15%.' })

  // Score final
  const total = checks.reduce((s, c) => s + c.pontuacao, 0)
  const max = checks.length * 10
  const score = Math.round((total / max) * 100)
  const nota = score >= 90 ? 'excelente' : score >= 75 ? 'bom' : score >= 50 ? 'medio' : score >= 30 ? 'ruim' : 'critico'

  const resumo = score >= 80 ? 'Página pronta para publicar 🚀' : score >= 60 ? 'Precisa de alguns ajustes antes de publicar.' : 'Muitos problemas — resolva antes de publicar.'

  // Top keywords
  const words = (input.titulo + ' ' + input.descricao).toLowerCase()
    .replace(/[^\w\sà-ÿ]/g, '').split(/\s+/)
    .filter(w => w.length > 4)
  const freq: Record<string, number> = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  const topKeywords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,8).map(([w]) => w)

  const emojis = EMOJIS_POR_CATEGORIA[input.categoria || 'default'] || EMOJIS_POR_CATEGORIA.default

  // Sugestões
  const sugestaoTitulo = tl < 20 ? `${input.titulo} — ${input.categoria || 'Produto Digital'} | Entrega Instantânea`.slice(0, 60) : input.titulo.slice(0, 60)
  const sugestaoDescricao = input.descricao.length < 200
    ? `${input.descricao}\n\n✅ Entrega instantânea\n✅ Garantia KIYVO\n✅ Suporte 24h\n${input.preco ? `💰 Apenas R$ ${input.preco.toFixed(2).replace('.', ',')}` : ''}`.slice(0, 600)
    : input.descricao.slice(0, 600)

  return { score, nota, checks, resumo, topKeywords, emojisRecomendados: emojis, sugestaoTitulo, sugestaoDescricao }
}
