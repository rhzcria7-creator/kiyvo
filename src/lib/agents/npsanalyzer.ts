// Agente NPSAnalyzer — analisa respostas NPS e sugere ações
export interface NPSInput {
  promotores: number   // notas 9-10
  neutros: number      // notas 7-8
  detratores: number   // notas 0-6
  comentarios?: string[]
}
export interface NPSResult {
  npsScore: number
  classificacao: 'excelente' | 'muito_bom' | 'bom' | 'razoavel' | 'ruim' | 'critico'
  totalRespostas: number
  pctPromotores: number
  pctNeutros: number
  pctDetratores: number
  acoes: string[]
  alertas: string[]
  comoMelhorar: string[]
}

export function analisarNPS(input: NPSInput): NPSResult {
  const { promotores = 0, neutros = 0, detratores = 0, comentarios = [] } = input
  const total = promotores + neutros + detratores
  const pctP = total > 0 ? (promotores / total) * 100 : 0
  const pctN = total > 0 ? (neutros / total) * 100 : 0
  const pctD = total > 0 ? (detratores / total) * 100 : 0
  const npsScore = Math.round(pctP - pctD)
  let classif: NPSResult['classificacao'] = 'critico'
  if (npsScore >= 75) classif = 'excelente'
  else if (npsScore >= 50) classif = 'muito_bom'
  else if (npsScore >= 30) classif = 'bom'
  else if (npsScore >= 0) classif = 'razoavel'
  else if (npsScore >= -30) classif = 'ruim'
  const acoes: string[] = []
  const alertas: string[] = []
  if (pctD > 30) {
    alertas.push(`Mais de 30% de detratores (${pctD.toFixed(0)}%) — urgente.`)
    acoes.push('Contate cada detrator em até 24h para entender a frustração.')
    acoes.push('Revise os principais motivos de reclamação dos comentários.')
  }
  if (pctN > 40) {
    acoes.push('Muitos clientes neutros — crie um programa para converter em promotores (bônus, surpresa, follow-up).')
  }
  if (pctP > 60) {
    acoes.push('Ative programa de indicação — promotores compram 2x mais e indicam.')
  }
  if (total < 30) acoes.push(`Amostra pequena (${total} respostas) — colete mais para dados confiáveis.`)
  if (comentarios.length === 0) acoes.push('Colete comentários abertos — somente nota não diz o porquê.')
  const comoMelhorar = [
    'Responda TODAS as avaliações em menos de 24h.',
    'Crie um onboarding guiado para novos usuários.',
    'Adicione pesquisa pós-compra de 2-3 perguntas.',
    'Ofereça reembolso rápido para detratores — isso aumenta LTV.',
    'Compartilhe feedback com o time de produto toda semana.',
  ]
  return {
    npsScore,
    classificacao: classif,
    totalRespostas: total,
    pctPromotores: Math.round(pctP),
    pctNeutros: Math.round(pctN),
    pctDetratores: Math.round(pctD),
    acoes,
    alertas,
    comoMelhorar,
  }
}
