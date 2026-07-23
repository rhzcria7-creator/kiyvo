// Agente CompetitorMonitor — monitora concorrentes (preços, ofertas, reviews)
// Gera resumo de comparação e gaps de oportunidade
export interface CompetidorInput {
  seuProduto: string
  seuPreco: number
  concorrentes: Array<{ nome: string; preco: number; nota?: number; reviews?: number; fraquezas?: string[] }>
  seuDiferencial?: string[]
}
export interface CompetidorResult {
  posicaoMercado: 'mais_barato' | 'competitivo' | 'premium' | 'caro'
  precoMedio: number
  precoMin: number
  precoMax: number
  gapOportunidade: string[]
  recomendacoes: string[]
  comparacao: Array<{ concorrente: string; diferencaPct: number; observacao: string }>
  swot: { forcas: string[]; fraquezas: string[]; oportunidades: string[]; ameacas: string[] }
}

export function analisarCompetidores(input: CompetidorInput): CompetidorResult {
  const { seuProduto, seuPreco, concorrentes, seuDiferencial = [] } = input
  if (concorrentes.length === 0) {
    return {
      posicaoMercado: 'competitivo',
      precoMedio: seuPreco, precoMin: seuPreco, precoMax: seuPreco,
      gapOportunidade: ['Cadastre concorrentes para análise detalhada.'],
      recomendacoes: ['Monitore ao menos 3 concorrentes.'],
      comparacao: [],
      swot: { forcas: seuDiferencial, fraquezas: ['Sem dados de concorrentes'], oportunidades: [], ameacas: [] },
    }
  }
  const precos = concorrentes.map(c => c.preco)
  const precoMedio = precos.reduce((a, b) => a + b, 0) / precos.length
  const precoMin = Math.min(...precos)
  const precoMax = Math.max(...precos)
  let posicao: CompetidorResult['posicaoMercado'] = 'competitivo'
  if (seuPreco <= precoMin * 1.02) posicao = 'mais_barato'
  else if (seuPreco >= precoMax * 0.95) posicao = 'premium'
  else if (seuPreco > precoMedio * 1.2) posicao = 'caro'
  const comparacao = concorrentes.map(c => {
    const diff = ((seuPreco - c.preco) / c.preco) * 100
    let obs = 'Preço similar'
    if (diff < -10) obs = 'Você é mais barato (vantagem de preço)'
    else if (diff > 15) obs = 'Seu preço está mais alto — precisa justificar valor'
    if (c.nota && c.nota < 4) obs += ' / concorrente tem nota baixa (oportunidade!)'
    return { concorrente: c.nome, diferencaPct: Math.round(diff * 10) / 10, observacao: obs }
  })
  const gapOportunidade: string[] = []
  const ameacas: string[] = []
  for (const c of concorrentes) {
    if (c.fraquezas && c.fraquezas.length > 0) {
      for (const f of c.fraquezas) gapOportunidade.push(`Explorar fraqueza de ${c.nome}: ${f}`)
    }
    if (c.nota && c.nota >= 4.7 && c.preco <= seuPreco * 0.9) {
      ameacas.push(`${c.nome} ameaça com nota ${c.nota} e preço mais baixo.`)
    }
  }
  if (posicao === 'premium') gapOportunidade.push('Posicione como premium com benefícios exclusivos claros.')
  if (posicao === 'caro') gapOportunidade.push('Revisar preço ou adicionar bônus massivos.')
  const recomendacoes = [
    `Monitore preços semanalmente (automatize com webhook).`,
    `Colete e responda reviews mais rápido que os concorrentes.`,
    `Use prova social acima da concorrência (mais depoimentos e cases).`,
    `Seja o mais rápido em suporte — isso dobra a lealdade.`,
  ]
  const swot = {
    forcas: [...seuDiferencial, posicao === 'mais_barato' ? 'Preço mais competitivo' : 'Posicionamento claro'],
    fraquezas: concorrentes.filter(c => c.preco < seuPreco && (c.nota || 0) >= 4).map(c => `${c.nome} é mais barato com boa nota`),
    oportunidades: gapOportunidade,
    ameacas,
  }
  return { posicaoMercado: posicao, precoMedio: Math.round(precoMedio * 100) / 100, precoMin, precoMax, gapOportunidade, recomendacoes, comparacao, swot }
}
