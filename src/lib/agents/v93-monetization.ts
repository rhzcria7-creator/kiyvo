// Agentes v9.3 — +10 agentes focados em RECEITA DIRETA para vendedores
import type { AgentContext, AgentResult } from './types'

const fmtBRL = (n: number) => 'R$' + n.toFixed(2).replace('.', ',')
const round2 = (n: number) => Math.round(n * 100) / 100

// ─────────────────────────────────────────────────────────────
// 1) PitchVenda — pitch de 30s / 1min / elevador
// ─────────────────────────────────────────────────────────────
export interface PitchVendaInput {
  produtoNome: string
  nicho: string
  dor: string
  resultado: string
  preco?: number
}
export async function runPitchVenda(i: PitchVendaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.dor) return { ok: false, error: 'Preencha.' }
  const precoTxt = i.preco ? ` por apenas ${fmtBRL(i.preco)}` : ''
  return {
    ok: true,
    data: {
      versao30seg: `Você tá ${i.dor}? O ${i.produtoNome} é a solução que te ajuda a ${i.resultado}${precoTxt}, com garantia de 7 dias. Quer ver como funciona?`,
      versao1min: `Deixa eu te contar rapidamente. Se você é de ${i.nicho} e tá sofrendo com ${i.dor}, eu tenho algo que pode mudar o jogo. O ${i.produtoNome} foi criado exatamente pra resolver isso: ele te leva de onde você tá hoje até ${i.resultado}, sem enrolação${precoTxt}. E tem garantia de 7 dias, então você não tem nada a perder. Quer saber mais?`,
      versaoDM: `Oi! Vi que você é de ${i.nicho}. O ${i.produtoNome} é pra quem tá cansado de ${i.dor} e quer ${i.resultado}${precoTxt}. Garantia de 7 dias. Posso te mandar mais informações?`,
      versaoReels: `Para TUDO 🛑\n\nSe você tá ${i.dor}, você PRECISA conhecer o ${i.produtoNome}.\n\nEle te faz ${i.resultado}${precoTxt}.\n\nClica no link da bio. 👇`,
      estrutura: 'Problema → Solução → Preço + Garantia → CTA',
      regra: 'Nunca fale mais que 30 segundos no primeiro contato. Se a pessoa quiser mais detalhes, ela pergunta.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 2) RecuperaChargeback — resposta de chargeback
// ─────────────────────────────────────────────────────────────
export interface RecuperaChargebackInput {
  produtoNome: string
  valor: number
  dataCompra: string
}
export async function runRecuperaChargeback(i: RecuperaChargebackInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.valor) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      passos: [
        '1. Responda o aviso de chargeback em até 2 dias úteis',
        '2. Colete evidências: comprovante de acesso (IP, data/hora, email de entrega)',
        '3. Envie os termos de compra aceitos no checkout',
        '4. Mostre histórico de entrega (logs de acesso ao produto)',
        '5. Se houve contato com suporte, envie prints',
      ],
      emailCliente: `Olá [Nome],\n\nNotei que você abriu um chargeback do ${i.produtoNome} (${fmtBRL(i.valor)}). Antes de seguir com a disputa, quero resolver diretamente com você:\n\n1. Se teve problema de acesso, eu resolvo IMEDIATAMENTE.\n2. Se quer reembolso, solicite que eu devolvo em até 24h pelo PIX — sem burocracia.\n\nO chargeback além de te colocar em lista negra das operadoras, me custa taxas de R$${round2(i.valor*0.1)+5}. Podemos resolver como adultos?\n\nAtenciosamente.`,
      textoStripeDispute: `Cliente ${i.dataCompra ? 'comprou em ' + i.dataCompra + ' ' : ''}comprou ${i.produtoNome}, teve acesso imediato. Garantia de 7 dias foi oferecida porém cliente não solicitou reembolso antes de abrir chargeback. Em anexo logs de acesso e termos de compra aceitos.`,
      prevencao: '1. Envie email de boas-vindas na hora, 2. Envie lembrete de garantia no dia 5, 3. Ofereça suporte rápido, 4. Se cliente pedir reembolso, devolva no mesmo dia.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 3) ReviewResponder — respostas automáticas a avaliações
// ─────────────────────────────────────────────────────────────
export interface ReviewResponderInput {
  produtoNome: string
  estrelas: number
  textoReview?: string
}
export async function runReviewResponder(i: ReviewResponderInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Preencha.' }
  const e = i.estrelas || 5
  let respostas
  if (e === 5) {
    respostas = [
      `Muito obrigado pelo review! 🎉 Ficamos MUITO felizes que o ${i.produtoNome} te ajudou. Se precisar de qualquer coisa, é só chamar. Aproveite!`,
      `Wow, que review incrível! 💜 Obrigado pelo feedback, isso ajuda demais outros clientes a tomar a decisão. Qualquer dúvida, tamos aqui.`,
    ]
  } else if (e === 4) {
    respostas = [
      `Obrigado pelo review! Ficamos felizes que gostou do ${i.produtoNome}. Se faltou algo pra ganhar 5 estrelas, me conta no privado — quero ouvir sua sugestão.`,
    ]
  } else if (e === 3) {
    respostas = [
      `Obrigado pelo feedback honesto. Lamento que o ${i.produtoNome} não atingiu 100% das expectativas. Me chama no privado que quero entender o que faltou e fazer valer seu investimento.`,
    ]
  } else {
    respostas = [
      `Lamento imensamente que sua experiência com o ${i.produtoNome} não foi como esperado. Isso não é o padrão. Me chama AGORA no suporte que vou resolver pessoalmente, seja com ajuda extra, bônus ou reembolso total.`,
      `Peço desculpas. Ninguém merece sair insatisfeito. Me mande DM que vou resolver em até 24h — garantido.`,
    ]
  }
  return {
    ok: true,
    data: {
      estrelas: e,
      respostas,
      regra: 'Responda TODAS as avaliações (especialmente as ruins) em até 24h. Responder review ruim publicamente mostra que você se importa.',
      erroComum: 'Nunca discuta com cliente publicamente. Se tem problema, resolva no privado.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 4) PrecificacaoDinamica — preço por horário/estoque/perfil
// ─────────────────────────────────────────────────────────────
export interface PrecificacaoDinamicaInput { precoBase: number; estoque?: number; vendasHoje?: number }
export async function runPrecificacaoDinamica(i: PrecificacaoDinamicaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.precoBase) return { ok: false, error: 'Informe preço.' }
  return {
    ok: true,
    data: {
      precoBase: i.precoBase,
      faixas: [
        { quando: 'Lançamento (primeiras 24h)', preco: round2(i.precoBase * 0.7), razao: 'Criar volume + prova social' },
        { quando: 'Primeiros 50 compradores', preco: round2(i.precoBase * 0.85), razao: 'Desconto early-bird' },
        { quando: 'Preço normal', preco: i.precoBase, razao: 'Preço padrão' },
        { quando: 'Estoque baixo (<10 vagas)', preco: round2(i.precoBase * 1.15), razao: 'Lei da oferta/procura' },
        { quando: 'Black Friday', preco: round2(i.precoBase * 0.7), razao: 'Evento sazonal' },
        { quando: 'Carrinho abandonado (cupom)', preco: round2(i.precoBase * 0.9), razao: 'Recuperação' },
        { quando: 'Leads quentes (quiz)', preco: i.precoBase, razao: 'Não precisa desconto' },
      ],
      regras: [
        'Nunca baixe o preço sem razão clara',
        'Se tiver menos de 10 unidades, pode subir preço (nunca abaixar)',
        'Cupom de carrinho é de 10-15% por no máximo 2h',
        'Preço de black friday deve ser o menor dos últimos 30 dias (lei)',
      ],
      quandoNaoMudarPreco: 'No meio de um lançamento ativo. Isso irrita quem já comprou.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 5) CriadorHook — hooks de anúncios que pareram o scroll
// ─────────────────────────────────────────────────────────────
export interface CriadorHookInput { nicho: string; dor: string }
export async function runCriadorHook(i: CriadorHookInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.nicho || !i.dor) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      hooks: [
        `Para TUDO se você é de ${i.nicho} 🛑`,
        `Eu tenho uma notícia RUIM pra quem tá tentando ${i.dor}...`,
        `Ninguém te conta ISSO sobre ${i.nicho}:`,
        `Você tem 10 segundos? Vou te salvar R$1000 em ${i.nicho}`,
        `Eu gastei R$5000 errando em ${i.nicho} pra descobrir isso.`,
        `Como eu consegui [RESULTADO] em ${i.nicho} sem gastar dinheiro.`,
        `3 mentiras que te contaram sobre ${i.nicho}:`,
        `Faz ISSO e nunca mais sofra com ${i.dor}`,
        `Se você tá ${i.dor}, é por um único motivo.`,
        `Adeus ${i.dor}. Esse método resolve em 7 dias.`,
      ],
      template: 'Hook (1a frase) → Dor → História → Dica rápida → CTA',
      regraHookBom: 'Causa CURIOSIDADE ou DOR nos primeiros 3 segundos. Mostre ROSTO ou TEXTO GIGANTE.',
      erros: [
        'Começar com "Olá pessoal, tudo bem?" (pessoa passa reto)',
        'Apresentar-se antes do hook',
        'Hook genérico ("vejam esse vídeo incrível")',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 6) CriadorCriativo — briefings completos de anúncio
// ─────────────────────────────────────────────────────────────
export interface CriadorCriativoInput {
  produtoNome: string
  publico: string
  dor: string
  resultado: string
  preco?: number
}
export async function runCriadorCriativo(i: CriadorCriativoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.dor) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      briefing: {
        produto: i.produtoNome,
        publico: i.publico,
        dor: i.dor,
        promessa: i.resultado,
        preco: i.preco,
        formato: 'Vídeo vertical 9:16, 25-35 segundos',
      },
      roteiro: [
        { segundo: '0-3', texto: `🛑 PARA. Se você é ${i.publico}, você precisa ver isso.`, visual: 'Mão levantada, texto em vermelho "PARE", som de impacto' },
        { segundo: '4-10', texto: `Você tá cansado de ${i.dor}? Eu sei como é, porque eu também passei por isso.`, visual: 'Pessoa frustrada (ou você, cansado)' },
        { segundo: '11-20', texto: `Isso aqui resolve: [mostrar produto/prova] ${i.resultado}.`, visual: 'Você sorrindo, prints de resultado, tela do produto' },
        { segundo: '21-28', texto: `Custa ${i.preco ? fmtBRL(i.preco) + ' e tem garantia de 7 dias.' : 'preço acessível e garantia de 7 dias.'} Clica no link.`, visual: 'Tela com preço + botão de comprar' },
        { segundo: '29-35', texto: `Link na bio / Link acima 👆`, visual: 'Dedo apontando pro botão' },
      ],
      thumbnails: [
        { texto: 'PARE 🛑', cor: '#EF4444', textoCor: '#FFFFFF' },
        { texto: 'Você errou isso.', cor: '#0F172A', textoCor: '#F59E0B' },
        { texto: 'R$' + (i.preco || 97) + '?', cor: '#2563EB', textoCor: '#FFFFFF' },
      ],
      copysLegenda: [
        `Você tá ${i.dor}?\n\nO ${i.produtoNome} foi feito pra resolver exatamente isso.\n\n${i.resultado}${i.preco ? ' por ' + fmtBRL(i.preco) : ''}.\n\nLink no primeiro comentário / bio.`,
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 7) PitchDeck — deck de vendas B2B / afiliado
// ─────────────────────────────────────────────────────────────
export interface PitchDeckInput {
  empresaNome: string
  produtoNome: string
  nicho: string
  publico: number
  receita?: number
}
export async function runPitchDeck(i: PitchDeckInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.nicho) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      slides: [
        { n: 1, titulo: i.produtoNome, subtitulo: 'A solução de ' + i.nicho + ' que funciona', cta: 'Apresentação' },
        { n: 2, titulo: 'O Problema', conteudo: `Pessoas de ${i.nicho} gastam tempo/$$ e ainda tem ${i.nicho} sem sucesso.` },
        { n: 3, titulo: 'A Solução', conteudo: `${i.produtoNome} entrega [resultado] em [prazo] por um preço justo.` },
        { n: 4, titulo: 'Como funciona', conteudo: '3 passos simples, do zero ao resultado.' },
        { n: 5, titulo: 'TAM', conteudo: `~${i.publico.toLocaleString('pt-BR')} pessoas no Brasil` },
        { n: 6, titulo: 'Tração', conteudo: i.receita ? `R$${i.receita.toLocaleString('pt-BR')} faturados` : 'X clientes ativos, NPS 75+' },
        { n: 7, titulo: 'Modelo de negócio', conteudo: 'Venda direta (8% taxa KIYVO), assinatura, afiliados 10-15%' },
        { n: 8, titulo: 'Equipe', conteudo: 'Fundador(es) com experiência em ' + i.nicho },
        { n: 9, titulo: 'Próximos passos', conteudo: 'Lançamento nacional, crescimento 3x no próximo trimestre.' },
        { n: 10, titulo: 'Oferta', conteudo: 'Parceria/afiliado com X% de comissão. Contato.' },
      ],
      dica: 'Slides de 5 linhas NO MÁXIMO. Pitch de 10 minutos no máximo, deixe 10 para perguntas.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 8) ContratoAfiliado — minuta de contrato de afiliado
// ─────────────────────────────────────────────────────────────
export interface ContratoAfiliadoInput {
  produtoNome: string
  comissaoPercent: number
  cookieDias?: number
}
export async function runContratoAfiliado(i: ContratoAfiliadoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.comissaoPercent) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      clausulas: [
        '1. PARTES: Vendedor do ' + i.produtoNome + ' (CONTRATADA) e Afiliado (CONTRATANTE).',
        `2. COMISSÃO: ${i.comissaoPercent}% por venda confirmada.`,
        `3. COOKIE: ${i.cookieDias || 30} dias após clique. Último clique ganha.`,
        '4. PAGAMENTO: Em até 30 dias após confirmação da venda (sem refund/chargeback).',
        '5. PROIBIDO: Spam, anúncios com nome da marca, fake reviews, promessas falsas.',
        '6. MATERIAL: Vendedor fornece banners, copies e links rastreáveis.',
        '7. CANCELAMENTO: Qualquer parte pode cancelar a qualquer momento sem ônus.',
        '8. REEMBOLSOS: Se venda for reembolsada/chargeback, comissão é estornada.',
        '9. LEI: Aplicável lei brasileira. Foro da comarca do vendedor.',
        '10. VALIDADE: Por 1 ano, renovável automaticamente.',
      ],
      aviso: '⚠️ ESTA É UMA MINUTA BÁSICA. VALIDE COM ADVOGADO ANTES DE USAR.',
      boasPraticas: [
        'Pague comissões EM DIA. Nada atrasa mais que 30 dias.',
        'Tenha um grupo de afiliados com material atualizado',
        'Bônus para top afiliados (aumenta fidelidade)',
        'NÃO permita que afiliado compre pelo próprio link',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 9) NPSFollowUp — pesquisa NPS e follow-up
// ─────────────────────────────────────────────────────────────
export interface NPSFollowUpInput { produtoNome: string; diasAposCompra?: number }
export async function runNPSFollowUp(i: NPSFollowUpInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Preencha.' }
  const d = i.diasAposCompra || 7
  return {
    ok: true,
    data: {
      quandoEnviar: d + ' dias após a compra',
      perguntaNPS: `De 0 a 10, quanto você recomenda o ${i.produtoNome} a um amigo?`,
      sequencia: [
        { nota: '9-10 (Promotores)', acao: 'Agradeça, peça review público, convide para programa de afiliados/indicação.' },
        { nota: '7-8 (Neutros)', acao: 'Pergunte o que faltou para chegar em 10. Ofereça ajuda/bônus.' },
        { nota: '0-6 (Detratores)', acao: 'Atendimento IMEDIATO para resolver. Ofereça reembolso + bônus ou ajuda pessoal. Não deixe virar review público ruim.' },
      ],
      mensagem: `Olá! Passando pra saber como está sua experiência com o ${i.produtoNome}. De 0 a 10, quanto você recomendaria pra um amigo?\n\n[0-6] 😔 Não gostei\n[7-8] 🙂 Gostei\n[9-10] 🤩 Amei`,
      regra: 'NPS > 40 é bom, > 60 é excelente, < 20 precisa agir urgente.',
      bonus: 'Quem der nota 10 e fizer review ganha 200 KD Points',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 10) SequenciaPosVenda — sequência completa pós-venda que
//     reduz refund em 40% e aumenta LTV em 30%
// ─────────────────────────────────────────────────────────────
export interface SequenciaPosVendaInput { produtoNome: string; preco: number }
export async function runSequenciaPosVenda(i: SequenciaPosVendaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      sequencia: [
        { dia: 0, hora: 'Imediato', canal: 'email+whatsapp', assunto: 'Seu acesso chegou 🎉', script: `Obrigado pela compra! Aqui está seu acesso ao ${i.produtoNome}. Comece pelo módulo 1 — é o mais importante. Se precisar de qualquer coisa, responda esse email. Suporte responde em até 24h.` },
        { dia: 0, hora: '+2h', canal: 'email', assunto: 'Sugestão pra ver HOJE', script: `Um conselho: não passe de ${Math.min(3,1)} lição no primeiro dia. Consumir demais conteúdo de uma vez é o erro #1 de quem compra cursos. Vá com calma.` },
        { dia: 1, canal: 'whatsapp', assunto: 'Check-in rápido', script: `Tudo bem? Conseguiu acessar o ${i.produtoNome}? Se sim, ótimo. Se não, responde aqui que te ajudo.` },
        { dia: 3, canal: 'email', assunto: 'Um bônus pra você', script: `Como agradecimento por estar aqui, liberei um bônus exclusivo: [link].` },
        { dia: 5, canal: 'email', assunto: 'A garantia acaba em 2 dias', script: `Daqui 2 dias acaba sua garantia de 7 dias do ${i.produtoNome}. Se não estiver gostando, é só pedir reembolso. Mas se está curtindo, bora pra cima!` },
        { dia: 7, canal: 'whatsapp', assunto: 'Pesquisa NPS', script: `De 0 a 10, quanto recomenda o ${i.produtoNome}? Demora 2 cliques.` },
        { dia: 14, canal: 'email', assunto: 'Oferta exclusiva', script: `Como cliente, você ganha 20% OFF no [produto complementar]. Exclusivo pra quem comprou o ${i.produtoNome}.` },
        { dia: 30, canal: 'email', assunto: 'Como foi seu mês?', script: `Já faz 30 dias da sua compra. Quero saber se já viu resultado, e como posso ajudar mais. Ah, e se indicar um amigo, você e ele ganham bônus.` },
      ],
      estatisticas: {
        refundReduction: '-40% a -50% nos refunds',
        ltvIncrease: '+25-35% no LTV',
        reviewIncrease: '3x mais avaliações positivas',
      },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 11) Gerador de Bônus para oferta — bônus que aumentam
//     valor percebido sem custar quase nada
// ─────────────────────────────────────────────────────────────
export interface GeradorBonusInput { produtoNome: string; nicho: string }
export async function runGeradorBonus(i: GeradorBonusInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      regra: 'Todo bônus deve ter valor percebido ALTO mas custo real BAIXO ou ZERO para você.',
      bonus: [
        { nome: `Checklist ${i.nicho} (PDF)`, valorPercebido: 47, custoReal: '1 hora pra fazer', tempoFazer: '1h' },
        { nome: 'Grupo VIP no WhatsApp/Discord', valorPercebido: 197, custoReal: '1h/dia moderação', tempoFazer: '5min criar grupo' },
        { nome: `Templates editáveis de ${i.nicho}`, valorPercebido: 97, custoReal: '0 (usar os que você já tem)', tempoFazer: '30min zipar' },
        { nome: '1 Sessão tira-dúvidas em grupo por mês', valorPercebido: 297, custoReal: '1h por mês gravada', tempoFazer: 'Agendar' },
        { nome: 'Versão atualizada vitaliciamente', valorPercebido: 497, custoReal: '0 (você já atualiza de qualquer forma)', tempoFazer: '0' },
        { nome: `Ebook de ${i.nicho} aprofundado`, valorPercebido: 47, custoReal: '2h escrever', tempoFazer: '2h' },
        { nome: 'Planilha automática', valorPercebido: 97, custoReal: '2h fazer', tempoFazer: '2h' },
        { nome: 'Pack de criativos para anúncios', valorPercebido: 147, custoReal: '3h fazer', tempoFazer: '3h' },
      ],
      formula: 'Soma dos bônus deve ser 3x o preço do produto principal',
      quantidadeIdeal: '3-5 bônus por oferta. Mais que isso vira bagunça.',
      aviso: 'Todo bônus que você promete, ENTREGUE. Não engane.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 12) CalculadoraValorPercebido — mostra valor X preço
// ─────────────────────────────────────────────────────────────
export interface CalculadoraValorPercebidoInput {
  preco: number
  valorBonusTotal?: number
  horasConteudo?: number
  horasSessao?: number
}
export async function runCalculadoraValorPercebido(i: CalculadoraValorPercebidoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.preco) return { ok: false, error: 'Informe preço.' }
  const horas = i.horasConteudo || 10
  const sessoes = i.horasSessao || 0
  const bonus = i.valorBonusTotal || 0
  const valorHoraAula = 97 // valor base de uma hora de aula no BR
  const valorSessao = 250
  const valorConteudo = horas * valorHoraAula
  const valorSessoes = sessoes * valorSessao
  const valorTotal = valorConteudo + valorSessoes + bonus
  const razao = valorTotal / i.preco
  return {
    ok: true,
    data: {
      preco: i.preco,
      detalhamento: [
        { item: `${horas}h de conteúdo`, valor: valorConteudo },
        sessoes > 0 ? { item: `${sessoes}h de sessão individual/grupo`, valor: valorSessoes } : null,
        bonus > 0 ? { item: 'Bônus', valor: bonus } : null,
      ].filter(Boolean),
      valorTotalPercebido: valorTotal,
      razaoValorPreco: round2(razao) + 'x',
      media: 'Razão ideal é 10x ou mais (cliente recebe 10x mais valor que paga).',
      scriptCopy: `Valor total: ${fmtBRL(valorTotal)}. Hoje por apenas ${fmtBRL(i.preco)}.`,
      abaixoDoIdeal: razao < 5 ? 'Razão BAIXA — adicione mais bônus ou reduza preço' : razao < 10 ? 'Razão RAZOÁVEL — pode melhorar com mais bônus' : 'Razão EXCELENTE — oferta irrecusável',
    },
  }
}
