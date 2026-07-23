// Agente FunnelForge — cria funis de vendas completos (Oficina 24h, Perpétuo, Lançamento Sniper)
// Com 6 etapas: Topo → Meio → Fundo → Upsell → Nurture → Retenção

export type FunnelType = 'oficina_24h' | 'perpetuo' | 'lancamento_sniper' | 'tripwire' | 'high_ticket' | 'afiliado' | 'lead_ads'

export interface FunnelForgeInput {
  produto: string
  preco: number
  nicho: string
  publico: string
  tipo?: FunnelType
  ticketMedio?: number
  leadsPorDia?: number
}

export interface FunnelEtapa {
  nome: string
  objetivo: string
  ativos: string[]
  metaConversao: string
  tempoEstimado: string
}

export interface FunnelForgeOutput {
  nomeFunil: string
  resumo: string
  ticketSugerido: number
  etapas: FunnelEtapa[]
  orcamentoTrafego: { diario: string; semanal: string; mensal: string }
  roiEstimado: string
  kpis: Array<{ kpi: string; valor: string }>
  riscos: string[]
  checklistLancamento: string[]
}

function fmtBrl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function gerarFunil(input: FunnelForgeInput): FunnelForgeOutput {
  const { produto, preco, nicho, publico, tipo = 'perpetuo', leadsPorDia = 100 } = input
  const ticket = preco

  const funis: Record<FunnelType, { nome: string; resumo: string }> = {
    oficina_24h: { nome: 'Oficina 24h (Desafio)', resumo: 'Funil rápido de 1 dia com oferta urgente — alta conversão para ticket baixo/médio.' },
    perpetuo: { nome: 'Funil Perpétuo', resumo: 'Funil automatizado que vende 24h/dia sem você aparecer — previsibilidade de receita.' },
    lancamento_sniper: { nome: 'Lançamento Sniper 7D', resumo: '7 dias de aquecimento + 3 dias de carrinho aberto para máxima receita concentrada.' },
    tripwire: { nome: 'Tripwire + Core + Upsell', resumo: 'Entrada com produto de R$7-27 para converter frio, depois upsell automático.' },
    high_ticket: { nome: 'High Ticket — Application Funnel', resumo: 'Aplicação → Call → Fechamento. Para tickets de R$1.5k+ (mentorias, cursos premium).' },
    afiliado: { nome: 'Funil Afiliado Hot/Launch', resumo: 'Funil de captura afiliado com bônus exclusivos + bridge page.' },
    lead_ads: { nome: 'Lead Ads Simples', resumo: 'Meta/Google Lead Ads direto pro WhatsApp — funil mais simples do Brasil.' },
  }

  const info = funis[tipo]
  let etapas: FunnelEtapa[] = []

  if (tipo === 'oficina_24h') {
    etapas = [
      { nome: '🔥 Ad → Página de Registro', objetivo: `Capturar leads com promessa de valor sobre ${nicho}`, ativos: ['2 anúncios (hook dor + solução)', 'Vídeo de 60s', 'Página de captura com contador 24h'], metaConversao: '35% opt-in', tempoEstimado: '1 dia' },
      { nome: '🎓 Oficina ao vivo', objetivo: `Ensinar 1 conteúdo transformador sobre ${produto} e apresentar oferta`, ativos: ['Slides 30-45min', 'Oferta na metade e no final', 'Bônus por compra em 15min'], metaConversao: '8% compra na live', tempoEstimado: '1 dia' },
      { nome: '💾 Replay 24h', objetivo: 'Converter quem não comprou ao vivo', ativos: ['Replay com contador', '2 e-mails de urgência'], metaConversao: '+3% vendas no replay', tempoEstimado: '1 dia' },
      { nome: '🔄 Cartas de Venda', objetivo: 'Vender quem não abriu o replay', ativos: ['Sequência de 5 e-mails', 'Retargeting Meta/Google'], metaConversao: '+2% vendas', tempoEstimado: '5 dias' },
    ]
  } else if (tipo === 'perpetuo') {
    etapas = [
      { nome: '📣 Tráfego frio', objetivo: `Atrair ${publico} com problema que ${produto} resolve`, ativos: ['6-10 anúncios de dor', '3 vídeos longos (VSL)', 'Reels curtos'], metaConversao: 'CTR > 1.5%', tempoEstimado: 'Contínuo' },
      { nome: '🎁 Isca digital', objetivo: 'Capturar e-mail/WhatsApp', ativos: ['PDF, checklist ou mini-curso gratuito', '3 headlines testadas'], metaConversao: '25-40% opt-in', tempoEstimado: '2 dias pra criar' },
      { nome: '📧 Nutrição 3-7 dias', objetivo: 'Construir confiança com conteúdo', ativos: ['Sequência de 5-7 e-mails', 'Indutor de resposta', 'Prova social'], metaConversao: 'Taxa de abertura > 30%', tempoEstimado: 'Automatizado' },
      { nome: '💰 Página de vendas', objetivo: `Converter em ${produto}`, ativos: ['VSL 8-15min', 'Copy longa', 'Checkout transparente'], metaConversao: '2-5% compra', tempoEstimado: 'Contínuo' },
      { nome: '⬆️ Order Bump + Upsell', objetivo: 'Aumentar ticket médio em 30%+', ativos: ['Order bump R$27-47', 'Upsell 1-click de R$97-297'], metaConversao: '20-40% pega bump', tempoEstimado: 'Contínuo' },
      { nome: '🔁 Retenção e Nurture', objetivo: 'Reativar quem não comprou', ativos: ['Newsletter semanal', 'Retargeting 30 dias', 'Cupom reativação 10%'], metaConversao: '+2% vendas extras', tempoEstimado: 'Contínuo' },
    ]
  } else if (tipo === 'tripwire') {
    etapas = [
      { nome: '🎯 Ad quente', objetivo: 'Atrair com oferta barata', ativos: ['Produto R$7, R$9, R$17 ou R$27'], metaConversao: '3-8% compra tripwire', tempoEstimado: '1 dia' },
      { nome: '⬆️ Upsell 1-click', objetivo: 'Vender produto core após tripwire', ativos: [`${produto} por ${fmtBrl(preco)}`], metaConversao: '15-25% pega upsell', tempoEstimado: 'Imediato' },
      { nome: '💎 Upsell premium', objetivo: 'Pacote completo', ativos: [`Versão premium por ${fmtBrl(preco * 3)}`], metaConversao: '5-10%', tempoEstimado: 'Imediato' },
    ]
  } else {
    etapas = [
      { nome: '🎯 Tráfego', objetivo: `Atrair ${publico}`, ativos: ['Anúncios Meta/Google', 'Orgânico'], metaConversao: 'CTR > 1%', tempoEstimado: 'Contínuo' },
      { nome: '📥 Captura', objetivo: 'Gerar leads qualificados', ativos: ['Isca alinhada'], metaConversao: '20%+ opt-in', tempoEstimado: '2 dias' },
      { nome: '🧠 Aquecimento', objetivo: 'Construir valor', ativos: ['E-mails + Reels + Lives'], metaConversao: 'Engajamento > 15%', tempoEstimado: '3-10 dias' },
      { nome: '💳 Checkout', objetivo: `Vender ${produto}`, ativos: ['Página de vendas', 'Checkout pix+cartão'], metaConversao: '1-5% compra', tempoEstimado: '3 dias aberto' },
    ]
  }

  const diario = leadsPorDia * 0.5 // ~R$0.50 por lead BR
  const roiBase = tipo === 'tripwire' ? 3.2 : tipo === 'high_ticket' ? 6.5 : 2.4

  return {
    nomeFunil: info.nome,
    resumo: info.resumo,
    ticketSugerido: ticket,
    etapas,
    orcamentoTrafego: {
      diario: fmtBrl(diario),
      semanal: fmtBrl(diario * 7),
      mensal: fmtBrl(diario * 30),
    },
    roiEstimado: `${roiBase.toFixed(1)}x a ${(roiBase * 1.8).toFixed(1)}x ROI em 30 dias`,
    kpis: [
      { kpi: 'CAC estimado', valor: fmtBrl(0.5 + Math.random() * 3) },
      { kpi: 'Conversão média esperada', valor: `${(1.5 + Math.random() * 3).toFixed(1)}%` },
      { kpi: 'LTV projetado', valor: fmtBrl(ticket * 1.6) },
      { kpi: 'Payback', valor: '14-21 dias' },
      { kpi: 'CPA aceitável', valor: fmtBrl(ticket * 0.35) },
    ],
    risc: [
      '❌ Se o hook do anúncio não acertar a dor, CAC estoura',
      '❌ Sem prova social (depoimentos) a conversão cai 50%+',
      '❌ Checkout lento ou burocrático mata 30% das vendas',
      '❌ Não pule a etapa de nutrição para funis de ticket alto',
    ],
    checklistLancamento: [
      '✅ Pixel da Meta + Google Analytics instalados',
      '✅ Webhook de compra conectado ao e-mail',
      '✅ Página de obrigado com compartilhamento social',
      '✅ 3 anúncios com hooks diferentes em teste',
      '✅ Página de vendas mobile 100% testada',
      '✅ Teste de compra real com cartão R$1',
      '✅ Políticas de privacidade e termos no rodapé',
      '✅ Suporte preparado para responder em até 15min',
    ],
  } as FunnelForgeOutput & { risc: string[] }
}
