// ─────────────────────────────────────────────────────────────
// ReplyMaster - Gera respostas automáticas para atendimento
// Suporta tons: educado, urgente, carismático, formal, desculpa, reembolso
// + detecção de sentimento + CTA pós-venda
// ─────────────────────────────────────────────────────────────

export type ReplyTone = 'educado' | 'urgente' | 'carismatico' | 'formal' | 'desculpa' | 'reembolso'
export type ReplyChannel = 'whatsapp' | 'email' | 'chat' | 'instagram'

export interface ReplyMasterInput {
  mensagemCliente: string
  contexto?: string
  tom?: ReplyTone
  canal?: ReplyChannel
  nomeCliente?: string
  nomeAtendente?: string
}

export interface ReplyMasterResult {
  resposta: string
  sentimento: 'positivo' | 'neutro' | 'negativo' | 'irritado'
  assunto: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  tags: string[]
  sugestoesPassoAPasso: string[]
  tempoResposta: string
}

const CUMPRIMENTOS = {
  educado: 'Olá',
  urgente: 'Oi',
  carismatico: 'E ai',
  formal: 'Prezado(a)',
  desculpa: 'Olá',
  reembolso: 'Olá',
}
const FECHAMENTOS = {
  educado: 'Atenciosamente',
  urgente: 'Resposta rápida',
  carismatico: 'Abraço',
  formal: 'Atenciosamente',
  desculpa: 'Pedimos sinceras desculpas',
  reembolso: 'Atenciosamente',
}

const KEYWORDS: Record<string, { assunto: string; prioridade: ReplyMasterResult['prioridade']; sentimento: ReplyMasterResult['sentimento']; tags: string[]; passos: string[] }> = {
  'nao recebi|não recebi|nao chegou|não chegou|codigo nao|código não|nao entrega': {
    assunto: 'Problema de entrega', prioridade: 'alta', sentimento: 'irritado',
    tags: ['entrega', 'codigo', 'suporte'],
    passos: ['Confirmar número do pedido', 'Verificar no cofre digital', 'Reenviar código se necessário', 'Oferecer 100 KD Points de cortesia'],
  },
  'reembolso|devolver|dinheiro de volta|estornar|cancelar compra': {
    assunto: 'Solicitação de reembolso', prioridade: 'critica', sentimento: 'irritado',
    tags: ['reembolso', 'financeiro'],
    passos: ['Confirmar dados do pedido', 'Verificar política de 7 dias', 'Se elegível, iniciar reembolso imediato', 'Confirmar estorno em até 48h úteis'],
  },
  'senha|login|nao consigo entrar|não consigo entrar|conta bloqueada|esqueci': {
    assunto: 'Problema de acesso', prioridade: 'media', sentimento: 'neutro',
    tags: ['auth', 'conta'],
    passos: ['Pedir e-mail cadastrado', 'Enviar link de reset', 'Orientar limpar cache', 'Se não resolver, encaminhar para suporte humano'],
  },
  'pix|pagamento|paguei|pago|nao confirma|não confirma|boleto|cartao|cartão': {
    assunto: 'Confirmação de pagamento', prioridade: 'alta', sentimento: 'negativo',
    tags: ['pagamento', 'pix'],
    passos: ['Pedir comprovante/ID da transação', 'Verificar webhook Stripe', 'Se PIX, aguardar até 5 min', 'Liberar manualmente se aprovado'],
  },
  'cupom|desconto|promoção|promocao|codigo|código': {
    assunto: 'Dúvida sobre cupom/desconto', prioridade: 'baixa', sentimento: 'neutro',
    tags: ['cupom', 'promocao'],
    passos: ['Verificar se cupom é válido', 'Aplicar manualmente se necessário', 'Indicar cupom KIYVO10 como alternativa'],
  },
  'afiliado|indicacao|indicação|comissao|comissão|link': {
    assunto: 'Programa de afiliados', prioridade: 'baixa', sentimento: 'neutro',
    tags: ['afiliado', 'indicacao'],
    passos: ['Explicar taxa de 8%', 'Indicar página /indique-ganhe', 'Orientar gerar link no painel'],
  },
}

function analisarMensagem(texto: string): Pick<ReplyMasterResult, 'sentimento' | 'assunto' | 'prioridade' | 'tags' | 'sugestoesPassoAPasso' | 'tempoResposta'> {
  const lower = texto.toLowerCase()
  let assunto = 'Dúvida geral'
  let prioridade: ReplyMasterResult['prioridade'] = 'media'
  let sentimento: ReplyMasterResult['sentimento'] = 'neutro'
  let tags = ['geral']
  let passos = ['Ler a mensagem completa', 'Identificar necessidade', 'Responder com clareza']

  for (const pattern of Object.keys(KEYWORDS)) {
    const re = new RegExp(pattern, 'i')
    if (re.test(lower)) {
      const m = KEYWORDS[pattern]
      assunto = m.assunto; prioridade = m.prioridade; tags = m.tags; passos = m.passos
      if (lower.includes('muito') || lower.includes('poxa') || lower.includes('caralh') || lower.includes('merda') || lower.includes('porra')) {
        sentimento = 'irritado'
      } else {
        sentimento = m.sentimento
      }
      break
    }
  }

  if (/\bom(b|g)ada|obrigad|valeu|show|muito bom|amei/.test(lower)) sentimento = 'positivo'

  const tempoResposta = prioridade === 'critica' ? '< 5 min' : prioridade === 'alta' ? '< 15 min' : prioridade === 'media' ? '< 1 h' : '< 4 h'
  return { assunto, prioridade, sentimento, tags, sugestoesPassoAPasso: passos, tempoResposta }
}

function gerarResposta(i: ReplyMasterInput, analise: ReturnType<typeof analisarMensagem>): string {
  const tom: ReplyTone = i.tom || (analise.sentimento === 'irritado' ? 'desculpa' : 'educado')
  const cliente = i.nomeCliente || ''
  const atendente = i.nomeAtendente || 'Equipe KIYVO'
  const cmp = CUMPRIMENTOS[tom]
  const fecha = FECHAMENTOS[tom]
  const nomes = cliente ? ` ${cliente},` : ''

  let corpo = ''
  switch (analise.assunto) {
    case 'Problema de entrega':
      corpo = `sentimos muito pelo ocorrido${tom === 'carismatico' ? ' 🫠' : ''}. Vamos resolver AGORA. Primeiro confirme o número do seu pedido (começa com KIY-) para eu localizar sua compra no sistema. Assim que localizarmos, entregamos o produto imediatamente ou estornamos 100%.`
      break
    case 'Solicitação de reembolso':
      corpo = `entendemos${nomes}. Conforme o Código de Defesa do Consumidor, você tem 7 dias corridos após a compra para solicitar reembolso integral, sem burocracia. Me envie o ID do pedido que iniciamos o estorno em até 48h úteis.`
      break
    case 'Problema de acesso':
      corpo = `vamos recuperar seu acesso${nomes}. Me envie o e-mail cadastrado que já mando um link de redefinição de senha. Enquanto isso, tente limpar cache/cookies ou abrir em aba anônima.`
      break
    case 'Confirmação de pagamento':
      corpo = `se o pagamento já foi efetuado, pode ficar tranquilo${nomes}. Confirmações PIX demoram até 5 minutos e boletos até 48h úteis. Se já passou desse prazo, me envie o comprovante/ID da transação que liberamos manualmente.`
      break
    case 'Dúvida sobre cupom/desconto':
      corpo = `use o cupom KIYVO10 para 10% OFF em qualquer compra acima de R$20. Basta aplicar na tela de pagamento. Se um cupom específico não estiver funcionando, me mande o código que verifico agora.`
      break
    case 'Programa de afiliados':
      corpo = `nosso programa de indicação paga 8% de comissão + R$5 por primeira compra do amigo. Gere seu link gratuitamente em /indique-ganhe — sem aprovação e sem burocracia.`
      break
    default:
      corpo = `obrigado pelo contato${nomes}! Vou analisar sua mensagem e responder com a solução mais rápida possível. Poderia me dar mais detalhes do que está acontecendo? Se puder incluir o ID do pedido (KIY-) ajuda bastante.`
  }

  if (tom === 'carismatico') corpo += ' 😊'
  if (analise.sentimento === 'irritado') corpo += ' Novamente, pedimos desculpas pelo transtorno.'

  return `${cmp}${nomes} ${corpo}\n\n${fecha},\n${atendente}`
}

export function generateReply(input: ReplyMasterInput): ReplyMasterResult {
  const analise = analisarMensagem(input.mensagemCliente)
  const resposta = gerarResposta(input, analise)
  return { resposta, ...analise }
}
