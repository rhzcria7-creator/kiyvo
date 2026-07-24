// Agente ReviewResponder — gera respostas automáticas para avaliações (1-5 estrelas)
// Tom: profissional, empático, resolutivo. Detecta sentimento e problema.

export interface ResponderInput {
  rating: number
  reviewText: string
  sellerName: string
  productName: string
  tone?: 'profissional' | 'amigavel' | 'formal' | 'carismático' | 'descontraido'
}

export interface ResponderOutput {
  resposta: string
  sentimento: 'positivo' | 'neutro' | 'negativo' | 'misto'
  problemaDetectado?: string
  acaoRecomendada: string
  tempoResposta: string
}

const PROBLEMAS: Array<{ chave: string; palavras: string[] }> = [
  { chave: 'entrega_atrasada', palavras: ['atraso', 'atrasou', 'demorou', 'demora', 'entregou', 'entrega'] },
  { chave: 'produto_defeituoso', palavras: ['defeito', 'defeituoso', 'quebrado', 'funciona', 'funcionou', 'erro'] },
  { chave: 'nao_recebeu', palavras: ['não recebi', 'nao recebi', 'não chegou', 'nao chegou', 'faltou'] },
  { chave: 'propaganda_enganosa', palavras: ['diferente', 'anunciado', 'propaganda enganosa', 'não é o que', 'nao e o que'] },
  { chave: 'reembolso', palavras: ['reembolso', 'estorno', 'devolver', 'devolucao', 'devolução'] },
  { chave: 'atendimento_ruim', palavras: ['atendimento ruim', 'não me responderam', 'ignoraram', 'suporte ruim'] },
  { chave: 'preco_alto', palavras: ['caro', 'preço alto', 'preco alto', 'muito caro', 'não vale', 'nao vale'] },
]

function detectarProblema(texto: string): string | undefined {
  const t = texto.toLowerCase()
  for (const p of PROBLEMAS) {
    if (p.palavras.some((w) => t.includes(w))) return p.chave
  }
  return undefined
}

function detectarSentimento(rating: number, texto: string): ResponderOutput['sentimento'] {
  const t = texto.toLowerCase()
  const neg = ['ruim', 'péssimo', 'pessimo', 'horrivel', 'hórrivel', 'decepcionado', 'problema', 'defeito', 'não recebi']
  const pos = ['excelente', 'ótimo', 'otimo', 'perfeito', 'maravilhoso', 'recomendo', 'incrível', 'incrivel']
  const temNeg = neg.some((w) => t.includes(w))
  const temPos = pos.some((w) => t.includes(w))
  if (rating >= 4 && !temNeg) return 'positivo'
  if (rating <= 2 && !temPos) return 'negativo'
  if (temNeg && temPos) return 'misto'
  if (rating === 3) return 'neutro'
  return temNeg ? 'negativo' : temPos ? 'positivo' : 'neutro'
}

export function gerarRespostaAvaliacao(input: ResponderInput): ResponderOutput {
  const { rating, reviewText, sellerName, productName, tone = 'amigavel' } = input
  const sentimento = detectarSentimento(rating, reviewText)
  const problema = detectarProblema(reviewText)
  const sn = sellerName || 'nossa equipe'
  const pn = productName || 'seu pedido'

  let resposta = ''
  const aberturaAmigavel = [
    `Olá! Muito obrigado pelo seu feedback sobre ${pn}.`,
    `Oi! Agradecemos por compartilhar sua experiência com ${pn}.`,
    `Olá! Obrigado por avaliar sua compra de ${pn} na ${sn}.`,
  ]
  const aberturaFormal = [
    `Prezado(a) cliente, agradecemos pelo seu feedback referente a ${pn}.`,
    `Agradecemos a sua avaliação sobre ${pn}.`,
  ]
  const aberturaCarismatico = [
    `E aí, tudo bem? A ${sn} agradece MUITO pelo toque sobre ${pn}! 🙌`,
    `Obrigadão pelo review! A ${sn} leu CADA palavra sobre ${pn}. 👀`,
  ]
  const aberturaDescontraido = [
    `Opa! Valeu pelo feedback de ${pn}! 😊`,
    `Eae! Obrigado por compartilhar sobre ${pn}! 🚀`,
  ]

  const aberturas = tone === 'formal' ? aberturaFormal : tone === 'carismático' ? aberturaCarismatico : tone === 'descontraido' ? aberturaDescontraido : tone === 'profissional' ? aberturaFormal : aberturaAmigavel
  const abertura = aberturas[Math.floor(Math.random() * aberturas.length)]

  if (sentimento === 'positivo') {
    const corpo = [
      `Ficamos MUITO felizes que curtiu ${pn}! 🎉 Seu feedback é o que nos motiva a entregar sempre o melhor.`,
      `Que incrível saber que ${pn} atendeu suas expectativas! 💙 Compartilha com os amigos, hein?`,
      `A ${sn} fica radiante com um review desses! Volte sempre, teremos novidades em breve. 🚀`,
    ]
    resposta = `${abertura} ${corpo[Math.floor(Math.random() * corpo.length)]}`
  } else if (sentimento === 'negativo') {
    const p = problema
    let corpo = ''
    if (p === 'entrega_atrasada') {
      corpo = `Sentimos muito pela demora na entrega — sabemos que seu tempo vale OURO. 💛 Já abrimos protocolo prioritário e vamos acelerar seu caso pessoalmente. Chama a gente no chat que resolvemos HOJE.`
    } else if (p === 'produto_defeituoso') {
      corpo = `Lamentamos muito pelo ocorrido com ${pn}. Nada mais chato do que receber um produto com problema, né? Vamos enviar um substituto ou reembolso IMEDIATO, você escolhe. 🔧`
    } else if (p === 'nao_recebeu') {
      corpo = `Nossa, que situação! 😓 Se ${pn} não chegou, já iniciamos rastreio urgente com a transportadora e temos 24h pra te dar um posicionamento claro.`
    } else if (p === 'reembolso') {
      corpo = `Se o reembolso é o que você quer, o reembolso você TERÁ. Processamos em até 24h direto pro seu KD Wallet ou cartão, sem burocracia. 💸`
    } else {
      corpo = `Lamentamos sinceramente que sua experiência com ${pn} não tenha sido como esperávamos. Nosso time vai entrar em contato com você EM 1 HORA para resolver tudo — garantido pela ${sn}. ⚡`
    }
    resposta = `${abertura} ${corpo}`
  } else if (sentimento === 'misto') {
    resposta = `${abertura} Agradecemos os elogios e também as críticas — crescemos com os dois. Vamos corrigir o que deu errado com ${pn} e voltar a te surpreender. 🛠️`
  } else {
    resposta = `${abertura} Agradecemos o feedback honesto! Se houver algo que possamos melhorar em ${pn}, é só chamar a ${sn} no chat. 💬`
  }

  const fechos = [
    `\n\nAbraço, Equipe ${sn} 💙`,
    `\n\nAtenciosamente,\nTime ${sn}`,
    `\n\nQualquer coisa, é só chamar! 🚀\nEquipe ${sn}`,
    `\n\nForte abraço e até a próxima compra!\nEquipe ${sn} 🛍️`,
  ]
  resposta += fechos[Math.floor(Math.random() * fechos.length)]

  const acoes: Record<string, string> = {
    positivo: 'Agradecer publicamente e convidar para próxima compra',
    negativo: 'Abrir ticket prioritário e contatar cliente em até 1h',
    neutro: 'Perguntar como poderia ter sido 5 estrelas',
    misto: 'Endereçar crítica pontual e agradecer elogio',
  }

  return {
    resposta,
    sentimento,
    problemaDetectado: problema,
    acaoRecomendada: acoes[sentimento],
    tempoResposta: 'gerado em 0.3s',
  }
}
