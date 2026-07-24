// Agente ScarcityForge — gera gatilhos de urgência/escassez que convertem
// Contagem regressiva, estoque baixo, prova social, "X pessoas olhando agora"

export interface ScarcityInput {
  productTitle: string
  price: number
  stock?: number
  salesCount?: number
  category?: string
  formato?: 'texto' | 'badge' | 'cta' | 'timer' | 'prova-social' | 'oferta'
  intensidade?: 'baixa' | 'media' | 'alta'
}

export interface ScarcityOutput {
  titulo: string
  subtitulo: string
  badge: string
  cta: string
  contadorTexto: string
  provaSocial: string
  risco: string
  scoreUrgencia: number // 0-100
  recomendacoes: string[]
}

const BADGES: Record<string, string[]> = {
  baixa: ['🔥 Novidade', '✨ Acabou de chegar', '💎 Selecionado'],
  media: ['⚡ Oferta relâmpago', '🔥 Mais vendido', '⭐ Favorito da galera'],
  alta: ['🔴 ÚLTIMAS UNIDADES', '⏰ OFERTA ACABA EM POUCOS MINUTOS', '🚨 RESTAM POUCOS', '💣 ACABANDO AGORA'],
}

const PROVAS = [
  (s: number) => `${s} pessoas compraram nas últimas 24h`,
  (s: number) => `${s} pessoas estão olhando este produto agora`,
  () => `Mais de 500 pessoas favoritaram nas últimas 48h`,
  () => `5 estrelas • +1.200 avaliações verificadas`,
  () => `Quase esgotando! Vendemos 47% nas últimas 12h`,
  (s: number) => `Faltam ${s} unidades e 14 pessoas estão no checkout`,
]

export function gerarGatilhosEscassez(input: ScarcityInput): ScarcityOutput {
  const { productTitle, price, stock = 0, salesCount = 0, category, intensidade = 'media' } = input
  const _categoria = category // reservado para uso futuro
  const badges = BADGES[intensidade]
  const badge = badges[Math.floor(Math.random() * badges.length)]
  const estoqueBaixo = stock > 0 && stock <= 10
  const muitasVendas = salesCount >= 50

  let score = 50
  if (estoqueBaixo) score += 15
  if (muitasVendas) score += 15
  if (intensidade === 'alta') score += 20
  if (intensidade === 'baixa') score -= 15
  score = Math.max(0, Math.min(100, score))

  const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

  let titulo = `${productTitle} por apenas ${preco}`
  let subtitulo = 'Aproveite antes que acabe'
  let cta = 'Quero agora'
  let contadorTexto = 'Oferta válida por tempo limitado'
  let risco = 'Se esperar, pode perder o preço especial'

  if (intensidade === 'alta') {
    titulo = `🔥 ${productTitle.toUpperCase()} — OFERTA RELÂMPAGO 🔥`
    subtitulo = `De R$ ${(price * 1.5).toFixed(2).replace('.', ',')} por ${preco} — ${Math.round(((price * 1.5 - price) / (price * 1.5)) * 100)}% OFF`
    cta = 'GARANTIR MINHA VAGA AGORA'
    contadorTexto = `⏰ Esta oferta expira em ${Math.floor(Math.random() * 20 + 3)} minutos`
    risco = 'Quando o timer zerar, o preço volta ao normal. Sem aviso.'
  } else if (intensidade === 'media') {
    titulo = `⚡ ${productTitle} — ${preco} à vista`
    subtitulo = 'Frete grátis + garantia KIYVO de 7 dias'
    cta = 'Aproveitar agora'
    contadorTexto = estoqueBaixo ? `🔴 Restam apenas ${stock} unidades` : '🔥 Esta oferta acaba hoje'
  }

  const provaIdx = Math.floor(Math.random() * PROVAS.length)
  const provaSocial = PROVAS[provaIdx](stock > 0 ? stock : 27)

  const recomendacoes: string[] = []
  if (!estoqueBaixo && intensidade === 'alta') {
    recomendacoes.push('Dica: Para alta urgência funcionar, limite de estoque deve ser real (< 10 unidades)')
  }
  if (score > 80) {
    recomendacoes.push('🔥 Gatilhos fortes: use em campanhas pagas e lançamentos')
  }
  recomendacoes.push('Mostre o contador visualmente em vermelho #EF4444')
  recomendacoes.push('Use o badge no canto superior direito da imagem do produto')
  recomendacoes.push('Combine com prova social abaixo do botão de compra')
  if (price < 50) {
    recomendacoes.push('Preço baixo: teste CTA "Comprar com 1 clique" sem cadastro prévio')
  }

  return {
    titulo,
    subtitulo,
    badge,
    cta,
    contadorTexto,
    provaSocial,
    risco,
    scoreUrgencia: score,
    recomendacoes,
  }
}
