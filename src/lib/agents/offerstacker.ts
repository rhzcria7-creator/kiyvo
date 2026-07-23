// Agente OfferStacker — cria ofertas imbatíveis (stack: front-end, upsell, downsell, OTO, bump)
export interface OfferStackerInput {
  produto: string
  precoBase: number
  valorPercebido?: number
  nicho?: string
}
export interface Offer {
  nome: string
  tipo: 'lead_magnet' | 'front_end' | 'bump' | 'upsell_1' | 'upsell_2' | 'downsell'
  preco: number
  valor: number
  descricao: string
  justificativa: string
}
export interface OfferStackerResult {
  tituloFunil: string
  ticketMedioEstimado: number
  ltvEstimado: number
  ofertas: Offer[]
  scriptCheckout: string
  scriptUpsell: string
  observacoes: string[]
}

export function criarOfferStack(input: OfferStackerInput): OfferStackerResult {
  const { produto, precoBase, valorPercebido = precoBase * 3, nicho = 'digital' } = input
  const p = Math.max(1, precoBase)
  const ofertas: Offer[] = [
    {
      nome: `Mini-Guia Rápido de ${produto}`,
      tipo: 'lead_magnet', preco: 0, valor: p * 2,
      descricao: `Ebook curto (10-15 páginas) com os 3 primeiros passos de ${produto}. Entrega por email em troca de cadastro.`,
      justificativa: 'Isca digital gratuita para capturar leads qualificados.',
    },
    {
      nome: `${produto} — Versão Completa`,
      tipo: 'front_end', preco: Math.round(p * 100) / 100, valor: valorPercebido,
      descricao: `Produto principal ${produto} com suporte por 7 dias e garantia de 7 dias.`,
      justificativa: 'Oferta inicial com preço psicológico e valor percebido alto.',
    },
    {
      nome: `Checklist + Planilhas Prontas`,
      tipo: 'bump', preco: Math.round(p * 0.3 * 100) / 100, valor: p * 1.2,
      descricao: 'Adicione no checkout. Checklist interativo + planilhas prontas para aplicar no mesmo dia.',
      justificativa: 'Bump de 30% do valor do front aumenta ticket médio em 20-30% sem trabalho extra.',
    },
    {
      nome: `Versão PRO de ${produto}`,
      tipo: 'upsell_1', preco: Math.round(p * 2 * 100) / 100, valor: p * 5,
      descricao: 'Versão Pro com +80% de conteúdo, suporte prioritário, grupo VIP e atualizações por 1 ano.',
      justificativa: 'Upsell imediato (Obrigado, a oferta abaixo expira em 15 minutos): 30% de conversão.',
    },
    {
      nome: `Mentoria/Masterclass (ao-vivo)`,
      tipo: 'upsell_2', preco: Math.round(p * 5 * 100) / 100, valor: p * 10,
      descricao: '4 encontros ao vivo com o produtor + acesso à comunidade fechada.',
      justificativa: 'Segundo upsell para quem comprou o PRO — LTV máximo.',
    },
    {
      nome: `Versão Básica + Suporte 30 dias`,
      tipo: 'downsell', preco: Math.round(p * 0.6 * 100) / 100, valor: p * 2,
      descricao: 'Se o usuário recusar o upsell 1, ofereça versão intermediária com 40% de desconto.',
      justificativa: 'Recupera 15-20% dos clientes que rejeitaram o upsell caro.',
    },
  ]
  const taxaConversaoEsperada = { front: 0.05, bump: 0.25, up1: 0.2, up2: 0.08, down: 0.15 }
  let ticketMedio = p
  ticketMedio += ofertas[2].preco * taxaConversaoEsperada.bump
  let aposUp1 = ticketMedio + ofertas[3].preco * taxaConversaoEsperada.up1
  let aposDown = aposUp1 + (ofertas[5].preco - ofertas[3].preco) * taxaConversaoEsperada.down * 0.3
  const ticketMedioEstimado = Math.round(aposDown * 100) / 100
  const ltvEstimado = Math.round(ticketMedioEstimado * 1.8 * 100) / 100
  return {
    tituloFunil: `Funil Completo: ${produto}`,
    ticketMedioEstimado,
    ltvEstimado,
    ofertas,
    scriptCheckout: `Pronto! 🎉 Sua compra do ${produto} foi concluída. Antes de ir... Tenho uma oferta exclusiva para você disponível apenas nesta página e pelos próximos 15 minutos.`,
    scriptUpsell: `Quer dobrar seus resultados com ${produto}? O ${ofertas[3].nome} sai HOJE por apenas R$ ${ofertas[3].preco.toFixed(2)} (economia de R$ ${(ofertas[3].valor - ofertas[3].preco).toFixed(2)}). Clique em SIM para adicionar AGORA.`,
    observacoes: [
      'Use timer de 15 minutos no upsell (oferta expira).',
      'Bump deve estar com checkbox DESMARCADO por padrão (LGPD).',
      'Garantia de 7 dias em TODOS os produtos.',
      'Use testemunhos reais nas páginas de upsell.',
      `Nicho detectado: ${nicho} — ajuste a copy para a linguagem do público.`,
    ],
  }
}
