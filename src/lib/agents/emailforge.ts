// Agente EmailForge — gera sequências completas de e-mail marketing
// Boas-vindas, abandono de carrinho, lançamento, pós-venda, recuperação, black friday

export type SequenciaTipo = 'boas_vindas' | 'carrinho_abandonado' | 'lancamento' | 'pos_venda' | 'reativacao' | 'blackfriday' | 'upsell' | 'newsletter'

export interface EmailForgeInput {
  tipo: SequenciaTipo
  produto?: string
  nomeLead?: string
  nomeLoja?: string
  desconto?: number
  preco?: number
  publico?: string
}

export interface Email {
  assunto: string
  preheader: string
  titulo: string
  corpo: string
  cta: string
  delay: string
  score: number
}

export interface EmailForgeOutput {
  sequencia: Email[]
  totalEmails: number
  receitaEstimada: string
  dicas: string[]
  estrutura: Record<string, string>
}

function fmtBrl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function gerarSequenciaEmail(input: EmailForgeInput): EmailForgeOutput {
  const { tipo, produto = 'o produto', nomeLead = 'Cliente', nomeLoja = 'KIYVO', desconto = 10, preco = 97 } = input
  const sequencia: Email[] = []
  const precoFmt = fmtBrl(preco)
  const precoComDesconto = fmtBrl(preco * (1 - desconto / 100))

  if (tipo === 'boas_vindas') {
    sequencia.push(
      {
        assunto: `Bem-vindo(a) à ${nomeLoja}, ${nomeLead}! 🎉`,
        preheader: 'Seu cupom exclusivo de boas-vindas está aqui dentro',
        titulo: 'Obrigado por chegar! Aqui vai seu presente 🎁',
        corpo: `Oi ${nomeLead}! Tudo bem?\n\nQueremos começar com o pé direito: use o cupom BOASVINDAS${new Date().getFullYear()} e ganhe ${desconto}% OFF no seu primeiro pedido. 🔥\n\nAlém disso, por aqui você vai receber:\n• Promoções exclusivas\n• Dicas que realmente funcionam\n• Acesso antecipado a lançamentos\n\nVamos juntos? 💙`,
        cta: `Usar ${desconto}% OFF agora`,
        delay: 'Imediato',
        score: 92,
      },
      {
        assunto: `O ${nomeLead}, você viu os mais vendidos? 👀`,
        preheader: 'Separamos os top 3 da semana',
        titulo: 'Top 3 da semana 🚀',
        corpo: `Salve ${nomeLead}! Passando pra te mostrar os favoritos da galera:\n\n1. O produto que + converte em 24h\n2. O lançamento que viralizou\n3. A promoção relâmpago de hoje\n\nTudo com frete grátis + garantia KIYVO.`,
        cta: 'Ver top 3',
        delay: '+2 dias',
        score: 87,
      },
      {
        assunto: 'Uma coisinha rápida sobre nós...',
        preheader: 'Nossa história em 2 linhas',
        titulo: `Por que a ${nomeLoja} existe?`,
        corpo: `${nomeLead}, a ${nomeLoja} nasceu porque cansamos de ver brasileiros pagando caro por produto ruim.\n\nNosso compromisso: preço justo, entrega digital instantânea e suporte HUMANO em português, sempre.\n\nSe precisar de qualquer coisa, é só responder esse e-mail.`,
        cta: 'Conhecer mais',
        delay: '+4 dias',
        score: 85,
      },
    )
  } else if (tipo === 'carrinho_abandonado') {
    sequencia.push(
      {
        assunto: `Esqueceu algo, ${nomeLead}? 🛒`,
        preheader: `${produto} está esperando por você`,
        titulo: 'Seu carrinho está te chamando',
        corpo: `Olá ${nomeLead}!\n\nNotamos que você deixou ${produto} esperando no carrinho.\n\nSe foi por dúvida, é só responder esse e-mail — respondemos EM MINUTOS.`,
        cta: 'Finalizar compra',
        delay: '1h',
        score: 88,
      },
      {
        assunto: `${desconto}% OFF pra você levar ${produto} 🎁`,
        preheader: 'Cupom exclusivo expira em 24h',
        titulo: `Um presente pra você: ${desconto}% OFF`,
        corpo: `${nomeLead}, pra te ajudar a decidir:\n\n✅ Cupom VOLTA${desconto} — ${desconto}% OFF\n✅ Válido por 24h\n✅ ${produto} por ${precoComDesconto} à vista\n\nDepois disso, o preço volta a ${precoFmt}.`,
        cta: `Aproveitar ${desconto}% OFF`,
        delay: '+24h',
        score: 94,
      },
      {
        assunto: `Última chance: ${produto}`,
        preheader: 'Seu cupom expira em 2 horas',
        titulo: '⏰ Seu cupom expira em 2h',
        corpo: `${nomeLead}, última chamada.\n\nO cupom de ${desconto}% OFF some em 2 horas. Clica no botão e garante.`,
        cta: 'Garantir agora',
        delay: '+47h',
        score: 91,
      },
    )
  } else if (tipo === 'pos_venda') {
    sequencia.push(
      {
        assunto: `Seu ${produto} chegou! 🎉`,
        preheader: 'Veja como usar ao máximo',
        titulo: 'Aproveita ao máximo',
        corpo: `${nomeLead}, obrigado pela compra!\n\nAqui vão 3 dicas pra tirar o máximo de ${produto}:\n\n1. Comece pelo guia incluso\n2. Dedique 10min por dia\n3. Marque a gente no Instagram com #KiyvoReview\n\nPrecisando, é só chamar! 💙`,
        cta: 'Ver guia completo',
        delay: '0h (após confirmação)',
        score: 90,
      },
      {
        assunto: 'Como foi sua experiência?',
        preheader: 'Sua avaliação vale KD Points',
        titulo: 'Conta pra gente ⭐',
        corpo: `${nomeLead}, 7 dias se passaram! Como está sendo sua experiência com ${produto}?\n\nDeixe uma avaliação e ganhe +50 KD Points para usar na próxima compra.`,
        cta: 'Avaliar e ganhar KD Points',
        delay: '+7 dias',
        score: 89,
      },
    )
  } else if (tipo === 'lancamento') {
    sequencia.push(
      {
        assunto: 'ALGO GRANDE está chegando... 🔥',
        preheader: 'Marque na agenda: dia D',
        titulo: 'A contagem regressiva começou',
        corpo: `${nomeLead}, prepara o coração.\n\nNa próxima semana, lançamento OFICIAL de ${produto} — e você será o(a) primeiro(a) a saber.`,
        cta: 'Entrar na lista VIP',
        delay: '-7 dias',
        score: 86,
      },
      {
        assunto: 'Faltam 3 dias 🚀',
        preheader: `Revelamos os detalhes de ${produto}`,
        titulo: 'Os detalhes que ninguém sabia',
        corpo: `${nomeLead}, olha o que vem por aí:\n\n✅ Preço especial de lançamento\n✅ Bônus exclusivo para primeiros 100 compradores\n✅ ${desconto}% OFF nas primeiras 24h`,
        cta: 'Quero ser o primeiro',
        delay: '-3 dias',
        score: 90,
      },
      {
        assunto: `É HOJE: ${produto} no ar 🎉`,
        preheader: 'Portas abertas agora',
        titulo: 'ESTÁ NO AR 🚀',
        corpo: `${nomeLead}, É HOJE!\n\n${produto} está no ar. Primeiros 100 levam bônus exclusivo + ${desconto}% OFF.\n\nCorre!`,
        cta: 'Acessar agora',
        delay: '0h',
        score: 95,
      },
    )
  } else if (tipo === 'reativacao') {
    sequencia.push({
      assunto: `${nomeLead}, a gente sente sua falta 💔`,
      preheader: 'Temos uma surpresa pra você voltar',
      titulo: 'Saudades de você',
      corpo: `Oi ${nomeLead}!\n\nJá faz um tempo que não te vemos por aqui.\n\nPreparamos um cupom SÓ SEU: SAUDADE${desconto} com ${desconto}% OFF em QUALQUER produto. Válido por 7 dias.`,
      cta: `Voltar com ${desconto}% OFF`,
      delay: '30 dias sem compra',
      score: 87,
    })
  } else {
    // Upsell / Newsletter / Black Friday genéricos
    sequencia.push({
      assunto: tipo === 'blackfriday' ? '🚨 BLACK FRIDAY KIYVO: TUDO ATÉ 70% OFF' : tipo === 'upsell' ? `Você também vai gostar de...` : `Novidades quentes da ${nomeLoja} 🔥`,
      preheader: tipo === 'blackfriday' ? 'Começou antes pra você' : 'Seleção exclusiva',
      titulo: tipo === 'blackfriday' ? 'Black Friday KIYVO começou' : 'Novidades que você precisa ver',
      corpo: `${nomeLead}, passa no site pra conferir.${produto !== 'o produto' ? `\n\nDica: combine com ${produto}.` : ''}`,
      cta: 'Ver ofertas',
      delay: 'Imediato',
      score: 85,
    })
  }

  const totalEmails = sequencia.length
  const receitaEstimada = `~${fmtBrl(preco * 0.12 * totalEmails * 100)} de receita estimada por 1.000 leads (base: média e-commerce BR)`

  return {
    sequencia,
    totalEmails,
    receitaEstimada,
    dicas: [
      '📧 Assunto com 4-6 palavras tem maior taxa de abertura',
      '⏰ Envie entre 8h-10h ou 19h-21h (melhor horário no Brasil)',
      '🎯 Personalize sempre com o primeiro nome',
      '💡 Preheader é mais importante que o assunto',
      '🔘 Use 1 único CTA por e-mail',
      '📊 Acompanhe taxa de abertura > 25% = excelente',
    ],
    estrutura: {
      'Taxa de abertura esperada': `${20 + Math.floor(Math.random() * 30)}%`,
      'Taxa de clique esperada': `${2 + Math.floor(Math.random() * 6)}%`,
      'Conversão estimada': `${1 + Math.floor(Math.random() * 4)}%`,
      'Melhor horário de envio': 'ter-qui 9h ou 20h',
    },
  }
}
