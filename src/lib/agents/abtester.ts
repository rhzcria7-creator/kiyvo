// Agente ABTester — calcula significância estatística e recomendação de testes A/B
export interface ABVariant { nome: string; visitantes: number; conversoes: number; receita?: number }
export interface ABInput { variantes: ABVariant[]; confianca?: number; metrica?: 'conversao'|'receita' }
export interface VariantResult {
  nome: string
  conversao: number
  pValue?: number
  significativo: boolean
  vencedor: boolean
  liftPercent?: number
  icInferior: number
  icSuperior: number
}
export interface ABOutput {
  vencedor: string | null
  confianca: number
  diasTesteSuficientes: boolean
  diasRecomendados: number
  resultados: VariantResult[]
  recomendacao: string
  erros: string[]
}
function zScore(conf: number): number {
  if (conf >= 0.99) return 2.58
  if (conf >= 0.95) return 1.96
  if (conf >= 0.90) return 1.64
  return 1.96
}
function erroPadrao(p: number, n: number): number { return Math.sqrt(p * (1 - p) / n) }
export function calcularTesteAB(input: ABInput): ABOutput {
  const { variantes, confianca = 0.95 } = input
  const erros: string[] = []
  if (variantes.length < 2) erros.push('Adicione pelo menos 2 variantes')
  const resultados: VariantResult[] = variantes.map(v => {
    const conv = v.visitantes > 0 ? v.conversoes / v.visitantes : 0
    const ep = erroPadrao(conv, v.visitantes || 1)
    const z = zScore(confianca)
    return {
      nome: v.nome,
      conversao: conv * 100,
      significativo: false,
      vencedor: false,
      icInferior: Math.max(0, (conv - z*ep))*100,
      icSuperior: Math.min(1, (conv + z*ep))*100,
    }
  })
  // Compara primeira variante (controle) com as demais
  const controle = resultados[0]
  let melhor = resultados[0]
  let temVencedor = false
  for (let i = 1; i < resultados.length; i++) {
    const v = resultados[i]
    const cData = variantes[0]
    const vData = variantes[i]
    if (cData.visitantes === 0 || vData.visitantes === 0) continue
    const pC = cData.conversoes / cData.visitantes
    const pV = vData.conversoes / vData.visitantes
    const epC = erroPadrao(pC, cData.visitantes)
    const epV = erroPadrao(pV, vData.visitantes)
    const pool = Math.sqrt(epC*epC + epV*epV)
    const z = Math.abs(pV - pC) / (pool || 0.0001)
    const zCrit = zScore(confianca)
    const sig = z >= zCrit
    v.significativo = sig
    const lift = ((pV - pC) / pC) * 100
    v.liftPercent = lift
    if (sig && pV > pC) {
      v.vencedor = true
      temVencedor = true
      if (v.conversao > melhor.conversao) melhor = v
    }
  }
  // Verifica se tem volume suficiente (mínimo 1000 visitantes por variante)
  const minVisitas = variantes.some(v => v.visitantes < 100)
  const totalVisitas = variantes.reduce((s, v) => s + v.visitantes, 0)
  const diasRecomendados = Math.max(7, Math.ceil(14 - totalVisitas/100))
  const recomendacao = temVencedor ?
    `🎉 Variante "${melhor.nome}" é a vencedora com ${melhor.liftPercent?.toFixed(1)}% de lift sobre o controle. Pode implementar em 100%.` :
    minVisitas ? `⏳ Aguarde mais visitas — precisa de pelo menos 1000 por variante. Continue o teste.` :
    `📊 Resultados ainda inconclusivos. Deixe o teste rodar por mais ${diasRecomendados} dias SEM OLHAR antes de decidir.`
  return {
    vencedor: temVencedor ? melhor.nome : null,
    confianca: confianca * 100,
    diasTesteSuficientes: !minVisitas,
    diasRecomendados,
    resultados,
    recomendacao,
    erros,
  }
}
export function gerarHipoteses(elemento: string, nicho: string): string[] {
  return [
    `Mudar a cor do botão para verde vs vermelho aumenta cliques em ${nicho}?`,
    `Headline com número ("7 formas de...") vs pergunta performa melhor em ${elemento}?`,
    `Adicionar foto de pessoa no CTA de ${elemento} aumenta conversão?`,
    `Preço quebrado (R$ 97) vs preço redondo (R$ 100) converte mais em ${nicho}?`,
    `Garantia de 7 dias vs garantia de 30 dias aumenta confiança?`,
    `Prova social acima do botão vs abaixo do botão converte mais?`,
    `Vídeo curto de 30s vs imagem estática performa melhor?`,
    `Contador regressivo de oferta vs sem contador aumenta urgência?`,
  ]
}
