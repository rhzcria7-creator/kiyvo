// Agente SmartCart — recomendações inteligentes de carrinho
// (cross-sell, upsell, bundle, frete grátis, KD points extras)
export interface CartProduct {
  id: string
  titulo: string
  preco: number
  categoria?: string
  tags?: string[]
}
export interface SmartCartInput {
  itens: CartProduct[]
  totalAtual: number
  usuario?: {
    jaComprou?: string[]
    kdPoints?: number
    plano?: string
  }
}
export interface SmartCartResult {
  totalAtual: number
  subtotal: number
  descontoKD: number
  descontoBundle: number
  totalFinal: number
  economiaTotal: number
  upsellRecomendados: Array<CartProduct & { razao: string }>
  crossSellRecomendados: Array<CartProduct & { razao: string }>
  bundleOfertas: Array<{ titulo: string; preco: number; economia: number }>
  mensagens: string[]
  proximoNivelKD?: { falta: number; bonus: number }
}

const UPSELL_DB: Record<string, Array<{ titulo: string; preco: number; razao: string }>> = {
  default: [
    { titulo: 'Versão PRO (recursos avançados)', preco: 97, razao: 'Versão Pro: +200% conteúdo e suporte prioritário.' },
    { titulo: 'Pacote Elite (atualizações vitalícias)', preco: 197, razao: 'Pacote Elite: atualizações grátis para sempre.' },
  ],
}
const CROSS_DB: Record<string, Array<{ titulo: string; preco: number; razao: string }>> = {
  marketing: [
    { titulo: 'Pack de Canva para Criativos', preco: 19.9, razao: 'Combina perfeitamente com templates prontos.' },
    { titulo: 'Checklist de Lançamento', preco: 9.9, razao: 'Checklist complementar validado.' },
  ],
  default: [
    { titulo: 'Ebook Complementar do Nicho', preco: 29.9, razao: 'Complementa perfeitamente sua compra.' },
    { titulo: 'Mentoria em Grupo (1 sessão)', preco: 49.9, razao: 'Tire dúvidas diretamente com o produtor.' },
  ],
}

export function smartCartAnalisar(input: SmartCartInput): SmartCartResult {
  const { itens, totalAtual, usuario } = input
  const subtotal = itens.reduce((s, p) => s + p.preco, 0) || totalAtual
  let descontoBundle = 0
  const mensagens: string[] = []
  if (itens.length >= 3) {
    descontoBundle = subtotal * 0.1
    mensagens.push(`🎁 Combo de ${itens.length} produtos: -10% aplicado!`)
  }
  const kdDisponivel = usuario?.kdPoints || 0
  const maxKD = Math.floor(subtotal * 0.5 * 100)
  const kdUsados = Math.min(kdDisponivel, maxKD)
  const descontoKD = kdUsados / 100
  if (kdUsados > 0) mensagens.push(`⭐ ${kdUsados} KD Points usados: -R$ ${descontoKD.toFixed(2)}`)
  const totalFinal = Math.max(0, subtotal - descontoKD - descontoBundle)
  const economiaTotal = descontoKD + descontoBundle
  if (totalFinal < 97) {
    const falta = 97 - totalFinal
    mensagens.push(`🛡️ Faltam R$ ${falta.toFixed(2)} para garantia estendida grátis!`)
  }
  // Upsell: recomenda produto mais caro que substitua/acrescente
  const upsellRecomendados = UPSELL_DB.default.map(u => ({
    id: `upsell_${Math.random().toString(36).slice(2, 8)}`,
    titulo: u.titulo,
    preco: u.preco,
    razao: u.razao,
  }))
  // Cross-sell baseado em categoria
  const cat = itens[0]?.categoria || 'default'
  const crossBase = CROSS_DB[cat] || CROSS_DB.default
  const crossSellRecomendados = crossBase.map(c => ({
    id: `cross_${Math.random().toString(36).slice(2, 8)}`,
    titulo: c.titulo,
    preco: c.preco,
    razao: c.razao,
  }))
  const bundleOfertas = [
    { titulo: 'Combo Carrinho + 1 Ebook bônus', preco: totalFinal + 9.9, economia: 19.9 },
    { titulo: 'Tudo no carrinho + Mentoria 1h', preco: totalFinal + 39.9, economia: 60 },
  ]
  const proximoNivelKD = totalAtual < 500 ? { falta: 500 - totalAtual, bonus: 200 } : undefined
  return {
    totalAtual,
    subtotal: Math.round(subtotal * 100) / 100,
    descontoKD: Math.round(descontoKD * 100) / 100,
    descontoBundle: Math.round(descontoBundle * 100) / 100,
    totalFinal: Math.round(totalFinal * 100) / 100,
    economiaTotal: Math.round(economiaTotal * 100) / 100,
    upsellRecomendados,
    crossSellRecomendados,
    bundleOfertas,
    mensagens,
    proximoNivelKD,
  }
}
