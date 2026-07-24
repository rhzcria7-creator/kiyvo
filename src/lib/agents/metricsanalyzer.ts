// Agente MetricsAnalyzer — analisa métricas de vendas e sugere ações
export interface MetricasInput {
  visitas: number
  sessoes: number
  addCarrinho: number
  checkoutsIniciados: number
  compras: number
  receita: number
  reembolsos: number
  ticketMedio?: number
  periodo?: string
}
export interface MetricasResult {
  taxaConversao: number
  taxaCart: number
  taxaCheckout: number
  taxaReembolso: number
  aov: number
  diagnostico: Array<{ severidade: 'ok' | 'atencao' | 'critica'; metrica: string; valor: string; recomendacao: string }>
  acoesPrioritarias: string[]
  benchmark: { conversaoBoa: number; conversaoExcelente: number }
}

function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%` }

export function analisarMetricas(input: MetricasInput): MetricasResult {
  const { visitas, sessoes, addCarrinho, checkoutsIniciados, compras, receita, reembolsos } = input
  const taxaCart = visitas > 0 ? addCarrinho / visitas : 0
  const taxaCheckout = addCarrinho > 0 ? checkoutsIniciados / addCarrinho : 0
  const taxaConversao = visitas > 0 ? compras / visitas : 0
  const taxaReembolso = compras > 0 ? reembolsos / compras : 0
  const aov = compras > 0 ? receita / compras : 0
  const diag: MetricasResult['diagnostico'] = []
  const acoes: string[] = []
  // Tráfego
  if (visitas < 100) {
    diag.push({ severidade: 'atencao', metrica: 'Tráfego', valor: `${visitas} visitas`, recomendacao: 'Aumente tráfego antes de otimizar — precisa de 300+ visitas para dados confiáveis.' })
    acoes.push('Rode campanhas de aquisição (Meta/TikTok) e poste 3 conteúdos por dia.')
  } else {
    diag.push({ severidade: 'ok', metrica: 'Tráfego', valor: `${visitas} visitas`, recomendacao: 'Volume suficiente para análise estatística.' })
  }
  // Cart
  if (taxaCart < 0.05) {
    diag.push({ severidade: 'critica', metrica: 'Taxa Add-to-Cart', valor: fmtPct(taxaCart), recomendacao: 'Muito baixa (<5%). Revise preço, CTA e botão de compra.' })
    acoes.push('Revise botão de compra (cor, posição, texto). Adicione urgência e prova social.')
  } else if (taxaCart < 0.1) {
    diag.push({ severidade: 'atencao', metrica: 'Taxa Add-to-Cart', valor: fmtPct(taxaCart), recomendacao: 'Razoável. Há espaço para melhorar com copy mais persuasiva.' })
  } else {
    diag.push({ severidade: 'ok', metrica: 'Taxa Add-to-Cart', valor: fmtPct(taxaCart), recomendacao: 'Boa — acima de 10%.' })
  }
  // Checkout
  if (taxaCheckout < 0.3) {
    diag.push({ severidade: 'critica', metrica: 'Checkout / Cart', valor: fmtPct(taxaCheckout), recomendacao: 'Muitos abandonos no checkout. Revise campos, PIX e garantias.' })
    acoes.push('Ative PIX com desconto à vista. Ofereça 7 dias de garantia em destaque. Remova campos desnecessários.')
  } else {
    diag.push({ severidade: 'ok', metrica: 'Checkout / Cart', valor: fmtPct(taxaCheckout), recomendacao: 'Fluxo saudável.' })
  }
  // Conversão
  if (taxaConversao < 0.01) {
    diag.push({ severidade: 'critica', metrica: 'Taxa de conversão', valor: fmtPct(taxaConversao), recomendacao: 'Muito abaixo do benchmark (1%). Tráfego qualificado? Página boa?' })
    acoes.push('Pare de comprar tráfego frio. Revise toda a página com LandingChecker. Adicione prova social massiva.')
  } else if (taxaConversao < 0.03) {
    diag.push({ severidade: 'atencao', metrica: 'Taxa de conversão', valor: fmtPct(taxaConversao), recomendacao: 'Aceitável, mas com potencial de dobrar.' })
  } else {
    diag.push({ severidade: 'ok', metrica: 'Taxa de conversão', valor: fmtPct(taxaConversao), recomendacao: 'Excelente! Está acima da média brasileira.' })
  }
  // Reembolso
  if (taxaReembolso > 0.1) {
    diag.push({ severidade: 'critica', metrica: 'Taxa de reembolso', valor: fmtPct(taxaReembolso), recomendacao: 'Reembolsos altos — produto ou expectativa quebrada. Reveja promessas.' })
    acoes.push('Revise promessas da página (elas estão alinhadas ao que o produto entrega?). Colete feedbacks dos reembolsos.')
  } else {
    diag.push({ severidade: 'ok', metrica: 'Taxa de reembolso', valor: fmtPct(taxaReembolso), recomendacao: 'Saudável (<10%).' })
  }
  if (acoes.length === 0) {
    acoes.push('Aumente tráfego com campanhas pagas — sua estrutura está converindo bem.')
    acoes.push('Teste upsells de Order Bump para aumentar AOV.')
  }
  return {
    taxaConversao: Math.round(taxaConversao * 10000) / 100,
    taxaCart: Math.round(taxaCart * 10000) / 100,
    taxaCheckout: Math.round(taxaCheckout * 10000) / 100,
    taxaReembolso: Math.round(taxaReembolso * 10000) / 100,
    aov: Math.round(aov * 100) / 100,
    diagnostico: diag,
    acoesPrioritarias: acoes.slice(0, 5),
    benchmark: { conversaoBoa: 2, conversaoExcelente: 5 },
  }
}
