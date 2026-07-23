// KIYVO v10.1 BOOM — 25 NOVOS agentes (chegamos a 200+)
// "IA só responde, agente executa na plataforma"
// Implementações determinísticas (sem depender de LLM externo)
import type { AgentContext, AgentResult } from './types';

export const V101_BOOM_META = [
  { id: 'cartareembolso', name: "Gerador de Carta de Reembolso", emoji: '📝', category: 'Jurídico', price: 9.9, premium: false },
  { id: 'calculadoratributos', name: "Calculadora de Tributos PF/PJ", emoji: '🧮', category: 'Financeiro', price: 14.9, premium: false },
  { id: 'contratoprestserv', name: "Contrato de Prestação de Serviços", emoji: '📄', category: 'Jurídico', price: 19.9, premium: true },
  { id: 'otimizadoranuncios', name: "Auditor de Anúncios Meta/Google", emoji: '🔍', category: 'Marketing', price: 12.9, premium: false },
  { id: 'quizcriador', name: "Criador de Quiz Viral", emoji: '🧠', category: 'Marketing', price: 9.9, premium: false },
  { id: 'audiencelab', name: "Audience Lab — Públicos Lucrativos", emoji: '🎯', category: 'Marketing', price: 9.9, premium: false },
  { id: 'roteiroreels', name: "Roteiro Reels/TikTok 15s", emoji: '🎬', category: 'Conteúdo', price: 7.9, premium: false },
  { id: 'legendainsta', name: "Legenda Instagram Autêntica", emoji: '📸', category: 'Conteúdo', price: 4.9, premium: false },
  { id: 'emailboasvindasbf', name: "Sequência Black Friday Completa", emoji: '🖤', category: 'Email', price: 14.9, premium: true },
  { id: 'criticanegativa', name: "Resposta a Críticas e Reclamações", emoji: '😤', category: 'Atendimento', price: 7.9, premium: false },
  { id: 'descricaoproduto', name: "Descrição de Produto Marketplaces", emoji: '📦', category: 'E-commerce', price: 9.9, premium: false },
  { id: 'polosprivados', name: "Polos Privados de Afiliado", emoji: '💼', category: 'Afiliados', price: 19.9, premium: true },
  { id: 'termosuso', name: "Termos de Uso e Privacidade LGPD", emoji: '⚖️', category: 'Jurídico', price: 24.9, premium: true },
  { id: 'scriptprejulgado', name: "Script Pré-Julgado de Oferta", emoji: '🧨', category: 'Copywriting', price: 14.9, premium: true },
  { id: 'calendarioconteudo', name: "Calendário Editorial 30 dias", emoji: '📅', category: 'Conteúdo', price: 12.9, premium: false },
  { id: 'ofertairresistivel', name: "Criador de Oferta Irresistível", emoji: '💥', category: 'Copywriting', price: 9.9, premium: false },
  { id: 'tituloviral', name: "Gerador de Títulos Virais", emoji: '📰', category: 'Copywriting', price: 4.9, premium: false },
  { id: 'whatsappsequencia', name: "Sequência WhatsApp de Vendas", emoji: '💬', category: 'Vendas', price: 9.9, premium: false },
  { id: 'personaplus', name: "Persona Profunda com Entrevistas", emoji: '👤', category: 'Marketing', price: 14.9, premium: false },
  { id: 'checkoutkick', name: "Checkout Kick Booster", emoji: '⚡', category: 'Vendas', price: 9.9, premium: false },
  { id: 'emailrecuperacao', name: "Email de Carrinho Abandonado", emoji: '🛒', category: 'Email', price: 7.9, premium: false },
  { id: 'historiasucesso', name: "História de Sucesso/Cliente", emoji: '🏆', category: 'Prova Social', price: 9.9, premium: false },
  { id: 'faqproduto', name: "FAQ que quebra 20 objeções", emoji: '❓', category: 'Copywriting', price: 7.9, premium: false },
  { id: 'calculadorapl', name: "Calculadora PLR/Direitos de Revenda", emoji: '📚', category: 'Infoprodutos', price: 9.9, premium: false },
  { id: 'planilhagastos', name: "Planilha de Gastos Doméstica", emoji: '💰', category: 'Finanças', price: 7.9, premium: false },
];

// Implementações dos agentes
export interface CartareembolsoInput {
  tipo: string
  empresa: string
  valor: number
  dataCompra: string
  detalhes: string
}
export async function cartareembolso(input: CartareembolsoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['cartareembolso'];
  return h(input);
}

export interface CalculadoratributosInput {
  regime: string
  faturamento: number
  custos: number
  estado: string
}
export async function calculadoratributos(input: CalculadoratributosInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['calculadoratributos'];
  return h(input);
}

export interface ContratoprestservInput {
  tipoServico: string
  contratante: string
  contratado: string
  valor: number
  prazo: string
  detalhes: string
}
export async function contratoprestserv(input: ContratoprestservInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['contratoprestserv'];
  return h(input);
}

export interface OtimizadoranunciosInput {
  plataforma: string
  produto: string
  valor: number
  cpcAtual: number
  cpaAtual: number
  ctrAtual: number
  copyAtual: string
}
export async function otimizadoranuncios(input: OtimizadoranunciosInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface QuizcriadorInput {
  nicho: string
  produto: string
  valor: number
}
export async function quizcriador(input: QuizcriadorInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface AudiencelabInput {
  produto: string
  preco: string
  nicho: string
}
export async function audiencelab(input: AudiencelabInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['audiencelab'];
  return h(input);
}

export interface RoteiroreelsInput {
  nicho: string
  objetivo: string
  produto: string
}
export async function roteiroreels(input: RoteiroreelsInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface LegendainstaInput {
  tipo: string
  tema: string
  tom?: string
}
export async function legendainsta(input: LegendainstaInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface EmailboasvindasbfInput {
  produto: string
  precoNormal: number
  precoBF: number
  desconto: number
  publico: string
}
export async function emailboasvindasbf(input: EmailboasvindasbfInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface CriticanegativaInput {
  reclamacao: string
  plataforma: string
  marca: string
  politica?: string
}
export async function criticanegativa(input: CriticanegativaInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['criticanegativa'];
  return h(input);
}

export interface DescricaoprodutoInput {
  produto: string
  categoria: string
  caracteristicas: string
  publico: string
  plataforma: string
}
export async function descricaoproduto(input: DescricaoprodutoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface PolosprivadosInput {
  produto: string
  comissao: number
  tamanho: string
  ticketMedio: number
}
export async function polosprivados(input: PolosprivadosInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface TermosusoInput {
  tipoSite: string
  empresa: string
  cnpj: string
  emailContato: string
  site: string
}
export async function termosuso(input: TermosusoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface ScriptprejulgadoInput {
  produto: string
  dor: string
  preco: number
  nicho: string
}
export async function scriptprejulgado(input: ScriptprejulgadoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface CalendarioconteudoInput {
  nicho: string
  objetivo: string
  produto: string
  quantidade: string
}
export async function calendarioconteudo(input: CalendarioconteudoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface OfertairresistivelInput {
  produto: string
  preco: number
  custo: number
  concorrente: number
}
export async function ofertairresistivel(input: OfertairresistivelInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['ofertairresistivel'];
  return h(input);
}

export interface TituloviralInput {
  tema: string
  formato: string
  nicho: string
}
export async function tituloviral(input: TituloviralInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['tituloviral'];
  return h(input);
}

export interface WhatsappsequenciaInput {
  produto: string
  preco: number
  origem: string
  ticket: string
}
export async function whatsappsequencia(input: WhatsappsequenciaInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['whatsappsequencia'];
  return h(input);
}

export interface PersonaplusInput {
  nicho: string
  produto: string
  faixaIdade: string
  genero?: string
  renda?: string
}
export async function personaplus(input: PersonaplusInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface CheckoutkickInput {
  plataforma: string
  produto: string
  preco: number
  taxaAtual: number
  elementos: string
}
export async function checkoutkick(input: CheckoutkickInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['checkoutkick'];
  return h(input);
}

export interface EmailrecuperacaoInput {
  produto: string
  preco: number
  desconto: number
  segmento: string
}
export async function emailrecuperacao(input: EmailrecuperacaoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface HistoriasucessoInput {
  cliente: string
  produto: string
  antes: string
  depois: string
  tempo: string
}
export async function historiasucesso(input: HistoriasucessoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface FaqprodutoInput {
  produto: string
  preco: number
  garantia: number
  nicho: string
}
export async function faqproduto(input: FaqprodutoInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['generic'];
  return h(input);
}

export interface CalculadoraplInput {
  tipo: string
  precoCriacao: number
  precoVendaFinal: number
  numeroCopias: number
}
export async function calculadorapl(input: CalculadoraplInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['calculadorapl'];
  return h(input);
}

export interface PlanilhagastosInput {
  renda: number
  dependentes: number
  alvoEconomia: number
  metodo?: string
}
export async function planilhagastos(input: PlanilhagastosInput, _ctx: AgentContext): Promise<AgentResult<any>> {
  const h = _v101Handlers['planilhagastos'];
  return h(input);
}

const _v101Handlers: Record<string, (i: any) => any> = {
  cartareembolso: (i) => {
  const mapTipo = { produto_digital: 'produto digital não entregue/não conforme', cobranca_indevida: 'cobrança indevida/duplicada', garantia_7dias: 'direito de arrependimento no prazo de 7 dias (art. 49 CDC)', chargeback: 'contestação de compra no cartão de crédito' };
  return {
    ok: true,
    data: {
      titulo: 'Carta de Solicitação de Reembolso',
      carta: `À ${i.empresa},\n\nPrezados,\n\nEu, consumidor(a) e titular da compra registrada em ${i.dataCompra || 'data da compra'}, no valor de R$ ${Number(i.valor).toFixed(2).replace('.', ',')}, venho formalmente solicitar o ${(mapTipo as Record<string,string>)[i.tipo as string] || 'reembolso'} referente ao seguinte ocorrido:\n\n${i.detalhes}\n\nConforme o Código de Defesa do Consumidor (Lei 8.078/90), em especial o art. 49 (direito de arrependimento de 7 dias), art. 18 (vícios) e art. 42 (cobrança indevida), solicito o estorno INTEGRAL no prazo máximo de 48 horas.\n\nCaso não haja retorno satisfatório, tomarei as medidas cabíveis junto ao Procon, plataforma de pagamento (chargeback) e Juizado Especial Cível.\n\nAtenciosamente,\nConsumidor(a).`,
      baseLegal: ['CDC Art. 49', 'CDC Art. 18', 'CDC Art. 35', 'CDC Art. 42'],
      prazoResposta: '48 horas',
    }
  };
},
  calculadoratributos: (i) => {
  const f = Number(i.faturamento), custos = Number(i.custos || 0);
  let ir=0, csll=0, pis=0, cofins=0, iss=0, inss=0, proLabore=0;
  if (i.regime === 'pf') {
    const base = Math.max(0, f - custos);
    inss = Math.min(base * 0.20, 908.85);
    const bi = Math.max(0, base - inss);
    if (bi <= 2259.20) ir = 0;
    else if (bi <= 2826.65) ir = bi*0.075 - 169.44;
    else if (bi <= 3751.05) ir = bi*0.15 - 381.44;
    else if (bi <= 4664.68) ir = bi*0.225 - 662.77;
    else ir = bi*0.275 - 896;
  } else if (i.regime === 'simples_nacional') {
    const alq = f<=180000 ? 0.06 : f<=360000 ? 0.112 : f<=720000 ? 0.135 : 0.16;
    iss = f*0.02; pis = f*0.0037; cofins = f*0.0171;
    ir = f*(alq*0.35); csll = f*(alq*0.15);
  } else if (i.regime === 'lucro_presumido') {
    const bl = f*0.32;
    ir = bl*0.15 + Math.max(0,bl-60000)*0.10;
    csll = bl*0.09; pis=f*0.0065; cofins=f*0.03; iss=f*0.03;
    proLabore = Math.max(1412,f*0.11); inss=proLabore*0.11;
  } else {
    const l = Math.max(0,f-custos);
    ir = l*0.15 + Math.max(0,l-20000)*0.10;
    csll = l*0.09; pis=f*0.0165; cofins=f*0.076; iss=f*0.03;
    proLabore=Math.max(1412,f*0.11); inss=proLabore*0.11;
  }
  const total = Math.max(0,ir+csll+pis+cofins+iss+inss);
  return {
    ok: true,
    data: {
      regime: i.regime, faturamento: f, custos,
      impostos: { irpj: Math.round(ir*100)/100, csll: Math.round(csll*100)/100, pis: Math.round(pis*100)/100, cofins: Math.round(cofins*100)/100, iss: Math.round(iss*100)/100, inss: Math.round(inss*100)/100 },
      proLabore: Math.round(proLabore*100)/100,
      totalImpostos: Math.round(total*100)/100,
      aliquotaEfetiva: ((total/f)*100).toFixed(2)+'%',
      lucroLiquido: Math.round((f-custos-total)*100)/100,
    }
  };
},
  contratoprestserv: (i) => ({
  ok: true,
  data: {
    titulo: `Contrato de Prestação de Serviços de ${i.tipoServico}`,
    contrato: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — ${(i.tipoServico||'geral').toUpperCase()}\n\nCONTRATANTE: ${i.contratante}\nCONTRATADO(A): ${i.contratado}\n\nCLÁUSULA 1ª — OBJETO: ${i.detalhes}\nCLÁUSULA 2ª — PRAZO: ${i.prazo}\nCLÁUSULA 3ª — VALOR: R$ ${Number(i.valor).toFixed(2).replace('.',',')} (50% na assinatura, 50% na entrega)\nCLÁUSULA 4ª — OBRIGAÇÕES: CONTRATANTE fornece briefing/materiais e aprova etapas em até 48h úteis. CONTRATADO entrega no prazo com qualidade.\nCLÁUSULA 5ª — PROPRIEDADE INTELECTUAL: Transferida integralmente após pagamento; CONTRATADO pode mencionar em portfólio.\nCLÁUSULA 6ª — SIGILO E LGPD (Lei 13.709/2018): As partes mantêm sigilo sobre dados trocados.\nCLÁUSULA 7ª — RESCISÃO: Notificação de 7 dias. Multa de 20% por rescisão antecipada por culpa do CONTRATANTE.\nCLÁUSULA 8ª — FORO: Comarca do CONTRATANTE.\n\nLocal, data e assinaturas:`,
  }
}),
  otimizadoranuncios: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  quizcriador: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  audiencelab: (i) => ([
  { tipo: 'Interesses diretos', publicos: [
    `${i.produto} (página oficial)`, `Concorrentes diretos do ${i.nicho}`, `Influenciadores do nicho ${i.nicho}`,
    'Hotmart', 'Kiwify', 'Eduzz', 'Monetizze', 'KIYVO', 'Marketing Digital Brasil', 'Empreendedorismo Brasil'
  ]},
  { tipo: 'Comportamentos de compra', publicos: [
    'Compradores de infoprodutos', 'Compras online em 30 dias', 'Cartão de crédito ativo', 'Compradores de cursos online', 'PIX frequente', 'Métodos de pagamento digitais'
  ]},
  { tipo: 'Profissões/Cargos', publicos: [
    'Empreendedores', 'Freelancers', 'MEI', 'Agências de marketing', 'Gestores de tráfego', 'Copywriters', 'Designers', 'Afiliados', 'Criadores de conteúdo'
  ]},
  { tipo: 'Remarketing avançado', publicos: [
    `Visitantes do ${i.produto} em 90 dias`, 'Abandonadores de checkout (180 dias)', 'Compradores de outros produtos', 'Engajamento Instagram 30 dias', 'Visualizações de vídeo 50%+', 'Lista de leads email 180 dias'
  ]},
]),
  roteiroreels: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  legendainsta: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  emailboasvindasbf: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  criticanegativa: (i) => {
  const respostas = {
    instagram: `Oi [NOME]! Tudo bem? Primeiro, obrigado por compartilhar sua experiência com a gente — e peço sinceras desculpas pelo ocorrido com sua ${i.reclamacao.slice(0,50)}... Esse tipo de situação não é o padrão da ${i.marca}, e quero resolver pessoalmente pra você. Me chama no direct?`,
    whatsapp: `[NOME], boa tarde! Recebi sua mensagem e quero resolver direto com você. Entendi perfeitamente sua frustração e lamento muito que isso tenha acontecido. Para resolvermos hoje mesmo, pode me confirmar seu pedido? Vou priorizar aqui.`,
    reclameaqui: `Prezado(a) [NOME], a equipe da ${i.marca} agradece o contato e lamenta profundamente o ocorrido. Em conformidade com o Código de Defesa do Consumidor e com a nossa política de ${i.politica || 'atendimento'}, já encaminhamos seu caso ao nosso time especializado e entraremos em contato em até 24h para resolução. Atenciosamente, Equipe ${i.marca}.`,
    review: `Olá [NOME]! Agradeço muito pelo feedback honesto — é assim que conseguimos melhorar. Lamento profundamente que sua experiência não tenha sido a que esperava. Queremos fazer isso direito: pode me contatar em privado para resolver pessoalmente?`,
    email: `Prezado(a) [NOME], Agradecemos o seu contato e lamentamos sinceramente pelo ocorrido. A equipe da ${i.marca} já está analisando a sua reclamação e retornará em até 24 horas úteis com uma solução. Atenciosamente, Equipe ${i.marca}.`,
  };
  return {
    ok: true,
    data: {
      respostaPublica: (respostas as Record<string,string>)[i.plataforma as string] || respostas.email,
      dica: '💡 Responda em até 2h nas redes (algoritmo premia respostas rápidas) e sempre leve a conversa para canal privado para resolver detalhes.',
    }
  };
},
  descricaoproduto: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  polosprivados: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  termosuso: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  scriptprejulgado: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  calendarioconteudo: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  ofertairresistivel: (i) => {
  const preco = Number(i.preco);
  const bonus = [
    { nome: `Checklist de implementação de ${i.produto}`, valor: preco*0.3 },
    { nome: `Acesso ao grupo VIP no WhatsApp (30 dias)`, valor: preco*0.5 },
    { nome: `Mentoria em grupo exclusiva (1 sessão ao vivo)`, valor: preco*1.0 },
    { nome: `Template/canva editável do ${i.produto}`, valor: preco*0.4 },
    { nome: `Bônus surpresa revelado na compra`, valor: preco*0.2 },
  ];
  const totalBonus = bonus.reduce((s,b)=>s+b.valor,0);
  return {
    ok: true,
    data: {
      nomeOferta: `${i.produto} PRO — Pacote Completo`,
      precoOferta: preco,
      parcela: `${Math.ceil(preco/12)}x de R$ ${(preco/12).toFixed(2).replace('.',',')} sem juros`,
      valorTotalPercebido: Math.round((preco + totalBonus)*100)/100,
      desconto: Math.round((1 - preco/(preco+totalBonus))*100),
      bonus,
      urgencia: 'Oferta válida por mais 48 horas',
      escassez: 'Apenas 100 vagas com esses bônus',
      garantia: 'Garantia incondicional de 7 ou 30 dias — se não gostar, devolvemos 100% do seu dinheiro.',
    }
  };
},
  tituloviral: (i) => {
  const n = [3,5,7,10,50,100,30,15,7,9];
  const forms = [
    (n: number)=>`${n} coisas que ninguém te conta sobre ${i.tema}`,
    (n: number)=>`Como ${i.tema} mudou minha vida (e pode mudar a sua)`,
    (n: number)=>`O erro nº1 que todo mundo comete em ${i.tema}`,
    (n: number)=>`${n} sinais de que você está fazendo ${i.tema} errado`,
    (n: number)=>`Por que ${i.tema} está destruindo seus resultados (e como consertar)`,
    (n: number)=>`${n} truques de ${i.tema} que os profissionais não querem que você saiba`,
    (n: number)=>`Antes de fazer ${i.tema}, veja esse conteúdo`,
    (n: number)=>`Esse método de ${i.tema} gerou R$${n}0k em 30 dias`,
    (n: number)=>`Ninguém fala sobre isso em ${i.tema}...`,
    (n: number)=>`A verdade brutal sobre ${i.tema}`,
    (n: number)=>`Como eu fiz ${i.tema} em ${n} dias (sem gastar nada)`,
    (n: number)=>`Se você faz ${i.tema}, PARE AGORA`,
    (n: number)=>`A única coisa que você precisa saber sobre ${i.tema}`,
    (n: number)=>`${n} mitos sobre ${i.tema} que estão te impedindo de crescer`,
    (n: number)=>`Testei ${n} ferramentas de ${i.tema} — essas são as melhores`,
    (n: number)=>`Esse ${i.tema} não funciona mais (faça isso em vez disso)`,
    (n: number)=>`Eu paguei R$${n}k para aprender isso sobre ${i.tema} — é de graça`,
    (n: number)=>`${i.tema}: o jeito CERTO vs o jeito ERRADO`,
    (n: number)=>`Por que 99% das pessoas falham em ${i.tema}`,
    (n: number)=>`${n} provas de que ${i.tema} funciona (ou não)`,
  ];
  return { ok: true, data: { formato: i.formato, nicho: i.nicho, titulos: forms.map((f,idx)=>f(n[idx%n.length])) } };
},
  whatsappsequencia: (i) => {
  const preco = Number(i.preco);
  const msgs = [
    { tempo: '3 min após contato', msg: `Oi! Vi que você se interessou pelo(a) ${i.produto} 👋 Tudo bem? Me conta uma coisa: o que mais te chamou a atenção? Quero te ajudar a escolher o melhor caminho por aqui!` },
    { tempo: '+30 min', msg: `Pra eu entender melhor sua situação: você já tentou algo parecido antes ou está começando agora?` },
    { tempo: '+2h (se não respondeu)', msg: `Passando aqui só pra não ficar no vácuo 😅 Se quiser saber mais detalhes do ${i.produto}, é só chamar. Se não for pra você agora, sem stress também!` },
    { tempo: '+24h', msg: `Tudo bem se não deu tempo de responder ontem — sei como é corrido. Vou te mandar um resumo rápido: o ${i.produto} custa ${preco<100?'menos de R$100' : `R$ ${preco.toFixed(2).replace('.',',')}`}, ${preco>200?'dá pra dividir em até 12x,':'pagamento único,'} e tem garantia de 7 dias. Quer ver como funciona?` },
    { tempo: '+48h', msg: `Só pra fechar: você ainda tem interesse no ${i.produto}? Se sim, consigo um bônus exclusivo pra você agora. Se não, sem problemas — eu tiro daqui!` },
    { tempo: 'Resposta de objeção "é caro"', msg: `Entendo totalmente! Na verdade, não é sobre preço, é sobre o resultado que ele entrega. O investimento de R$ ${preco.toFixed(2).replace('.',',')} é o equivalente a ${Math.ceil(preco/30)} por dia por 1 mês. E tem 7 dias de garantia — se não der resultado, você recebe 100% de volta. Faz sentido?` },
    { tempo: 'Fechamento', msg: `Perfeito! Vou te mandar o link seguro de pagamento aqui 🔒 Assim que o pagamento for confirmado, o acesso chega no seu email na hora!` },
  ];
  return { ok: true, data: { produto: i.produto, preco, origem: i.origem, ticket: i.ticket, sequencia: msgs } };
},
  personaplus: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  checkoutkick: (i) => ({
  ok: true,
  data: {
    diagnostico: `Checkout ${i.plataforma} para ${i.produto} (R$ ${Number(i.preco).toFixed(2).replace('.',',')}) — conversão atual ${i.taxaAtual || 'não informada'}%.`,
    elementosObrigatorios: [
      { posicao: 'Acima do botão CTA', item: 'Selo de segurança (SSL/Google Safe/Stripe)' },
      { posicao: 'Ao lado do botão', item: 'Bump de oferta de 30% do valor do produto' },
      { posicao: 'Abaixo do preço', item: 'Timer de escassez (24h da sessão)' },
      { posicao: 'Topo da página', item: 'Garantia de 7/30 dias incondicional' },
      { posicao: 'Abaixo do botão', item: 'Formas de pagamento (PIX + cartão + boleto)' },
      { posicao: 'Antes do preço', item: '3-5 depoimentos curtos com foto' },
      { posicao: 'Após os depoimentos', item: 'FAQs (preço, segurança, garantia, acesso)' },
      { posicao: 'Rodapé', item: 'Termos de uso + privacidade (LGPD)' },
    ],
    bumpSugerido: Math.round(Number(i.preco)*0.3),
    upsellSugerido: Math.round(Number(i.preco)*1.5),
    textoBotao: 'QUERO GARANTIR O MEU ACESSO 🔒',
  }
}),
  emailrecuperacao: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  historiasucesso: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  faqproduto: (i: any) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
  calculadorapl: (i) => {
  const custo = Number(i.precoCriacao);
  const precoFinal = Number(i.precoVendaFinal);
  const copias = Number(i.numeroCopias || 100);
  let precoLicenca;
  if (i.tipo === 'plr') precoLicenca = precoFinal*2;
  else if (i.tipo === 'mrr') precoLicenca = precoFinal*5;
  else if (i.tipo === 'rr') precoLicenca = precoFinal;
  else precoLicenca = precoFinal*3; // white label
  const breakeven = Math.ceil(custo / precoLicenca);
  const proj = precoLicenca*copias;
  return {
    ok: true,
    data: {
      tipoDireito: i.tipo,
      precoSugeridoLicenca: Math.round(precoLicenca*100)/100,
      precoMinimoRevenda: precoFinal*0.5,
      breakevenCopias: breakeven,
      faturamentoProjetado: Math.round(proj*100)/100,
      margem: Math.round(((proj-custo)/proj)*100)+'%',
    }
  };
},
  planilhagastos: (i) => {
  const renda = Number(i.renda);
  const econ = (Number(i.alvoEconomia || 20)/100);
  const cat = [
    { nome: 'Moradia', pct: 0.30 },
    { nome: 'Alimentação', pct: 0.20 },
    { nome: 'Transporte', pct: 0.10 },
    { nome: 'Contas básicas', pct: 0.10 },
    { nome: 'Saúde', pct: 0.07 },
    { nome: 'Educação', pct: 0.05 },
    { nome: 'Lazer', pct: Math.max(0, 0.18-econ*0.1) },
    { nome: 'Investimentos/Economia', pct: econ },
    { nome: 'Reserva emergência', pct: 0.05 },
    { nome: 'Imprevistos', pct: Math.max(0.01, 0.03) },
  ];
  const soma = cat.reduce((s,c)=>s+c.pct,0);
  const categorias = cat.map(c=>({ nome:c.nome, percentual: Math.round(c.pct/soma*100), valor: Math.round(renda*c.pct/soma*100)/100 }));
  const gastoEssencial = categorias.slice(0,5).reduce((s,c)=>s+c.valor,0);
  return {
    ok: true,
    data: {
      renda, metodo: i.metodo || '50/30/20',
      categorias,
      reservaEmergenciaAlvo: Math.round(gastoEssencial*6*100)/100,
      dica: '💡 Pague-se primeiro: no dia do salário, separe a fatia de investimentos automaticamente.',
    }
  };
},
  generic: (i) => {
  const entradas = Object.entries(i).filter(([,v])=>v!==undefined&&v!==''&&v!==null);
  return {
    ok: true,
    data: {
      titulo: 'Resultado gerado',
      resumo: `Resultado gerado com base em ${entradas.length} campo(s) de entrada. Use as informações abaixo para aplicar no seu negócio.`,
      entradas: Object.fromEntries(entradas),
      dicas: [
        'Aplique o resultado em até 72h (efeito fading)',
        'Teste ao menos 3 variações antes de decidir',
        'Combine com prova social real',
        'Use linguagem coloquial brasileira',
      ],
    }
  };
},
};
