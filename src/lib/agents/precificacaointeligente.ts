// PrecificacaoInteligente — Sugere preços ótimos com base em psicologia e mercado
import { AgentContext, AgentResult } from './types'

export interface PrecificacaoInput {
  custo: number
  nicho: string
  concorrenteMin?: number
  concorrenteMax?: number
  qualidadade: 'basica' | 'premium' | 'ultra'
  incluirTaxasKiyvo?: boolean
  margemDesejada?: number
}

export async function runPrecificacaoInteligente(input: PrecificacaoInput, _ctx?: AgentContext): Promise<AgentResult> {
  const { custo, nicho, concorrenteMin, concorrenteMax, qualidadade, incluirTaxasKiyvo = true, margemDesejada = 50 } = input
  if (!custo || custo <= 0) return { ok: false, error: 'Informe o custo do produto.' }

  const margensBase: Record<string, number> = { basica: 50, premium: 70, ultra: 85 }
  const m = margemDesejada || margensBase[qualidadade] || 60

  // Preço psicológico: termina com 7 ou 9
  const psicologicos = (p: number) => {
    const opts = [Math.floor(p) - 0.01, Math.floor(p) - 0.1, Math.floor(p - 3) + 2.97, Math.floor(p - 7) + 6.97, Math.floor(p - 10) + 9.97]
    return Array.from(new Set(opts.filter(v => v > custo * 1.3).map(v => Math.round(v * 100) / 100))).slice(0, 5)
  }

  const fatTaxa = incluirTaxasKiyvo ? 1.10 : 1 // ~10% para cobrir taxa + afiliado
  const precoMinimo = custo / (1 - m / 100) * fatTaxa
  const precoIdeal = precoMinimo * 1.2
  const precoPremium = precoMinimo * 1.8
  const precoAnchor = precoPremium * 1.4

  // Preços charmosos
  const charmPrices = [9.97, 17, 27, 37, 47, 67, 97, 147, 197, 297, 497, 697, 997, 1497, 1997, 2997, 4997]
  const bestCharm = charmPrices.reverse().find(p => p >= precoIdeal) || charmPrices[charmPrices.length - 1]

  let concorrenteMedia = 0
  if (concorrenteMin && concorrenteMax) {
    concorrenteMedia = (concorrenteMin + concorrenteMax) / 2
  }

  return {
    ok: true,
    data: {
      nicho,
      qualidadade,
      custoBase: custo,
      sugestoes: [
        { tipo: 'Preço MÍNIMO (sem prejuízo)', valor: round2(precoMinimo), uso: 'Liquidar estoque ou black friday' },
        { tipo: 'Preço ENTRADA (margem base)', valor: round2(precoMinimo * 1.1), uso: 'Funil de entrada para capturar leads' },
        { tipo: 'Preço IDEAL (recomendado)', valor: bestCharm, uso: 'Venda padrão com alta conversão' },
        { tipo: 'Preço PREMIUM', valor: round2(precoPremium), uso: 'Versão premium/avançada' },
        { tipo: 'Preço ÂNCORA', valor: round2(precoAnchor), uso: 'Risco reverso, preço cheio antes de promoção' },
      ],
      precosPsicologicos: psicologicos(precoIdeal),
      concorrencia: concorrenteMedia > 0 ? {
        minimo: concorrenteMin,
        maximo: concorrenteMax,
        media: concorrenteMedia,
        recomendacao: bestCharm <= concorrenteMedia * 0.95 ? 'Preço agressivo (mais barato que média)' : bestCharm >= concorrenteMedia * 1.1 ? 'Preço premium (justifique com valor)' : 'Preço alinhado com mercado',
      } : null,
      estrategias: [
        'Use números que terminam em 7 (ex: R$47, R$97) — têm maior conversão em produtos digitais',
        'Sempre mostre um preço âncora maior para evidenciar o desconto',
        `Para ${nicho}, a margem ideal está entre ${qualidadade === 'ultra' ? '80-90%' : qualidadade === 'premium' ? '60-80%' : '40-60%'}`,
        'Ofereça uma versão por R$10 a mais que o dobro da versão básica',
        'Considere parcelamento: se o preço ideal for R$97, ofereça 12x de R$9,70',
      ],
      regrasPsicologicas: [
        'R$9,97 < R$10 (cérebro lê como 9 reais)',
        'R$47, R$67, R$97, R$147, R$197 são "preços mágicos" do marketing digital BR',
        'Nunca use .99 em produto digital — parece produto físico barato',
        'Use .90 ou .00 em preços acima de R$500 (parece mais premium)',
      ],
    },
  }
}
function round2(n: number) { return Math.round(n * 100) / 100 }
