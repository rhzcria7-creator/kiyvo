// Agente ProfitProtector — monitor de saúde do negócio em tempo real
// (agente interno, invisível, roda no dashboard do vendedor)
export interface Venda { valor: number; custo: number; data: string; canal: string; taxas?: number }
export interface ProfitInput { vendas: Venda[]; custosFixos: number; investimentoTrafego: number; periodoDias: number }
export interface ProfitAlerta { nivel: 'info'|'atencao'|'critico'; mensagem: string; sugestao: string }
export interface ProfitOutput { receita: number; custosVariaveis: number; lucroBruto: number; margemBruta: number; lucroLiquido: number; margemLiquida: number; roas: number; cac: number; ltv: number; ticketMedio: number; projecao30d: number; alertas: ProfitAlerta[]; melhorCanal: string; piorCanal: string; recomendacoes: string[] }
export function analisarNegocio(input: ProfitInput): ProfitOutput {
  const { vendas, custosFixos, investimentoTrafego, periodoDias } = input
  const receita = vendas.reduce((s, v) => s + v.valor, 0)
  const custosVariaveis = vendas.reduce((s, v) => s + v.custo + (v.taxas || v.valor*0.13), 0)
  const lucroBruto = receita - custosVariaveis
  const margemBruta = receita > 0 ? (lucroBruto / receita) * 100 : 0
  const lucroLiquido = lucroBruto - custosFixos - investimentoTrafego
  const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0
  const roas = investimentoTrafego > 0 ? receita / investimentoTrafego : 0
  const cac = investimentoTrafego / Math.max(1, vendas.length)
  const ticketMedio = vendas.length > 0 ? receita / vendas.length : 0
  const ltv = ticketMedio * 1.4 // LTV ~1.4x ticket médio em e-commerce digital BR
  const projecao30d = (lucroLiquido / Math.max(1, periodoDias)) * 30
  // Agrupar por canal
  const canais = new Map<string, { receita: number; custo: number; pedidos: number }>()
  for (const v of vendas) {
    const c = canais.get(v.canal) || { receita:0, custo:0, pedidos:0 }
    c.receita += v.valor; c.custo += v.custo + (v.taxas || v.valor*0.13); c.pedidos++
    canais.set(v.canal, c)
  }
  let melhorCanal = 'Nenhum', piorCanal = 'Nenhum', melhorROI = -Infinity, piorROI = Infinity
  const canaisArr = Array.from(canais.entries())
  for (let i = 0; i < canaisArr.length; i++) {
    const [nome, d] = canaisArr[i]
    const roi = (d.receita - d.custo)/Math.max(1, d.custo)
    if (roi > melhorROI) { melhorROI = roi; melhorCanal = nome }
    if (roi < piorROI) { piorROI = roi; piorCanal = nome }
  }
  const alertas: ProfitAlerta[] = []
  const recomendacoes: string[] = []
  if (margemLiquida < 0) alertas.push({ nivel: 'critico', mensagem: `Prejuízo de R$ ${Math.abs(lucroLiquido).toFixed(2).replace('.',',')} no período`, sugestao: 'Pausar anúncios e revisar custos URGENTEMENTE.' })
  if (roas < 2 && investimentoTrafego > 100) alertas.push({ nivel: 'critico', mensagem: `ROAS baixo: ${roas.toFixed(2)}x`, sugestao: 'Desligar criativos com pior performance e duplicar os que funcionam.' })
  if (margemBruta < 30) alertas.push({ nivel: 'atencao', mensagem: `Margem bruta de ${margemBruta.toFixed(1)}%`, sugestao: 'Subir preço em 10% ou reduzir custos/fornecedor.' })
  if (cac > ticketMedio * 0.5) alertas.push({ nivel: 'atencao', mensagem: `CAC alto (R$ ${cac.toFixed(2).replace('.',',')})`, sugestao: 'CAC acima de 50% do ticket médio é perigoso. Rever criativos e público.' })
  if (receita === 0) alertas.push({ nivel: 'atencao', mensagem: 'Sem vendas no período', sugestao: 'Verifique pixel, checkout, ofertas e criativos.' })
  if (canais.size > 1 && melhorCanal !== piorCanal) {
    recomendacoes.push(`📈 Dobrar orçamento do canal "${melhorCanal}" (ROI ${melhorROI.toFixed(2)}x)`)
    recomendacoes.push(`📉 Cortar orçamento do canal "${piorCanal}" (ROI ${piorROI.toFixed(2)}x)`)
  }
  recomendacoes.push(`🎯 Meta de ROAS: manter > 2.5x para saúde do negócio`)
  recomendacoes.push(`💸 LTV estimado por cliente: R$ ${ltv.toFixed(2).replace('.',',')}`)
  if (projecao30d > 0) recomendacoes.push(`📊 Projeção de lucro em 30 dias: R$ ${projecao30d.toFixed(2).replace('.',',')}`)
  recomendacoes.push('🛡️ Mantenha reserva de caixa de 3 meses de custos fixos')
  return { receita, custosVariaveis, lucroBruto, margemBruta, lucroLiquido, margemLiquida, roas, cac, ltv, ticketMedio, projecao30d, alertas, melhorCanal, piorCanal, recomendacoes }
}
