// CÉREBRO INTERNO KIYVO — motor de resposta da plataforma.
// Este arquivo É INTERNO e NUNCA deve ser mencionado na UI.
// Detecta intenção, busca conhecimento real (catálogo, lojas, produtos, cupons, ajuda)
// e responde. Funciona OFFLINE também (sem chaves de IA) usando base de conhecimento local.
// Comentários em PT-BR. NÃO USAR O NOME DESTE ARQUIVO NO FRONTEND.

import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'
import { STORES } from '@/lib/catalog/stores'

type Intent =
  | 'comprar' | 'vender' | 'saque' | 'taxa' | 'cupom' | 'lojas'
  | 'produtos' | 'suporte' | 'kyc' | 'conta' | 'saudacao' | 'preco'
  | 'agentes' | 'shorts' | 'garantia' | 'outro'

export interface HermesReply {
  texto: string
  intent: Intent
  acoes?: { label: string; href: string; icon?: string }[]
  produtos?: { titulo: string; preco: number; href: string }[]
  lojas?: { nome: string; handle: string; categoria: string }[]
  confianca: number
}

const ALL_PRODUCTS = [
  ...DEMO_PRODUCTS.map(p => ({ titulo: p.titulo, preco: p.preco, slug: p.slug, categoria: p.categoria, vendedor: p.vendedor_nome })),
  ...GG_PRODUCTS.map(p => ({ titulo: p.titulo, preco: p.preco, slug: p.slug, categoria: p.categoria, vendedor: p.vendedor_nome })),
  ...MEGA_PRODUCTS.map(p => ({ titulo: p.titulo, preco: p.preco, slug: p.slug, categoria: p.categoria, vendedor: p.vendedor_nome })),
]

const PALAVRAS: Record<Intent, string[]> = {
  comprar: ['comprar','compro','quero','produto','adquirir','preço','preco','valor','onde tem','onde acho','recomenda','indica','buscar','procurando','buscando','quais','melhor'],
  vender: ['vender','anunciar','vendedor','publicaar','publicar','anunciar','criar loja','loja','anuncio','vender na kiyvo','quero vender','sou vendedor','cadastrar produto'],
  saque: ['saque','sacar','retirar','receber','pix','recebimento','pagamento','recebi','pagar','reembolso','dinheiro','saldo'],
  taxa: ['taxa','comissão','comissao','cobrança','cobranca','plano','free','plus','pro','vendor_pro','precos planos','quanto custa vender'],
  cupom: ['cupom','desconto','promoção','promocao','black','oferta','codigo','cupom de desconto','promocional'],
  lojas: ['loja','lojas','vendedores','fornecedor','recomendam loja'],
  produtos: ['produto','produtos','catalogo','catálogo','o que vende','o que tem','categorias','lista'],
  suporte: ['suporte','ajuda','problema','erro','bug','nao funciona','não funciona','atendimento','telegram','contato','falar com alguem','help'],
  kyc: ['kyc','verificacao','verificação','documento','cpf','cnpj','identidade','selfie','rg','aprovar','verificado'],
  conta: ['conta','login','senha','cadastro','cadastrar','entrar','perfil','banido','ban','suspensa','suspenso'],
  saudacao: ['oi','olá','ola','bom dia','boa tarde','boa noite','e ai','eai','hey','hello'],
  preco: ['preco','preço','custa','valor','quanto','custa em media'],
  agentes: ['agente','agentes','copiloto','ia','inteligencia artificial','nvidia','ai','gpt','bot','assistente'],
  shorts: ['short','shorts','rede social','fotos','posts','postar','social','instagram','feed','stories'],
  garantia: ['garantia','devolução','devolucao','reembolso','arrependimento','7 dias','estorno','troca'],
  outro: [],
}

function detectIntent(texto: string): Intent {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  let best: Intent = 'outro'
  let bestScore = 0
  for (const k of Object.keys(PALAVRAS) as Intent[]) {
    const lista = PALAVRAS[k]
    let score = 0
    for (const w of lista) if (t.includes(w)) score += 1
    if (score > bestScore) { bestScore = score; best = k }
  }
  return bestScore === 0 ? 'outro' : best
}

function searchProducts(query: string, limit = 3) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const words = q.split(/\s+/).filter(w => w.length > 2)
  const scored = ALL_PRODUCTS.map(p => {
    const hay = (p.titulo + ' ' + p.categoria + ' ' + p.vendedor).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let s = 0
    for (const w of words) if (hay.includes(w)) s += 1
    if (p.categoria === words[0]) s += 2
    return { p, s }
  }).filter(x => x.s > 0).sort((a,b) => b.s - a.s).slice(0, limit)
  return scored.map(x => ({ titulo: x.p.titulo, preco: x.p.preco, href: `/p/${x.p.slug}` }))
}

function searchStores(query: string, limit = 3) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return STORES.filter(s => {
    const hay = (s.name + ' ' + s.bio + ' ' + s.category).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return hay.includes(q) || s.category.toLowerCase().includes(q)
  }).slice(0, limit).map(s => ({ nome: s.name, handle: s.handle.replace('@',''), categoria: s.category }))
}

function saudacao(): string {
  const h = new Date().getHours()
  const d = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return `${d}! Sou o assistente da KIYVO. Posso te ajudar a encontrar produtos, abrir sua loja, explicar taxas, cupons, saques ou qualquer outra coisa sobre a plataforma. O que você precisa?`
}

export function hermesReply(userMsg: string, historico: { de: 'user'|'hermes'; texto: string }[] = []): HermesReply {
  const msg = userMsg.trim()
  const intent = detectIntent(msg)

  // Respostas por intenção (conhecimento local + ações úteis)
  if (intent === 'saudacao' && msg.length < 20) {
    return { texto: saudacao(), intent, confianca: 1, acoes: [
      { label: 'Explorar produtos', href: '/buscar', icon: '🔍' },
      { label: 'Quero vender', href: '/vender', icon: '🚀' },
      { label: 'Ver lojas', href: '/lojas', icon: '🏪' },
    ]}
  }

  if (intent === 'vender') {
    return {
      texto: `Para vender na KIYVO você precisa: (1) criar conta, (2) completar o KYC (CPF/CNPJ, selfie com documento, endereço), (3) publicar seu produto. Taxa Zero: 0% nas primeiras 5.000 vendas para novos vendedores! Planos: Free (8%+R$0,50), Plus (6,5%+R$0,40), Pro (5%+R$0,30), Vendor Pro (3%+R$0,20). Saque mínimo R$30, PIX em 1 dia útil, saldo disponível após 7 dias de garantia.`,
      intent, confianca: 0.95,
      acoes: [
        { label: 'Começar a vender', href: '/vender', icon: '🚀' },
        { label: 'Ver planos', href: '/planos', icon: '📋' },
        { label: 'Taxas e tarifas', href: '/precos', icon: '💸' },
      ]
    }
  }

  if (intent === 'kyc') {
    return {
      texto: `A verificação KYC é obrigatória para vender. Você precisará informar: nome completo, CPF/CNPJ, data de nascimento, nome da mãe (obrigatório anti-fraude), nome do pai (opcional), telefone, e-mail, endereço completo (com CEP) e enviar selfie + documento frente/verso + comprovante de residência. Avaliamos em até 48h. Aprovado, você pode publicar produtos ilimitados.`,
      intent, confianca: 0.9,
      acoes: [{ label: 'Fazer verificação', href: '/verificacao', icon: '✅' }]
    }
  }

  if (intent === 'taxa') {
    return {
      texto: `Taxas KIYVO (cobramos só quando você vende, zero mensalidade):\n\n🆓 Free: 8% + R$0,50 por venda (teto R$50)\n➕ Plus: 6,5% + R$0,40 (teto R$40)\n⭐ Pro: 5% + R$0,30 (teto R$30)\n💎 Vendor Pro: 3% + R$0,20 (teto R$20) + 5k vendas com taxa ZERO.\nNovos vendedores: 0% nas primeiras 5.000 vendas! Saque: mínimo R$30, taxa fixa R$0,99, PIX em 1 dia útil, saldo após 7 dias.`,
      intent, confianca: 0.98,
      acoes: [{ label: 'Comparar planos', href: '/planos', icon: '📊' }]
    }
  }

  if (intent === 'saque') {
    return {
      texto: `Para sacar: saldo mínimo R$30, taxa fixa de R$0,99 por saque, recebimento via PIX em 1 dia útil. O saldo fica disponível 7 dias após a confirmação da venda (garantia). Após solicitar o saque, o dinheiro cai na sua chave PIX cadastrada em até 24h úteis.`,
      intent, confianca: 0.9,
      acoes: [{ label: 'Ir para saques', href: '/saque', icon: '💸' }]
    }
  }

  if (intent === 'garantia') {
    return {
      texto: `Todos os produtos digitais da KIYVO têm garantia de 7 dias. Se o produto não for entregue, for diferente do descrito ou não funcionar, você pode pedir reembolso total nesse prazo. O comprador paga pelo produto, o valor fica retido por 7 dias e só então é liberado pro vendedor. Zero risco para o comprador.`,
      intent, confianca: 0.95,
      acoes: [
        { label: 'Central de garantia', href: '/garantia', icon: '🛡️' },
        { label: 'Política de reembolso', href: '/politica-reembolso', icon: '↩️' },
      ]
    }
  }

  if (intent === 'suporte') {
    return {
      texto: `O suporte humano da KIYVO é 24h/7 no Telegram! Clique no botão abaixo que você é levado pro grupo oficial de atendimento. Problemas comuns: entrega de produto, saque, cadastro, verificação, denúncias. Respondemos em minutos.`,
      intent, confianca: 0.95,
      acoes: [
        { label: 'Falar no Telegram', href: 'https://t.me/kiyvosuporte', icon: '📨' },
        { label: 'Central de ajuda', href: '/ajuda', icon: '❓' },
      ]
    }
  }

  if (intent === 'cupom') {
    const produtosDesconto = ALL_PRODUCTS.filter(p => p.preco < 100).sort((a,b) => a.preco - b.preco).slice(0,3).map(p => ({ titulo: p.titulo, preco: p.preco, href: `/p/${p.slug}` }))
    return {
      texto: `Todo vendedor KIYVO é obrigado a oferecer pelo menos 1 cupom de 2% a 70% em cada produto! Na página de cada produto o cupom é exibido automaticamente. Se você é vendedor, basta criar um cupom ao publicar um produto.`,
      intent, confianca: 0.9, produtos: produtosDesconto,
      acoes: [{ label: 'Ver ofertas', href: '/ofertas', icon: '🎁' }]
    }
  }

  if (intent === 'conta') {
    return {
      texto: `Para criar conta ou acessar: use e-mail/senha ou login social Google/GitHub/Apple. Esqueceu a senha? Use "recuperar senha" na página de login. Contas suspensas por violação dos termos têm página de recurso em /conta/suspensa. Para banimento ou 2FA, procure suporte.`,
      intent, confianca: 0.8,
      acoes: [
        { label: 'Entrar', href: '/login', icon: '🔑' },
        { label: 'Criar conta', href: '/cadastro', icon: '✨' },
      ]
    }
  }

  if (intent === 'agentes') {
    return {
      texto: `A KIYVO tem mais de 200 agentes de IA para vendedores: copywriting, e-mails, headlines, SEO, cálculos, scripts de venda, planilhas, criativos, etc. Eles são alimentados pelo nosso orquestrador multi-provider: NVIDIA NIM (Nemotron/Mistral), Google Gemini, Groq, OpenRouter e busca DuckDuckGo.`,
      intent, confianca: 0.85,
      acoes: [
        { label: 'Ver agentes', href: '/agentes', icon: '🤖' },
        { label: 'Copiloto', href: '/copiloto', icon: '🧠' },
      ]
    }
  }

  if (intent === 'shorts') {
    return {
      texto: `O KIYVO Shorts é a rede social integrada do marketplace. Poste textos, fotos, vídeos e arquivos, siga lojas, curta, comente, reposte e salve conteúdo. Tudo gratuito, conectado ao catálogo — você pode linkar produtos nos posts.`,
      intent, confianca: 0.85,
      acoes: [{ label: 'Ir ao Shorts', href: '/shorts', icon: '🎬' }]
    }
  }

  if (intent === 'lojas') {
    const lojas = searchStores(msg, 3)
    return {
      texto: `Temos mais de 60 lojas oficiais na KIYVO! Vendedores verificados de todo o Brasil vendendo cursos, software, templates, packs, gastronomia, saúde, finanças, música e muito mais. Veja a lista completa ou algumas lojas encontradas abaixo:`,
      intent, confianca: 0.8, lojas,
      acoes: [{ label: 'Ver todas as lojas', href: '/lojas', icon: '🏪' }]
    }
  }

  // Comprar/busca/produtos: tentar encontrar produtos
  if (intent === 'comprar' || intent === 'produtos' || intent === 'preco') {
    const produtos = searchProducts(msg, 4)
    if (produtos.length > 0) {
      return {
        texto: `Encontrei ${produtos.length} produto(s) que combinam com sua busca. Todos com entrega automática e garantia de 7 dias. Explore mais na busca ou fale mais detalhes que eu te ajudo a escolher!`,
        intent, confianca: 0.7, produtos,
        acoes: [{ label: 'Busca completa', href: `/buscar?q=${encodeURIComponent(msg)}`, icon: '🔍' }]
      }
    }
    return {
      texto: `Temos 789+ produtos digitais no catálogo: cursos, software, templates, planilhas, presets, beats, e-books, presets de foto, chaves de jogos/streaming, packs e muito mais. Começando em R$7, com entrega automática e garantia. O que você procura especificamente?`,
      intent, confianca: 0.6,
      acoes: [
        { label: 'Ver todos produtos', href: '/buscar', icon: '🔍' },
        { label: 'Categorias', href: '/categorias', icon: '🗂️' },
        { label: 'Ver lojas', href: '/lojas', icon: '🏪' },
      ]
    }
  }

  // Fallback
  return {
    texto: `Hmm, posso te ajudar com:\n\n🛒 Comprar produtos (busco no catálogo)\n🚀 Vender na KIYVO\n📊 Taxas e planos\n💸 Saques e pagamentos\n🎫 Cupons de desconto\n✅ Verificação KYC\n🤖 Agentes de IA\n🎬 KIYVO Shorts\n📨 Suporte humano\n\nMe diga em detalhes o que você precisa!`,
    intent: 'outro', confianca: 0.3,
    acoes: [
      { label: 'Buscar produtos', href: '/buscar', icon: '🔍' },
      { label: 'Quero vender', href: '/vender', icon: '🚀' },
      { label: 'Falar c/ suporte', href: 'https://t.me/kiyvosuporte', icon: '📨' },
    ]
  }
}
