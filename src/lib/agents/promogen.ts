// ─────────────────────────────────────────────────────────────
// PromoGen - Gerador de promoções/descontos inteligente
// Gera nomes de campanha, regras, countdown e cronograma de posts
// baseado em preço, margem e objetivo (vender, liquidar, lancar)
// ─────────────────────────────────────────────────────────────

export type PromoGoal = 'vender' | 'liquidar' | 'lancar' | 'fidelizar'
export type PromoChannel = 'whatsapp' | 'instagram' | 'tiktok' | 'email'

export interface PromoGenInput {
  produtoNome: string
  precoAtual: number
  precoCusto?: number
  objetivo?: PromoGoal
  estoque?: number
  duracaoDias?: number
  canal?: PromoChannel
}

export interface PromoVariant {
  nome: string
  descontoPct: number
  precoFinal: number
  regra: string
  urgencia: string
}

export interface PromoScheduleItem {
  dia: number
  canal: PromoChannel
  conteudo: string
  callToAction: string
}

export interface PromoGenResult {
  campanhaNome: string
  tagline: string
  variantes: PromoVariant[]
  recomendada: PromoVariant
  cronograma: PromoScheduleItem[]
  cupomSugerido: string
  countdownCopy: string
  kpis: {
    margemEstimada: number
    receitaEstoqueTotal: number
    descontoMedioPct: number
  }
}

function gerarCupom(nome: string): string {
  const prefixo = nome.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'KIY'
  const rand = Math.floor(Math.random() * 90) + 10
  return `${prefixo}${rand}`
}

const CAMPANHA_PREFIXOS: Record<PromoGoal, string[]> = {
  vender: ['Semana do Consumidor', 'Oferta Relâmpago', 'Queima de Preço', 'Desconto Progressivo'],
  liquidar: ['Queima de Estoque', 'Liquidation KIYVO', 'Últimas Unidades', 'Tudo Precisa Sair'],
  lancar: ['Lançamento KIYVO', 'Early Bird', 'Acesso Antecipado', 'Pré-venda Exclusiva'],
  fidelizar: ['Semana do Cliente', 'Só para Quem Já Comprou', 'VIP Exclusive', 'KD Boost'],
}

function calcDesconto(objetivo: PromoGoal, precoCusto: number, precoAtual: number): number {
  const margem = Math.max(0, (precoAtual - precoCusto) / precoAtual)
  switch (objetivo) {
    case 'liquidar': return Math.min(50, Math.round(35 + margem * 20))
    case 'lancar': return Math.min(20, Math.round(margem * 30))
    case 'fidelizar': return Math.min(25, Math.round(margem * 25))
    case 'vender':
    default: return Math.min(40, Math.round(margem * 35))
  }
}

export function generatePromo(input: PromoGenInput): PromoGenResult {
  const objetivo = input.objetivo || 'vender'
  const duracao = Math.max(1, Math.min(30, input.duracaoDias || 7))
  const canal = input.canal || 'instagram'
  const custo = input.precoCusto || input.precoAtual * 0.5 // padrão 50%
  const descontoBase = calcDesconto(objetivo, custo, input.precoAtual)

  const nomes = CAMPANHA_PREFIXOS[objetivo]
  const campanhaNome = nomes[Math.floor(Math.random() * nomes.length)] + ': ' + input.produtoNome

  const variantes: PromoVariant[] = [
    {
      nome: 'Relâmpago (24h)',
      descontoPct: Math.min(60, descontoBase + 15),
      precoFinal: Math.round(input.precoAtual * (1 - (Math.min(60, descontoBase + 15)) / 100) * 100) / 100,
      regra: 'Válido por 24 horas ou enquanto durar o estoque.',
      urgencia: '⏰ Últimas horas!',
    },
    {
      nome: 'Padrão recomendado',
      descontoPct: descontoBase,
      precoFinal: Math.round(input.precoAtual * (1 - descontoBase / 100) * 100) / 100,
      regra: `Válido por ${duracao} dias para todos os compradores.`,
      urgencia: `🔥 Oferta por tempo limitado (${duracao} dias)`,
    },
    {
      nome: 'Leve + Pague Menos',
      descontoPct: Math.max(5, descontoBase - 10),
      precoFinal: Math.round(input.precoAtual * (1 - Math.max(5, descontoBase - 10) / 100) * 100) / 100,
      regra: `${Math.max(5, descontoBase - 10)}% OFF em 1 unidade, ${descontoBase}% OFF a partir de 2.`,
      urgencia: '👥 Traga um amigo e ganhem mais desconto',
    },
    {
      nome: 'Exclusiva KD Points',
      descontoPct: descontoBase + 5,
      precoFinal: Math.round(input.precoAtual * (1 - (descontoBase + 5) / 100) * 100) / 100,
      regra: 'Válida para quem usar KD Points — limite de 50% OFF no total.',
      urgencia: '💎 Apenas para membros',
    },
    {
      nome: 'Cupom de Primeira Compra',
      descontoPct: Math.max(10, descontoBase),
      precoFinal: Math.round(input.precoAtual * (1 - Math.max(10, descontoBase) / 100) * 100) / 100,
      regra: 'Válido somente na primeira compra do usuário.',
      urgencia: '🎁 Boas-vindas',
    },
  ]

  const recomendada = variantes[1]

  const cupomSugerido = gerarCupom(input.produtoNome)

  const cronograma: PromoScheduleItem[] = []
  for (let d = 1; d <= Math.min(duracao, 5); d++) {
    let conteudo = ''
    let cta = ''
    if (d === 1) {
      conteudo = `${campanhaNome} COMEÇOU AGORA! ${recomendada.descontoPct}% OFF em ${input.produtoNome}. Use o cupom ${cupomSugerido}.`
      cta = `Comprar agora (${recomendada.precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`
    } else if (d === Math.ceil(duracao / 2)) {
      conteudo = `Metade da campanha! ${recomendada.descontoPct}% OFF em ${input.produtoNome}. Estoque baixando rápido.`
      cta = 'Garantir o meu'
    } else if (d === duracao - 1) {
      conteudo = `ÚLTIMAS 24h! ${recomendada.descontoPct}% OFF em ${input.produtoNome}. Depois volta ao preço normal.`
      cta = 'Não perder oferta'
    } else if (d === duracao) {
      conteudo = `ENCERRANDO HOJE! ${recomendada.descontoPct}% OFF — últimas unidades.`
      cta = 'Comprar agora ou nunca'
    } else {
      conteudo = `Ainda tá valendo: ${recomendada.descontoPct}% OFF em ${input.produtoNome}.`
      cta = 'Aproveitar'
    }
    cronograma.push({ dia: d, canal, conteudo, callToAction: cta })
  }

  const countdownCopy = `⏰ ${duracao} dias • ${recomendada.descontoPct}% OFF • cupom ${cupomSugerido}`
  const margemEstimada = Math.round(((recomendada.precoFinal - custo) / recomendada.precoFinal) * 100)
  const receitaEstoqueTotal = Math.round(recomendada.precoFinal * (input.estoque || 10) * 100) / 100
  const descontoMedio = Math.round(variantes.reduce((s, v) => s + v.descontoPct, 0) / variantes.length)

  return {
    campanhaNome,
    tagline: recomendada.urgencia,
    variantes,
    recomendada,
    cronograma,
    cupomSugerido,
    countdownCopy,
    kpis: { margemEstimada, receitaEstoqueTotal, descontoMedioPct: descontoMedio },
  }
}
