// PriceMaster Agent — Sugestão de preço ótimo e margem.
// Heurísticas baseadas em categoria, custo, concorrência e preço psicológico.
import type { PricingRequest, PricingResult } from './types'

// Margens ideais por categoria (mínimo, ideal, máximo) em %
const MARGENS_BR: Record<string, { min: number; ideal: number; max: number; strategy: PricingResult['estrategia'] }> = {
  jogos: { min: 0.12, ideal: 0.22, max: 0.35, strategy: 'competitivo' },
  streaming: { min: 0.10, ideal: 0.30, max: 0.55, strategy: 'penetracao' },
  software: { min: 0.25, ideal: 0.45, max: 0.75, strategy: 'premium' },
  cursos: { min: 0.60, ideal: 0.80, max: 0.95, strategy: 'premium' },
  giftcards: { min: 0.05, ideal: 0.12, max: 0.20, strategy: 'competitivo' },
  marketing: { min: 0.55, ideal: 0.80, max: 0.95, strategy: 'skimming' },
  templates: { min: 0.70, ideal: 0.90, max: 0.98, strategy: 'premium' },
  musica: { min: 0.25, ideal: 0.50, max: 0.75, strategy: 'psicologico' },
  ebooks: { min: 0.70, ideal: 0.88, max: 0.97, strategy: 'skimming' },
  api: { min: 0.50, ideal: 0.75, max: 0.90, strategy: 'premium' },
  default: { min: 0.30, ideal: 0.50, max: 0.75, strategy: 'competitivo' },
}

// Preços psicológicos conhecidos (acaba com 9, 90, 99, 7)
function roundPsicologico(v: number): number {
  if (v <= 0) return 0.99
  // Acha o preço psicológico mais próximo (9.90, 19.90, 29.90, 49.90, 99.90, etc.)
  const faixas = [0.99, 1.99, 2.99, 4.90, 5.99, 7.90, 9.90, 12.90, 14.90, 19.90, 24.90, 29.90, 34.90, 39.90, 49.90, 59.90, 69.90, 79.90, 89.90, 99.90, 119.90, 149.90, 199.90, 249.90, 299.90, 399.90, 499.90, 749.90, 999.90]
  for (const f of faixas) if (f >= v * 0.95) return f
  return Math.round(v) - 0.1
}

export function suggestPrice(req: PricingRequest): PricingResult {
  const catKey = (req.categoria || 'default').toLowerCase()
  const cfg = MARGENS_BR[catKey] || MARGENS_BR.default

  const custo = req.custoFornecedor && req.custoFornecedor > 0 ? req.custoFornecedor : null

  let precoIdeal: number
  let margem: number

  if (custo) {
    // Baseado no custo do fornecedor
    precoIdeal = custo / (1 - cfg.ideal)
    margem = cfg.ideal
  } else if (req.concorrentes && req.concorrentes.length > 0) {
    // Baseado em concorrentes: posiciona 5% abaixo da média ponderada
    const ordenados = [...req.concorrentes].sort((a, b) => a - b)
    const mediana = ordenados[Math.floor(ordenados.length / 2)]
    precoIdeal = mediana * 0.95
    margem = cfg.ideal
  } else {
    // Preço default por categoria (heurística)
    const defaults: Record<string, number> = {
      jogos: 29.9, streaming: 19.9, software: 89.9, cursos: 97.0,
      giftcards: 52.9, marketing: 49.9, templates: 29.9, musica: 14.9,
      ebooks: 19.9, api: 39.9,
    }
    precoIdeal = defaults[catKey] || 39.9
    margem = cfg.ideal
  }

  const precoSugerido = roundPsicologico(precoIdeal)
  const precoMinimo = custo ? roundPsicologico(custo / (1 - cfg.min)) : roundPsicologico(precoIdeal * 0.8)
  const precoMaximo = custo ? roundPsicologico(custo / (1 - Math.min(cfg.max, 0.95))) : roundPsicologico(precoIdeal * 1.4)
  const precoPromocional = roundPsicologico(precoSugerido * 0.88)

  const margemLiquida = custo ? Number(((precoSugerido - custo) / precoSugerido).toFixed(2)) : margem

  // Taxa da plataforma: 10% em média (menos em planos Pro)
  const taxaPlataforma = 0.10
  const custoTransacional = 0.0399 + 0.40 / Math.max(precoSugerido, 1) // Stripe ~3.99% + R$0,40
  const lucroReal = custo
    ? Number((precoSugerido * (1 - taxaPlataforma - custoTransacional) - custo).toFixed(2))
    : Number((precoSugerido * (margemLiquida - taxaPlataforma - custoTransacional)).toFixed(2))

  const justificativa = [
    `Estratégia: ${estrategiaLabel(cfg.strategy)}.`,
    custo
      ? `Custo de fornecedor R$ ${custo.toFixed(2)} + margem ideal de ${(margem * 100).toFixed(0)}% para ${req.categoria || 'produto'}.`
      : req.concorrentes?.length
        ? `Baseado em ${req.concorrentes.length} concorrentes — posicionamento 5% abaixo da mediana para ganhar BuyBox.`
        : `Preço médio de mercado para ${req.categoria || 'produtos digitais'} no Brasil.`,
    `Taxa da plataforma (10%) + processamento de pagamento (~${(custoTransacional * 100).toFixed(1)}%) já descontadas: lucro líquido estimado R$ ${lucroReal.toFixed(2)} por venda.`,
    `Preço promocional sugerido para lançamento/oferta: R$ ${precoPromocional.toFixed(2).replace('.', ',')} (12% OFF).`,
    `Use preços psicológicos (terminação em 9,90/9,99) — aumenta conversão em até 24%.`,
  ].join(' ')

  return {
    precoSugerido,
    precoMinimo,
    precoMaximo,
    precoPromocional,
    margemLiquida: Number((margemLiquida * 100).toFixed(1)),
    estrategia: cfg.strategy,
    justificativa,
  }
}

function estrategiaLabel(s: PricingResult['estrategia']): string {
  return {
    penetracao: 'Penetração — preço baixo para ganhar volume e travar clientes',
    premium: 'Premium — preço alto para percepção de qualidade e margem cheia',
    psicologico: 'Psicológico — termina em 9, usa ancoragem e desconto percebido',
    skimming: 'Skimming — preço alto inicial para early adopters, depois baixa',
    competitivo: 'Competitivo — espelha o mercado menos 5% para ganhar o BuyBox',
  }[s]
}
