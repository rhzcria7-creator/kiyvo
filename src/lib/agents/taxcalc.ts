// Agente TaxCalc — calculadora avançada de lucro líquido para vendedores
// Considera: taxa KIYVO, Stripe/Pagar.me, IRPF, CSLL, Pis/Cofins (Simples Nacional), anúncios, KD cashback

export interface TaxCalcInput {
  preco: number
  custo?: number
  frete?: number
  anuncios?: number // CAC
  cupom?: number // % de desconto
  kdPointsUsados?: number // R$ em KD
  categoria?: 'digital' | 'fisico' | 'freela' | 'afiliado'
  tipoConta?: 'pf' | 'simples' | 'me' | 'lp'
  vendasMes?: number
  metodoPagamento?: 'pix' | 'cartao_avista' | 'cartao_parcelado' | 'boleto'
  parcelas?: number
}

export interface TaxCalcOutput {
  receitaBruta: number
  receitaLiquida: number
  taxaPlataforma: { percentual: number; valor: number }
  taxaGateway: { nome: string; percentual: number; valor: number }
  impostos: { nome: string; percentual: number; valor: number }
  custos: { frete: number; anuncios: number; custoProduto: number }
  descontos: { cupom: number; kd: number }
  lucroLiquido: number
  margemLiquida: number
  ticketMedioRecomendado: number
  pontosDistribuidos: number
  breakEvenPrice: number
  roasMinimo: number
  recomendacoes: string[]
}

function fmtBrl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function calcularLucroLiquido(input: TaxCalcInput): TaxCalcOutput {
  const {
    preco,
    custo = 0,
    frete = 0,
    anuncios = 0,
    cupom = 0,
    kdPointsUsados = 0,
    categoria = 'digital',
    tipoConta = 'pf',
    vendasMes = 1,
    metodoPagamento = 'pix',
    parcelas = 1,
  } = input

  // Taxa KIYVO (plataforma)
  const taxaPlataformaPct =
    categoria === 'afiliado' ? 0.0 : categoria === 'freela' ? 0.08 : categoria === 'digital' ? 0.1 : 0.12
  const descontoCupom = preco * (cupom / 100)
  const receitaBruta = preco - descontoCupom - kdPointsUsados
  const taxaPlataformaValor = receitaBruta * taxaPlataformaPct

  // Taxas gateway
  let gatewayNome = 'Stripe/Pix'
  let taxaGatewayPct = 0
  let taxaGatewayFixa = 0
  if (metodoPagamento === 'pix') {
    taxaGatewayPct = 0; taxaGatewayFixa = 0 // KIYVO assume pix fee zero no Wallet
  } else if (metodoPagamento === 'cartao_avista') {
    taxaGatewayPct = 0.0399; taxaGatewayFixa = 0.4
  } else if (metodoPagamento === 'cartao_parcelado') {
    taxaGatewayPct = 0.0399 + 0.01 * Math.max(0, parcelas - 1); taxaGatewayFixa = 0.4
  } else {
    taxaGatewayPct = 0.0199; taxaGatewayFixa = 0.4
  }
  const taxaGatewayValor = receitaBruta * taxaGatewayPct + taxaGatewayFixa

  // Impostos
  let impostoNome = 'IRPF ( Carnê-Leão)'
  let impostoPct = 0
  if (tipoConta === 'pf') {
    // Carnê-leão 2025 tabela progressiva simplificada
    if (receitaBruta * vendasMes > 28559.70) impostoPct = 0.275
    else if (receitaBruta * vendasMes > 9253.40) impostoPct = 0.15
    else if (receitaBruta * vendasMes > 4664.68) impostoPct = 0.075
    else impostoPct = 0
    if (impostoPct > 0) impostoNome = 'IRPF Carnê-Leão'
    else impostoNome = 'Isento (abaixo faixa IR)'
  } else if (tipoConta === 'me') {
    impostoNome = 'MEI/ME (Simples)'
    impostoPct = 0.06
  } else if (tipoConta === 'simples') {
    // Anexo III - faturamento até 4,8M
    impostoNome = 'Simples Nacional (Anexo III)'
    const receitaAnual = receitaBruta * vendasMes * 12
    impostoPct = receitaAnual > 360000 ? 0.135 : receitaAnual > 180000 ? 0.112 : 0.06
  } else {
    impostoNome = 'Lucro Presumido'
    impostoPct = 0.133
  }
  const impostoValor = Math.max(0, (receitaBruta - custo - frete - anuncios) * impostoPct)

  const custosTotais = custo + frete + anuncios
  const descontosTotais = descontoCupom + kdPointsUsados
  const lucroLiquido = receitaBruta - taxaPlataformaValor - taxaGatewayValor - impostoValor - custosTotais
  const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0

  // Ticket ideal
  const ticketMedioRecomendado = Math.max(
    preco,
    (custo + frete + anuncios + 5) / (1 - taxaPlataformaPct - taxaGatewayPct - impostoPct)
  )

  // KD Points distribuídos (2% do valor em KD)
  const pontosDistribuidos = Math.round(receitaBruta * 2)

  // Preço break-even
  const breakEvenPrice = (custo + frete + anuncios + taxaGatewayFixa) / (1 - taxaPlataformaPct - taxaGatewayPct - impostoPct)

  // ROAS mínimo
  const margemContribuicao = 1 - custo / preco - taxaPlataformaPct - taxaGatewayPct - impostoPct
  const roasMinimo = margemContribuicao > 0 ? 1 / margemContribuicao : 999

  const recomendacoes: string[] = []
  if (margemLiquida < 20) recomendacoes.push('⚠️ Margem abaixo de 20% — suba o preço ou reduza custo/anúncios')
  else if (margemLiquida < 35) recomendacoes.push('✅ Margem OK, mas pode melhorar com upsell')
  else recomendacoes.push('🎉 Margem excelente!')
  if (metodoPagamento === 'cartao_parcelado' && parcelas > 6) recomendacoes.push('💳 Parcelamento longo: juros aumentam muito. Considere Pix com 5% de desconto.')
  if (anuncios > preco * 0.3) recomendacoes.push('📢 CAC alto demais: revise criativos e público-alvo')
  if (categoria === 'digital') recomendacoes.push('💡 Produto digital tem custo marginal ZERO — venda escalar é o segredo')
  if (kdPointsUsados > preco * 0.2) recomendacoes.push('💸 Muitos KD Points usados (máx 50% do valor)')
  recomendacoes.push(`📍 Preço mínimo de equilíbrio: ${fmtBrl(breakEvenPrice)}`)
  recomendacoes.push(`🎯 ROAS mínimo aceitável: ${roasMinimo.toFixed(2)}x`)
  recomendacoes.push(`💙 Distribuindo ${pontosDistribuidos} KD Points ao comprador`)

  return {
    receitaBruta,
    receitaLiquida: receitaBruta - taxaPlataformaValor - taxaGatewayValor,
    taxaPlataforma: { percentual: taxaPlataformaPct * 100, valor: taxaPlataformaValor },
    taxaGateway: { nome: gatewayNome, percentual: taxaGatewayPct * 100, valor: taxaGatewayValor },
    impostos: { nome: impostoNome, percentual: impostoPct * 100, valor: impostoValor },
    custos: { frete, anuncios, custoProduto: custo },
    descontos: { cupom: descontoCupom, kd: kdPointsUsados },
    lucroLiquido,
    margemLiquida,
    ticketMedioRecomendado,
    pontosDistribuidos,
    breakEvenPrice,
    roasMinimo,
    recomendacoes,
  }
}
