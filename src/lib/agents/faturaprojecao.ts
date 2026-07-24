// Agente FaturaProjecao — projeta faturamento com base em funil
export interface FaturamentoInput { visitantes: number; taxaConversao?: number; ticketMedio?: number; cpa?: number; margem?: number; dias?: number }
export interface Cenario { visitantes: number; vendas: number; faturamento: number; lucro: number; roas?: number }
export interface FaturamentoResult { resumo: Cenario; piorCenario: Cenario; melhorCenario: Cenario; roas?: number; payback?: number; acoes: string[]; }

export function projetarFaturamento(input: FaturamentoInput): FaturamentoResult {
  const { visitantes, taxaConversao = 0.02, ticketMedio = 97, cpa = 0, margem = 0.7, dias = 30 } = input
  const calcular = (v: number, t: number) => {
    const vendas = Math.round(v * t)
    const faturamento = Math.round(vendas * ticketMedio * 100) / 100
    const custoAnuncios = v * cpa
    const lucroBruto = faturamento * margem
    const lucro = Math.round((lucroBruto - custoAnuncios) * 100) / 100
    const investimento = custoAnuncios
    const roas = investimento > 0 ? Math.round((faturamento / investimento) * 100) / 100 : undefined
    return { visitantes: Math.round(v), vendas, faturamento, lucro, roas }
  }
  const resumo = calcular(visitantes, taxaConversao)
  const pior = calcular(visitantes * 0.6, taxaConversao * 0.6)
  const melhor = calcular(visitantes * 1.4, taxaConversao * 1.4)
  const acoes = [
    'Melhore a página de vendas para subir conversão (LandingChecker).',
    'Teste 3 ângulos de anúncio diferentes antes de escalar.',
    'Adicione upsell no obrigado (OfferStacker) para subir ticket médio.',
    `Pra bater R$ 10k/mês você precisa de ~${Math.round(10000/(ticketMedio*taxaConversao))} visitas/mês.`,
  ]
  return { resumo, piorCenario: pior, melhorCenario: melhor, roas: resumo.roas, payback: dias, acoes }
}
