// LucroMax — Calculadora de lucro real com taxas KIYVO + impostos + custos
// Dá ao vendedor clareza TOTAL do que realmente vai embolsar (sem surpresas)
import { AgentContext, AgentResult } from './types'

export interface LucroMaxInput {
  precoVenda: number
  custoProduto?: number
  custoAnuncio?: number
  custoFrete?: number
  outrosCustos?: number
  cupomPercent?: number
  afiliadoPercent?: number
  planoVendedor?: 'free' | 'plus' | 'pro' | 'vendor_pro'
  incluirImpostos?: boolean
}

interface TaxaConfig { percent: number; fixa: number; cap: number }
const TAXAS: Record<string, TaxaConfig> = {
  free: { percent: 8, fixa: 0.5, cap: 50 },
  plus: { percent: 6.5, fixa: 0.4, cap: 40 },
  pro: { percent: 5, fixa: 0.3, cap: 30 },
  vendor_pro: { percent: 3, fixa: 0.2, cap: 20 },
}

export async function runLucroMax(input: LucroMaxInput, _ctx?: AgentContext): Promise<AgentResult> {
  const {
    precoVenda,
    custoProduto = 0,
    custoAnuncio = 0,
    custoFrete = 0,
    outrosCustos = 0,
    cupomPercent = 0,
    afiliadoPercent = 0,
    planoVendedor = 'free',
    incluirImpostos = false,
  } = input

  if (!precoVenda || precoVenda <= 0) {
    return { ok: false, error: 'Informe um preço de venda válido (acima de R$0).' }
  }

  const taxa = TAXAS[planoVendedor] || TAXAS.free
  const valorCupom = precoVenda * (cupomPercent / 100)
  const precoLiq = precoVenda - valorCupom
  let taxaKiyvo = precoLiq * (taxa.percent / 100) + taxa.fixa
  if (taxaKiyvo > taxa.cap) taxaKiyvo = taxa.cap
  const comissaoAfiliado = precoLiq * (afiliadoPercent / 100)
  const impostos = incluirImpostos ? precoLiq * 0.065 : 0 // Simples Nacional anexo III ~6,5% para digital
  const custosTotais = custoProduto + custoAnuncio + custoFrete + outrosCustos + taxaKiyvo + comissaoAfiliado + impostos
  const lucro = precoLiq - custosTotais
  const margemPercent = precoLiq > 0 ? (lucro / precoLiq) * 100 : 0
  const roi = custosTotais > 0 ? (lucro / custosTotais) * 100 : 0
  const markup = custoProduto > 0 ? ((precoLiq - custoProduto) / custoProduto) * 100 : 0

  // Análise de saúde
  let saude: 'excelente' | 'boa' | 'media' | 'ruim' | 'critica' = 'media'
  let dica = ''
  if (margemPercent >= 60) { saude = 'excelente'; dica = 'Margem excelente! Considere testar um boost de 24h para escalar.' }
  else if (margemPercent >= 40) { saude = 'boa'; dica = 'Boa margem. Um cupom de 10% ainda te deia com lucro saudável.' }
  else if (margemPercent >= 20) { saude = 'media'; dica = 'Margem mediana. Tente aumentar preço em 10% ou cortar custos de anúncio.' }
  else if (margemPercent >= 5) { saude = 'ruim'; dica = 'Margem apertada! Reveja preço e custos antes de vender.' }
  else { saude = 'critica'; dica = 'PREJUÍZO! Aumente o preço ou abandone esse produto.' }

  // Preço ideal para margem de 50%
  const custoPorUnidade = custoProduto + custoAnuncio + custoFrete + outrosCustos + (precoLiq * afiliadoPercent / 100)
  const precoIdeal50 = (custoPorUnidade + taxa.fixa) / (1 - (taxa.percent / 100) - 0.50 - (incluirImpostos ? 0.065 : 0))
  const precoMinimo = (custoPorUnidade + taxa.fixa) / (1 - (taxa.percent / 100) - (incluirImpostos ? 0.065 : 0))

  return {
    ok: true,
    data: {
      precoVenda,
      valorCupom: round2(valorCupom),
      precoLiquido: round2(precoLiq),
      taxaKiyvo: {
        percentual: taxa.percent,
        fixa: taxa.fixa,
        total: round2(taxaKiyvo),
        capAtingido: taxaKiyvo >= taxa.cap,
        cap: taxa.cap,
      },
      comissaoAfiliado: round2(comissaoAfiliado),
      impostos: round2(impostos),
      custosTotais: round2(custosTotais),
      lucroLiquido: round2(lucro),
      margemPercent: round2(margemPercent),
      roi: round2(roi),
      markup: round2(markup),
      saude,
      dica,
      precoIdeal50PorCentoMargem: round2(isFinite(precoIdeal50) ? precoIdeal50 : 0),
      precoMinimoSemPrejuizo: round2(isFinite(precoMinimo) ? precoMinimo : 0),
      aCada100Vendas: round2(lucro * 100),
      tabela: [
        { nome: 'Preço de venda', valor: round2(precoVenda) },
        { nome: 'Cupom aplicado', valor: -round2(valorCupom) },
        { nome: 'Taxa KIYVO', valor: -round2(taxaKiyvo) },
        { nome: 'Afiliado', valor: -round2(comissaoAfiliado) },
        { nome: 'Impostos', valor: -round2(impostos) },
        { nome: 'Custo do produto', valor: -round2(custoProduto) },
        { nome: 'Anúncio (CAC)', valor: -round2(custoAnuncio) },
        { nome: 'Outros custos', valor: -round2(outrosCustos) },
        { nome: 'LUCRO LÍQUIDO', valor: round2(lucro), destaque: true },
      ],
      transparencia: 'Na KIYVO a taxa máxima é de 8% + R$0,50 com teto de R$50. Sem taxas escondidas.',
    },
  }
}

function round2(n: number): number { return Math.round(n * 100) / 100 }
