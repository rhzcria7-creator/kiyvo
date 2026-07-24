// Support Agent — Responde 24h em português com base em conhecimento.
// Se não sabe a resposta, encaminha para um ticket humano.
// ILIMITADO para QUALQUER usuário (mesmo plano Free).

export interface SupportAnswer {
  resposta: string
  confianca: number
  encaminharHumano: boolean
  artigosRelacionados: Array<{ titulo: string; url: string }>
  acoesRapidas: string[]
}

interface KnowledgeEntry {
  palavrasChave: string[]
  resposta: string
  artigos: Array<{ titulo: string; url: string }>
  acoes: string[]
}

const KB: KnowledgeEntry[] = [
  {
    palavrasChave: ['entrega', 'quando chega', 'demora', 'prazo', 'receber', 'onde esta meu produto', 'não recebi'],
    resposta:
      '📦 **Entrega Instantânea KIYVO**\n\nTodos os produtos digitais são entregues automaticamente em até 30 segundos após a confirmação do pagamento. Você recebe:\n\n1. Um e-mail com os dados de acesso/licença\n2. O produto liberado em "Minhas Compras" aqui na sua conta\n3. Uma notificação push no site\n\nSe já passou de 15 minutos do pagamento e não recebeu, pode ser:\n• Boleto: compensa em até 1 hora útil\n• PIX: verifique se o pagamento foi efetivado pelo app do banco\n• Cartão: às vezes a operadora faz uma análise antifraude\n\nClique em "Minhas Compras" para ver o status agora.',
    artigos: [
      { titulo: 'Como funciona a entrega instantânea', url: '/tutorial/primeiros-passos' },
      { titulo: 'Politica de reembolso', url: '/reembolso' },
    ],
    acoes: ['Ver minhas compras', 'Abrir chamado com humano', 'Reenviar dados por e-mail'],
  },
  {
    palavrasChave: ['reembolso', 'devolver', 'dinheiro de volta', 'cancelar compra', 'cancelado', 'nao quero mais'],
    resposta:
      '💸 **Política de Reembolso KIYVO**\n\nVocê tem 7 dias de garantia incondicional (art. 49 CDC) + garantia de ativação de 30 dias.\n\nComo solicitar:\n1. Acesse "Minhas Compras"\n2. Clique em "Solicitar Reembolso" no pedido\n3. Selecione o motivo e envie\n\nPrazo de análise: até 24h úteis.\nO valor volta para o mesmo método de pagamento em até 7 dias úteis, ou imediatamente em KD Points (bônus de +10%).',
    artigos: [{ titulo: 'Política completa de reembolso', url: '/reembolso' }],
    acoes: ['Ir para minhas compras', 'Falar com atendente humano'],
  },
  {
    palavrasChave: ['pagamento', 'pix', 'cartao', 'boleto', 'forma de pagamento', 'nao consigo pagar', 'recusou'],
    resposta:
      '💳 **Pagamentos**\n\nAceitamos:\n• PIX (aprovação instantânea, preferido)\n• Cartão de crédito (Visa/Master/Elo/Amex) em até 12x\n• Boleto bancário (até 1h útil para compensar)\n\nSe o pagamento foi recusado: verifique saldo, dados digitados, ou tente outro cartão.\nEm caso de erro persistente, falar com um humano.',
    artigos: [],
    acoes: ['Tentar pagamento novamente', 'Reportar erro no pagamento'],
  },
  {
    palavrasChave: ['cadastro', 'criar conta', 'nao consigo me cadastrar', 'conta', 'registrar'],
    resposta:
      '👤 **Criar conta**\n\nÉ grátis e leva 30 segundos. Você pode se cadastrar com:\n• E-mail + senha\n• Em breve: Google e GitHub\n\nRequisitos:\n• E-mail válido (sem emails temporários — bloqueamos por anti-fraude)\n• Senha forte (8+ caracteres, 1 número, 1 letra maiúscula)\n• CPF válido para compras (obrigatório por lei no Brasil)',
    artigos: [{ titulo: 'Primeiros passos na KIYVO', url: '/tutorial/primeiros-passos' }],
    acoes: ['Ir para cadastro', 'Já tenho conta — fazer login'],
  },
  {
    palavrasChave: ['login', 'entrar', 'senha errada', 'nao consigo entrar', 'esqueci a senha', 'recuperar'],
    resposta:
      '🔐 **Problemas de Login**\n\nSe não consegue entrar:\n1. Clique em "Esqueci minha senha" na tela de login\n2. Digite seu e-mail — você receberá um link em instantes\n3. O link expira em 1 hora\n\nSe não recebeu o e-mail:\n• Verifique a caixa de Spam/Promoções\n• Confirme que usou o mesmo e-mail do cadastro\n• Adicione nao-responder@kiyvo.com.br aos contatos',
    artigos: [],
    acoes: ['Recuperar senha', 'Criar nova conta'],
  },
  {
    palavrasChave: ['vender', 'anunciar', 'sou vendedor', 'como vender', 'quero vender', 'cadastrar produto'],
    resposta:
      '🏪 **Vender na KIYVO**\n\nQualquer pessoa pode vender — basta:\n1. Completar o KYC (CPF + selfie + endereço) — é lei brasileira\n2. Escolher seu plano (Grátis, Plus, Pro ou Vendor Pro)\n3. Cadastrar seus produtos digitais\n4. Começar a vender!\n\nTaxas: 10% sobre cada venda no plano grátis. Planos pagos têm desconto progressivo.\nVocê recebe o saque em PIX em até 2 dias úteis após confirmação da entrega.',
    artigos: [
      { titulo: 'Como vender na KIYVO', url: '/tutorial/como-vender' },
      { titulo: 'Planos e taxas', url: '/planos' },
      { titulo: 'Simulador de taxas', url: '/fees/calculator' },
    ],
    acoes: ['Começar a vender', 'Ver planos', 'Simular lucro'],
  },
  {
    palavrasChave: ['taxa', 'comissao', 'quanto custa', 'tarifa', 'plano', 'preco do plano'],
    resposta:
      '💰 **Taxas e Planos**\n\n**Plano Grátis:** 10% por venda\n**Plus (R$ 19,90/mês):** 5% por venda + mais limites de agentes IA\n**Pro (R$ 49,90/mês):** 3% por venda + agentes ilimitados + suporte prioritário\n**Vendor Pro (R$ 99,90/mês):** taxa ZERO nos primeiros R$ 5k + boost semanal + gerente de conta\n\nStripe cobra ~3,99% + R$0,40 por transação (taxa de processamento, não da KIYVO).',
    artigos: [{ titulo: 'Ver planos completos', url: '/planos' }],
    acoes: ['Ver planos', 'Simular taxa'],
  },
  {
    palavrasChave: ['afiliado', 'indique e ganhe', 'comissao indicacao', 'link de indicacao', 'indicar amigo'],
    resposta:
      '🤝 **Programa de Afiliados KIYVO**\n\nTodo usuário ganha automaticamente um link de indicação em /indique-ganhe.\n\nComo funciona:\n• Você compartilha seu link\n• Quem se cadastra pelo link ganha 5% OFF na primeira compra\n• Você ganha 8% de comissão sobre TODAS as compras do indicado (não só a primeira) + R$5 de bônus em KD Points quando ele comprar pela primeira vez\n• Saque em PIX ou KD Points (+10% de bônus)\n• Cookie dura 90 dias',
    artigos: [{ titulo: 'Programa Indique e Ganhe', url: '/indique-ganhe' }],
    acoes: ['Pegar meu link de afiliado', 'Ver dashboard de afiliado'],
  },
  {
    palavrasChave: ['kd points', 'pontos', 'kdp', 'cashback', 'como usar pontos'],
    resposta:
      '⭐ **KD Points — o cashback da KIYVO**\n\n• 100 KD Points = R$ 1,00\n• Você ganha 15 KD por R$ 1 gasto (15% de volta)\n• Pode usar em até 50% do valor de qualquer compra\n• Nunca expiram\n• Bônus de +10% se sacar comissão de afiliado em KD ao invés de PIX',
    artigos: [{ titulo: 'Tutorial completo de KD Points', url: '/tutorial/kd-points' }],
    acoes: ['Ver meus KD Points'],
  },
  {
    palavrasChave: ['badge', 'emblema', 'selo', 'conquista'],
    resposta:
      '🏅 **Emblemas KIYVO**\n\nEmblemas são conquistas que aparecem no seu perfil e dão benefícios reais:\n🥉 Bronze (R$100 gastos): 2% OFF permanente\n🥈 Prata (R$500): 3% OFF\n🥇 Ouro (R$2k): 4% OFF\n💎 Platina (R$5k): 5% OFF\n💠 Diamante (R$20k): 7% OFF\n\nHá também emblemas de vendedor (Verified, Top Seller, Rising Star) e selos da equipe.',
    artigos: [{ titulo: 'Meus emblemas', url: '/conta/emblemas' }],
    acoes: ['Ver meus emblemas'],
  },
  {
    palavrasChave: ['garantia', 'seguro', 'confiavel', 'seguranca', 'e golpe', 'fraude'],
    resposta:
      '🛡️ **A KIYVO é confiável?**\n\nSIM. Somos um marketplace brasileiro registrado e operamos com:\n• CNPJ ativo\n• Pagamentos processados pela Stripe (maior processadora do mundo)\n• Escrow: o dinheiro só é liberado para o vendedor depois que o produto é entregue\n• Moderação anti-fraude 24h\n• Suporte humano em português\n• Garantia de 7 dias (CDC) + 30 dias de ativação',
    artigos: [{ titulo: 'Garantia KIYVO', url: '/garantia' }],
    acoes: ['Ver garantia', 'Ver como funciona'],
  },
  {
    palavrasChave: ['saque', 'retirada', 'sacar dinheiro', 'receber venda', 'pix vendedor'],
    resposta:
      '💵 **Saques para Vendedores**\n\nDepois da entrega confirmada, o saldo fica disponível para saque via:\n• PIX (chave: CPF/CNPJ, e-mail, telefone ou aleatória)\n• KD Points (bônus +10%)\n\nPrazos:\n• Plano Grátis: D+2\n• Plus: D+1\n• Pro/Vendor: saque instantâneo\n\nMínimo de saque: R$ 20.',
    artigos: [{ titulo: 'Como sacar seus ganhos', url: '/tutorial/retiradas' }],
    acoes: ['Ir para minha carteira'],
  },
  {
    palavrasChave: ['banner', 'logo', 'gerar imagem', 'criar banner', 'criar logo', 'bannerforge'],
    resposta:
      '🎨 **BannerForge — Agente de Criativos**\n\nNosso agente de IA gera banners e logos personalizados em PNG na hora:\n• Banners de produto (hero, quadrado, story, anúncio)\n• Logos profissionais com gradiente\n• Cards de produto\n• Criados em cores específicas\n\nVocê pode gerar até 2/dia grátis. Planos Plus+ dão mais limites.\nAcesse em /agentes/bannerforge.',
    artigos: [],
    acoes: ['Ir para BannerForge'],
  },
  {
    palavrasChave: ['agente', 'ia', 'assistente', 'ia kiyvo', 'ai'],
    resposta:
      '🤖 **Agentes KIYVO**\n\nTemos vários agentes para automatizar seu negócio:\n🎨 BannerForge — gera banners/logos PNG\n✍️ CopyMaster — escreve títulos/descrições que vendem\n💲 PriceMaster — sugere preço ótimo\n🎯 ProductHunter — descobre produtos lucrativos\n🛡️ ReviewShield — modera e protege sua loja\n🔍 AdOptimizer — SEO pros seus anúncios\n👨‍💻 FreelanceMatch — contrata freelancers\n\nAcesso: /agentes',
    artigos: [],
    acoes: ['Ir para Central de Agentes'],
  },
  {
    palavrasChave: ['freelancer', 'freela', 'contratar', 'job', 'servico'],
    resposta:
      '👨‍💻 **Freelance Marketplace KIYVO**\n\nContrate ou ofereça serviços digitais:\n• Design, copy, desenvolvimento, vídeo, marketing, tradução, áudio, suporte\n• Escrow em todos os jobs (pagamento seguro)\n• Disputas com mediação da equipe\n\nCategorias: /freelance',
    artigos: [],
    acoes: ['Explorar freelancers', 'Publicar um job'],
  },
  {
    palavrasChave: ['boleto', 'nao compensou', 'compensar', 'aguardando pagamento'],
    resposta:
      '📄 **Boleto bancário**\n\nBoletos compensam em até 1 hora útil após o pagamento, geralmente mais rápido.\nFinais de semana e feriados demoram mais. Se já passou de 2h úteis, envie o comprovante para um atendente humano que liberamos manualmente.',
    artigos: [],
    acoes: ['Falar com humano'],
  },
]

const SAUDACOES = [
  'Olá! 👋 Eu sou a **Kiya**, assistente da KIYVO — como posso te ajudar hoje?',
  'Olá! Bem-vindo(a) à KIYVO 🚀. Qual a sua dúvida?',
  'Oi! É um prazer te ajudar. Sobre o que você quer conversar?',
]

const ENCaminharHUMANO_MSG = `
Não consegui encontrar uma resposta exata para isso 🤔, mas vamos resolver!

Vou encaminhar você para um atendente humano da equipe KIYVO. O tempo médio de resposta é de **10 minutos** em horário comercial (9h-22h).

Conte-me mais detalhes do que precisa que já anoto aqui para acelerar o atendimento 👇
`.trim()

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function responderSuporte(pergunta: string): SupportAnswer {
  const q = pergunta.trim()
  if (!q) {
    return {
      resposta: SAUDACOES[0],
      confianca: 0.3,
      encaminharHumano: false,
      artigosRelacionados: [],
      acoesRapidas: ['Quero comprar', 'Quero vender', 'Pagamento e entrega', 'Problemas com login'],
    }
  }
  const qn = normalizar(q)
  // Saudações
  if (/^(oi|ola|olá|eae|opa|bom dia|boa tarde|boa noite|hey|hi|hello)\b/.test(qn)) {
    return {
      resposta: SAUDACOES[Math.floor(Math.random() * SAUDACOES.length)],
      confianca: 1,
      encaminharHumano: false,
      artigosRelacionados: [],
      acoesRapidas: ['Comprar um produto', 'Vender na KIYVO', 'Indique e Ganhe', 'Gerar banner'],
    }
  }

  let best: { entry: KnowledgeEntry; score: number } | null = null
  for (const entry of KB) {
    let score = 0
    for (const kw of entry.palavrasChave) {
      const kwn = normalizar(kw)
      if (qn.includes(kwn)) score += kwn.length * 2
      else {
        // match parcial por palavras
        for (const w of kwn.split(' ')) {
          if (w.length > 3 && qn.includes(w)) score += w.length * 0.5
        }
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score }
  }

  if (!best || best.score < 8) {
    return {
      resposta: ENCaminharHUMANO_MSG,
      confianca: 0,
      encaminharHumano: true,
      artigosRelacionados: [
        { titulo: 'Como funciona a KIYVO', url: '/como-funciona' },
        { titulo: 'Perguntas Frequentes', url: '/faq' },
      ],
      acoesRapidas: ['Falar com humano', 'Voltar ao FAQ'],
    }
  }

  const confianca = Math.min(1, best.score / 60)
  const precisaHumano = confianca < 0.4

  return {
    resposta: best.entry.resposta,
    confianca,
    encaminharHumano: precisaHumano,
    artigosRelacionados: best.entry.artigos,
    acoesRapidas: best.entry.acoes,
  }
}
