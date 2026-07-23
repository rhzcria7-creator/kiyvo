// Agente DynamicPricing — sugestão de preço dinâmico baseado em demanda,
// concorrência, horário, estoque e taxa de conversão.
export interface DynamicPricingInput {
  precoBase: number
  custo?: number
  estoque?: number
  viewsUltimos7dias?: number
  vendasUltimos7dias?: number
  notaMedia?: number
  concorrentes?: Array<{ preco: number; vendas: number }>
  categoria?: string
  isLancamento?: boolean
  isBlackFriday?: boolean
  horaDoDia?: number
}

export interface DynamicPricingResult {
  precoSugerido: number
  precoMinimo: number
  precoMaximo: number
  precoPsicologico: number
  margemLiquida: number
  taxaConversao: number
  estrategia: string
  razoes: string[]
  descontosSugeridos: Array<{ trigger: string; desconto: number; preco: number }>
}

function precoPsicologico(v: number): number {
  if (v <= 0) return 0
  const inteiro = Math.floor(v)
  const reais = Math.max(0.9, Math.round((v - 0.01) * 100) / 100)
  if (v < 10) return Math.round((inteiro - 0.01) * 100) / 100
  if (v < 50) return Math.round((inteiro - 0.9) * 100) / 100
  if (v < 200) return Math.round((inteiro - (inteiro % 10 + 1)) * 100) / 100
  return Math.round((inteiro - (inteiro % 50 + 1)) * 100) / 100 + 0.99
}

export function calcularPrecoDinamico(input: DynamicPricingInput): DynamicPricingResult {
  const {
    precoBase,
    custo = precoBase * 0.25,
    estoque = 50,
    viewsUltimos7dias = 0,
    vendasUltimos7dias = 0,
    notaMedia = 5,
    concorrentes = [],
    isLancamento = false,
    isBlackFriday = false,
    horaDoDia = new Date().getHours(),
  } = input
  const taxaConversao = viewsUltimos7dias > 0 ? vendasUltimos7dias / viewsUltimos7dias : 0.03
  let fator = 1
  const razoes: string[] = []
  if (isLancamento) {
    fator *= 1.1
    razoes.push('Lançamento: +10% de early-adopter premium.')
  }
  if (isBlackFriday) {
    fator *= 0.75
    razoes.push('Black Friday: -25% promocional.')
  }
  if (estoque < 10) {
    fator *= 1.15
    razoes.push('Estoque baixo (menos de 10 unid.): +15% por escassez.')
  } else if (estoque > 500) {
    fator *= 0.92
    razoes.push('Estoque alto: -8% para giro rápido.')
  }
  if (taxaConversao > 0.05) {
    fator *= 1.08
    razoes.push('Alta conversão ( >5% ): +8% por demanda aquecida.')
  } else if (taxaConversao < 0.01 && viewsUltimos7dias > 200) {
    fator *= 0.88
    razoes.push('Baixa conversão: -12% para alavancar vendas.')
  }
  if (notaMedia >= 4.8) {
    fator *= 1.05
    razoes.push('Produto 5★: +5% premium social proof.')
  }
  if (horaDoDia >= 19 && horaDoDia <= 23) {
    fator *= 1.02
    razoes.push('Horário nobre (19h-23h): +2% pico de compra.')
  } else if (horaDoDia >= 2 && horaDoDia <= 5) {
    fator *= 0.95
    razoes.push('Madrugada: -5% para converter compradores noturnos.')
  }
  if (concorrentes.length > 0) {
    const mediaConcorrente = concorrentes.reduce((s, c) => s + c.preco, 0) / concorrentes.length
    if (precoBase > mediaConcorrente * 1.15) {
      fator *= 0.95
      razoes.push(`Preço acima da concorrência (média R$ ${mediaConcorrente.toFixed(2)}): ajuste.`)
    } else if (precoBase < mediaConcorrente * 0.7) {
      fator *= 1.05
      razoes.push('Preço muito abaixo da concorrência: pequeno aumento mantém valor percebido.')
    }
  }
  const precoSugeridoBruto = precoBase * fator
  const precoMinimo = Math.max(custo * 1.3, precoBase * 0.6)
  const precoMaximo = precoBase * 1.5
  const precoSugerido = Math.min(precoMaximo, Math.max(precoMinimo, precoSugeridoBruto))
  const pPsi = precoPsicologico(precoSugerido)
  const margemLiquida = ((pPsi - custo) / pPsi) * 100
  const descontosSugeridos = [
    { trigger: 'Carrinho abandonado 24h', desconto: 0.1, preco: precoPsicologico(pPsi * 0.9) },
    { trigger: 'Compra recorrente (2a compra)', desconto: 0.08, preco: precoPsicologico(pPsi * 0.92) },
    { trigger: 'Boleto/PIX à vista', desconto: 0.05, preco: precoPsicologico(pPsi * 0.95) },
    { trigger: 'Combo de 3+ produtos', desconto: 0.15, preco: precoPsicologico(pPsi * 0.85) },
  ]
  const estrategia = precoSugerido > precoBase
    ? 'ESTRATÉGIA DE PREMIUM: demanda alta → margem extra.'
    : precoSugerido < precoBase
    ? 'ESTRATÉGIA DE ATRATIVIDADE: preço mais agressivo para girar estoque.'
    : 'ESTRATÉGIA DE ESTABILIDADE: manter preço atual.'
  return {
    precoSugerido: Math.round(precoSugerido * 100) / 100,
    precoMinimo: Math.round(precoMinimo * 100) / 100,
    precoMaximo: Math.round(precoMaximo * 100) / 100,
    precoPsicologico: pPsi,
    margemLiquida: Math.round(margemLiquida * 10) / 10,
    taxaConversao: Math.round(taxaConversao * 1000) / 10,
    estrategia,
    razoes,
    descontosSugeridos,
  }
}
