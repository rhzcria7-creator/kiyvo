// KIYVO v10 MONSTER — 22 NOVOS agentes IA de monetização avançada, SEO e crescimento
// Total de agentes após este arquivo: 180+
// Cada agente é exportado como função assíncrona recebendo input + context e retornando AgentResult

import type { AgentContext, AgentResult } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// 1. BLACKFRIDAYPLAYBOOK — estratégia completa de Black Friday (calendário + preços + copy + emails)
// ─────────────────────────────────────────────────────────────────────────────
export interface BlackFridayPlaybookInput {
  produto: string
  precoAtual: number
  precoCusto?: number
  nicho: string
  listaEmails?: number
  seguidoresSocial?: number
  diasAteBF?: number
}
export interface BlackFridayPlaybookOutput {
  estrategia: string
  calendario: Array<{ dia: string; acao: string; canal: string }>
  precos: {
    precoNormal: number
    precoBF: number
    precoBlackVIP: number
    precoCyberMonday: number
  }
  aquecimento: string[]
  emails: Array<{ assunto: string; dia: string; preview: string }>
  copyAnuncios: string[]
  metricasEstimadas: { faturamentoEstimado: number; roi: string; conversaoEstimada: string }
  errosEvitar: string[]
}
export async function blackfridayplaybook(input: BlackFridayPlaybookInput, ctx: AgentContext): Promise<AgentResult<BlackFridayPlaybookOutput>> {
  const { produto, precoAtual, precoCusto = precoAtual * 0.2, nicho, listaEmails = 0, seguidoresSocial = 0, diasAteBF = 30 } = input
  const descontoBF = 0.35 // 35% OFF
  const precoBF = Math.round((precoAtual * (1 - descontoBF)) * 100) / 100
  const precoVIP = Math.round((precoAtual * 0.6) * 100) / 100
  const precoCyber = Math.round((precoAtual * 0.7) * 100) / 100
  const lista = Math.max(listaEmails, Math.floor(seguidoresSocial * 0.05))
  const estimativaVendas = Math.floor(lista * 0.03) + 50
  const faturamento = Math.round(estimativaVendas * precoBF)
  return {
    ok: true,
    data: {
      estrategia: `Black Friday do ${produto}: estratégia de aquecimento ${diasAteBF} dias + VIP 48h antes + BF 24h + Cyber Monday (72h total). Nicho: ${nicho}. Preço base R$${precoAtual.toFixed(2)}.`,
      calendario: [
        { dia: `D-${diasAteBF}`, acao: 'Teaser: algo grande vem aí...', canal: 'Instagram/WhatsApp' },
        { dia: 'D-21', acao: 'Pesquisa com audiência: qual produto querem em promoção?', canal: 'Stories/Email' },
        { dia: 'D-14', acao: 'Libera lista VIP com desconto extra de 5%', canal: 'Email/Landing page' },
        { dia: 'D-7', acao: 'Contagem regressiva + prova social', canal: 'Todos' },
        { dia: 'D-3', acao: 'Aquecimento pesado: 3 emails de valor', canal: 'Email' },
        { dia: 'D-1', acao: 'Spoiler de preço + acesso VIP 20h', canal: 'WhatsApp/Email' },
        { dia: 'BF 00:00', acao: 'Abertura para VIPs (6h antes)', canal: 'Todos' },
        { dia: 'BF 06:00', acao: 'Abertura geral', canal: 'Todos' },
        { dia: 'BF 23:59', acao: 'Escassez final: estoque acaba em 1h', canal: 'Todos' },
        { dia: 'Sábado', acao: 'Repescagem: quem abriu mas não comprou', canal: 'Email/Retargeting' },
        { dia: 'Cyber Monday', acao: 'Nova promoção: combo/take-rate diferente', canal: 'Todos' },
        { dia: 'D+1', acao: 'Agradecimento + bônus pós-venda', canal: 'Todos' },
      ],
      precos: { precoNormal: precoAtual, precoBF, precoBlackVIP: precoVIP, precoCyberMonday: precoCyber },
      aquecimento: [
        `Post teaser: "Em ${diasAteBF} dias, o ${produto} vai ter o menor preço do ano..."`,
        'Compartilhe 3 depoimentos de clientes antigos (um por dia)',
        'Mostre os bastidores/preparação nos stories',
        'Crie enquete: "Quanto você acha que vai ser o desconto?"',
        'Anuncie a condição de pagamento (ex: 12x sem juros)',
        'Libere acesso antecipado para alunos/clientes antigos',
        'Prometa brinde exclusivo para os primeiros 100 compradores',
      ],
      emails: [
        { assunto: `Contagem regressiva: Black Friday ${produto} começa em ${diasAteBF} dias`, dia: `D-${diasAteBF}`, preview: 'Você foi selecionado para a lista VIP...' },
        { assunto: 'O que você vai encontrar na nossa Black Friday', dia: 'D-7', preview: 'Eu vou te contar tudo antes de todo mundo' },
        { assunto: 'Aviso importante: estoque limitado', dia: 'D-3', preview: 'Eis o porquê você deve entrar no VIP...' },
        { assunto: '🔥 AMANHÃ: o menor preço do ano', dia: 'D-1', preview: 'Seu link VIP libera às 20h' },
        { assunto: `ABRIU: ${produto} com 35% OFF por 24h`, dia: 'BF 06:00', preview: 'Corre que estoque está acabando...' },
        { assunto: 'Últimas 6h — desconto acaba à meia-noite', dia: 'BF 18:00', preview: 'Não perca essa chance' },
        { assunto: 'Cyber Monday: nova oportunidade', dia: 'Segunda', preview: 'Quem perdeu a BF, tem mais uma chance' },
      ],
      copyAnuncios: [
        `BLACK FRIDAY 🔥 ${produto} com 35% OFF — só hoje. O menor preço do ano em ${nicho}. Acesse agora antes que acabe.`,
        `Últimas horas: ${produto} Black Friday por R$${precoBF.toFixed(2)} à vista. Mais de ${Math.floor(estimativaVendas * 0.3)} pessoas já garantiram.`,
        `Quem disse que Black Friday é só engano? ${produto} R$${precoAtual.toFixed(2)} → R$${precoBF.toFixed(2)} (sem pegadinha, sem letrinhas miúdas).`,
        `Cliente VIP paga menos: ${produto} por R$${precoVIP.toFixed(2)} — só para quem está na lista. Entra agora.`,
      ],
      metricasEstimadas: {
        faturamentoEstimado: faturamento,
        roi: lista > 0 ? '~800% (base lista email aquecida)' : '~250% (base tráfego frio)',
        conversaoEstimada: '2-5% (lista VIP) / 0.5-1.5% (tráfego frio)',
      },
      errosEvitar: [
        'NÃO aumente o preço 1 semana antes para fingir desconto — é crime (CDC Art. 37)',
        'Não prometa estoque ilimitado quando tem estoque pequeno',
        'Não esconda taxas/frete — tudo deve ser transparente',
        'Não comece a campanha em cima da hora (mínimo 14 dias de aquecimento)',
        'Não envie email todo dia na semana da BF (leva a descadastro)',
        'Garanta que o site/infra aguente o tráfego (faça teste de carga)',
        'Não se esqueça dos clientes recorrentes (eles compram 2x mais)',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LEADMAGNETPRO — gera iscas digitais irresistíveis (checklists, eBooks, templates)
// ─────────────────────────────────────────────────────────────────────────────
export interface LeadMagnetProInput_v10 {
  nicho: string
  produtoPrincipal: string
  publico: string
  formato?: 'checklist' | 'ebook' | 'template' | 'planilha' | 'quiz' | 'webinar'
  dorPrincipal: string
}
export interface LeadMagnetProOutput_v10 {
  titulo: string
  titulosAlternativos: string[]
  formato: string
  paginas: Array<{ titulo: string; tipo: string; conteudo: string[] }>
  callToActionFinal: string
  copyPaginaCaptura: { headline: string; subheadline: string; bullets: string[] }
  sequenciaEmail: Array<{ assunto: string; conteudo: string }>
  metricas: { conversaoEstimada: string; leadsPor100Visitas: number }
}
export async function leadmagnetpro(input: LeadMagnetProInput_v10, ctx: AgentContext): Promise<AgentResult<LeadMagnetProOutput_v10>> {
  const { nicho, produtoPrincipal, publico, formato = 'checklist', dorPrincipal } = input
  return {
    ok: true,
    data: {
      titulo: `Checklist Definitivo: ${dorPrincipal} em 7 Passos (${nicho})`,
      titulosAlternativos: [
        `O Guia Rápido para ${dorPrincipal} (mesmo sem experiência)`,
        `${produtoPrincipal} — o que ninguém te conta antes de começar`,
        `7 Erros que todo ${publico} comete em ${nicho} (e como evitar)`,
        `Template Gratuito: ${dorPrincipal} em menos de 48h`,
        `[PDF Gratuito] Os 3 pilares de ${nicho} em 2026`,
      ],
      formato,
      paginas: [
        { titulo: 'Capa', tipo: 'capa', conteudo: [
          `Checklist Definitivo: ${dorPrincipal}`,
          `Para ${publico} que querem ${nicho}`,
          'KIYVO © 2026 — Material gratuito para divulgação',
        ]},
        { titulo: 'Introdução', tipo: 'texto', conteudo: [
          `Você sabia que 87% dos ${publico} desistem de ${nicho} nos primeiros 90 dias por ${dorPrincipal.toLowerCase()}?`,
          `Este checklist foi criado para você que tem ${produtoPrincipal} mas não sabe por onde começar.`,
          'São 7 passos práticos, testados em mais de 1.000 alunos.',
        ]},
        { titulo: 'Passo 1', tipo: 'checklist', conteudo: [
          `[ ] Defina seu objetivo principal de ${nicho}`,
          '[ ] Descubra sua persona real (não inventada)',
          '[ ] Liste 3 dores principais que ela tem (uma delas é ' + dorPrincipal + ')',
          '[ ] Defina sua oferta única (USP) em 1 frase',
          '[ ] Crie sua promessa principal',
        ]},
        { titulo: 'Passo 2', tipo: 'checklist', conteudo: [
          '[ ] Organize seu conteúdo em 3 pilares',
          '[ ] Crie um calendário de 30 dias',
          '[ ] Selecione 1 canal principal (não tente todos)',
          '[ ] Defina frequência de publicação',
        ]},
        { titulo: 'Passo 3 a 7', tipo: 'checklist', conteudo: [
          '[ ] Crie a primeira isca digital',
          '[ ] Configure a página de captura',
          '[ ] Crie a sequência de emails (3 a 7 emails)',
          '[ ] Direcione para ' + produtoPrincipal,
          '[ ] Meça e otimize semanalmente',
        ]},
        { titulo: 'Bônus', tipo: 'bonus', conteudo: [
          `Template de copy para página de vendas de ${produtoPrincipal}`,
          `Calendário editorial de 30 dias para ${nicho}`,
          'Planilha de cálculo de ROI',
        ]},
        { titulo: 'Próximos Passos', tipo: 'cta', conteudo: [
          `Agora que você tem o caminho das pedras, o próximo passo é aplicar com ${produtoPrincipal}.`,
          `Clique aqui para conhecer o método completo que vai te levar de ${dorPrincipal.toLowerCase()} para resultado em 30 dias.`,
        ]},
      ],
      callToActionFinal: `Se você quer eliminar de vez ${dorPrincipal.toLowerCase()}, conheça o ${produtoPrincipal} — a solução completa para ${publico} em ${nicho}. Clique aqui e saiba mais.`,
      copyPaginaCaptura: {
        headline: `[Gratuito] Checklist Definitivo: ${dorPrincipal} em 7 Passos`,
        subheadline: `Receba no seu email o guia prático que ${Math.floor(Math.random() * 3000) + 2000} ${publico} já usaram para dominar ${nicho} — sem enrolação, direto ao ponto.`,
        bullets: [
          `✅ 7 passos para eliminar ${dorPrincipal.toLowerCase()} ainda essa semana`,
          '✅ Testado e aprovado por mais de 2.000 alunos',
          '✅ Bônus: templates e planilhas prontas',
          '✅ 100% gratuito — não precisa de cartão',
          `✅ Perfeito para quem está começando em ${nicho}`,
        ],
      },
      sequenciaEmail: [
        { assunto: 'Aqui está o seu checklist 🚀', conteudo: `Olá! Como prometido, aqui está o checklist de ${nicho}. Baixe o PDF e comece pelo passo 1 hoje mesmo. Qualquer dúvida, é só responder este email.` },
        { assunto: 'Passo 1: o erro que 87% cometem', conteudo: `Hoje vamos aplicar o passo 1: definir a persona. A maioria dos ${publico} pula esse passo e depois se pergunta por que não vende...` },
        { assunto: 'Passo 3: a isca que converte 40%', conteudo: `Chegou a hora de criar sua própria isca digital. O segredo está na promessa específica e mensurável.` },
        { assunto: 'Tenho uma proposta para você', conteudo: `Se você aplicou os 7 passos e quer ir mais rápido, quero te apresentar ${produtoPrincipal}...` },
      ],
      metricas: { conversaoEstimada: '18-35% (página de captura otimizada)', leadsPor100Visitas: 25 },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TIKTOKSCRIPTS — roteiros virais para TikTok/Reels/Shorts (hook 3s, 15s, 30s, 60s)
// ─────────────────────────────────────────────────────────────────────────────
export interface TikTokScriptInput_v10 {
  produto: string
  nicho: string
  publico: string
  angulo?: 'tutorial' | 'revelacao' | 'rant' | 'historia' | 'beforeafter' | 'dica' | 'meme' | 'hookpuro'
  duracao?: 15 | 30 | 60
}
export interface TikTokScript_v10 {
  id: string
  hook0a3s: string
  duracao: number
  cenas: Array<{ tempo: string; falas: string; camera: string; legenda: string }>
  cta: string
  hashtags: string[]
  angulo: string
  ctrEstimado: string
}
export async function tiktokscripts(input: TikTokScriptInput_v10, ctx: AgentContext): Promise<AgentResult<TikTokScript_v10[]>> {
  const { produto, nicho, publico, duracao = 30 } = input
  const angulos: TikTokScript_v10['angulo'][] = ['revelacao', 'tutorial', 'historia', 'beforeafter', 'dica', 'hookpuro']
  const scripts: TikTokScript_v10[] = angulos.map((angulo, i) => {
    return {
      id: `tt_${i + 1}`,
      hook0a3s: angulo === 'revelacao'
        ? `Pare tudo. O que ninguém te conta sobre ${nicho} vai te chocar.`
        : angulo === 'tutorial'
        ? `Em 30 segundos eu vou te ensinar a ${produto === '' ? 'vender mais' : `usar ${produto}`} — anota aí.`
        : angulo === 'historia'
        ? `Eu tinha R$47 no bolso e ${nicho} mudou tudo.`
        : angulo === 'beforeafter'
        ? `Olha a diferença: antes e depois do ${produto}.`
        : angulo === 'dica'
        ? `A dica número 1 de ${nicho} que eu daria se eu começasse hoje:`
        : `Se você é ${publico}, você PRECISA ver isso.`,
      duracao,
      cenas: [
        { tempo: '0-3s', falas: 'HOOK', camera: 'Close no rosto, expressão de surpresa/verdade', legenda: '⚠️ Segredo revelado' },
        { tempo: '3-8s', falas: 'Estabelece o problema/dor', camera: 'Corte rápido, mãos gesticulando', legenda: `Dor: ${nicho} é difícil?` },
        { tempo: '8-18s', falas: 'Mostra a solução/dica/revelação', camera: 'Demo/tela/produto', legenda: 'A solução' },
        { tempo: '18-25s', falas: 'Prova social/resultado', camera: 'Print/depoimento/resultado', legenda: '+2.000 alunos' },
        { tempo: '25-30s', falas: 'CTA', camera: 'Aponta para baixo', legenda: `Clica no link da bio → ${produto}` },
      ],
      cta: `Clica no link da bio para saber mais sobre ${produto}. É só hoje.`,
      hashtags: [`#${nicho.replace(/\s/g, '')}`, '#dicas', '#brasil', '#kyvo', `#${publico.replace(/\s/g, '')}`, '#marketingdigital', '#vendasonline'],
      angulo,
      ctrEstimado: ['12-18%', '8-12%', '15-22%', '20-28%', '9-14%', '18-25%'][i],
    }
  })
  return { ok: true, data: scripts }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEOLOCALPAGES — cria conteúdo SEO para páginas locais e de categoria (cidade+nicho)
// ─────────────────────────────────────────────────────────────────────────────
export interface SEOLocalInput_v10 {
  nicho: string
  cidades?: string[]
  palavraChave: string
}
export interface SEOLocalOutput_v10 {
  paginas: Array<{ cidade: string; slug: string; title: string; metaDescription: string; h1: string; h2s: string[]; texto: string[]; faq: Array<{ pergunta: string; resposta: string }> }>
}
export async function seolocalpages(input: SEOLocalInput_v10, ctx: AgentContext): Promise<AgentResult<SEOLocalOutput_v10>> {
  const { nicho, palavraChave } = input
  const cidades = input.cidades || ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador', 'Curitiba', 'Fortaleza', 'Recife', 'Porto Alegre', 'Manaus']
  const paginas = cidades.map((cidade) => ({
    cidade,
    slug: `/${nicho.toLowerCase().replace(/\s/g, '-')}/${cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '-')}`,
    title: `${palavraChave} em ${cidade} | KIYVO`,
    metaDescription: `${palavraChave} em ${cidade} é na KIYVO. Encontre os melhores produtos digitais de ${nicho} com taxas justas (8% máx) e entrega imediata.`,
    h1: `${palavraChave} em ${cidade}`,
    h2s: [
      `Por que escolher a KIYVO para ${palavraChave} em ${cidade}?`,
      `Como comprar ${palavraChave.toLowerCase()} em ${cidade} com segurança?`,
      `Quais são os produtos digitais mais vendidos em ${cidade}?`,
      `Dúvidas frequentes sobre ${palavraChave.toLowerCase()} em ${cidade}`,
    ],
    texto: [
      `${cidade} é um dos maiores polos de ${nicho} do Brasil, e a KIYVO é a plataforma ideal para ${palavraChave.toLowerCase()} na região.`,
      `Com taxas a partir de 3% (plano Vendor Pro) e teto máximo de R$50 por venda, a KIYVO oferece o melhor custo-benefício do mercado para vendedores e compradores de ${cidade}.`,
      `Todos os produtos digitais da KIYVO têm garantia de 7 dias e entrega imediata — sem espera, sem burocracia.`,
      `Milhares de pessoas em ${cidade} já usam a KIYVO para comprar e vender cursos, templates, plugins, e-books, assinaturas e serviços digitais.`,
    ],
    faq: [
      { pergunta: `A KIYVO funciona em ${cidade}?`, resposta: `Sim. A KIYVO é 100% online e atende ${cidade} e todo o Brasil com entrega imediata de produtos digitais.` },
      { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos PIX (aprovação instantânea), cartão de crédito em até 12x, boleto, Apple Pay e Google Pay.' },
      { pergunta: 'Tenho garantia?', resposta: 'Sim! Todos os produtos têm garantia de 7 dias com reembolso integral conforme o Código de Defesa do Consumidor.' },
      { pergunta: 'Quanto tempo leva para receber meu produto?', resposta: 'Produtos digitais são entregues instantaneamente após a confirmação do pagamento.' },
    ],
  }))
  return { ok: true, data: { paginas } }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ROIADS — calculadora de ROI de anúncios (Meta/Google/TikTok)
// ─────────────────────────────────────────────────────────────────────────────
export interface ROIAdsInput_v10 {
  produto: string
  precoVenda: number
  custoProduto: number
  custoFrete?: number
  taxaPlataforma?: number
  cpaEstimado: number
  investimentoMensal: number
  ctr?: number
  conversao?: number
  ticketMedio?: number
  refugo?: number
}
export interface ROIAdsOutput_v10 {
  resumo: { investimento: number; vendasEstimadas: number; faturamento: number; custos: number; lucroLiquido: number; roi: string; roas: number }
  cenarios: Array<{ cenario: string; cpa: number; vendas: number; lucro: number; roi: string }>
  recomendacoes: string[]
  errosComuns: string[]
  metaMinima: { cpaMaximo: number; roasMinimo: number }
}
export async function roiads(input: ROIAdsInput_v10, ctx: AgentContext): Promise<AgentResult<ROIAdsOutput_v10>> {
  const { precoVenda, custoProduto = 0, custoFrete = 0, taxaPlataforma = 0.08, cpaEstimado, investimentoMensal, refugo = 0.03 } = input
  const taxaFixa = 0.50
  const custoPorVenda = custoProduto + custoFrete + precoVenda * taxaPlataforma + taxaFixa
  const margemContribuicao = precoVenda - custoPorVenda
  const cpaMaximo = margemContribuicao * 0.7 // não passar de 70% da margem
  const vendasEstimadas = Math.floor(investimentoMensal / cpaEstimado)
  const vendasReais = Math.floor(vendasEstimadas * (1 - refugo))
  const faturamento = vendasReais * precoVenda
  const custosTotais = investimentoMensal + vendasReais * custoPorVenda
  const lucro = faturamento - custosTotais + investimentoMensal // remover investimento já incluso em custosTotais via custoPorVenda
  const lucroLiquido = vendasReais * margemContribuicao - investimentoMensal
  const roas = faturamento / investimentoMensal
  return {
    ok: true,
    data: {
      resumo: {
        investimento: investimentoMensal,
        vendasEstimadas: vendasReais,
        faturamento: Math.round(faturamento),
        custos: Math.round(vendasReais * custoPorVenda + investimentoMensal),
        lucroLiquido: Math.round(lucroLiquido),
        roi: `${((lucroLiquido / investimentoMensal) * 100).toFixed(0)}%`,
        roas: Math.round(roas * 100) / 100,
      },
      cenarios: [
        { cenario: 'Pessimista (CPA alto)', cpa: cpaEstimado * 1.5, vendas: Math.floor(investimentoMensal / (cpaEstimado * 1.5) * (1 - refugo)), lucro: Math.floor((investimentoMensal / (cpaEstimado * 1.5)) * margemContribuicao * (1 - refugo) - investimentoMensal), roi: 'A calcular' },
        { cenario: 'Conservador', cpa: cpaEstimado * 1.2, vendas: Math.floor(investimentoMensal / (cpaEstimado * 1.2) * (1 - refugo)), lucro: Math.floor((investimentoMensal / (cpaEstimado * 1.2)) * margemContribuicao * (1 - refugo) - investimentoMensal), roi: 'A calcular' },
        { cenario: 'Realista', cpa: cpaEstimado, vendas: vendasReais, lucro: Math.round(lucroLiquido), roi: `${((lucroLiquido / investimentoMensal) * 100).toFixed(0)}%` },
        { cenario: 'Otimista', cpa: cpaEstimado * 0.8, vendas: Math.floor(investimentoMensal / (cpaEstimado * 0.8) * (1 - refugo)), lucro: Math.floor((investimentoMensal / (cpaEstimado * 0.8)) * margemContribuicao * (1 - refugo) - investimentoMensal), roi: 'A calcular' },
      ],
      recomendacoes: [
        lucroLiquido > 0 ? '✅ Campanha é viável. ROI positivo.' : '❌ CPA atual é alto demais — otimize criativos e público antes de escalar.',
        `Seu CPA máximo recomendado: R$${cpaMaximo.toFixed(2)}. Acima disso, você perde dinheiro em cada venda.`,
        roas >= 2 ? 'ROAS saudável — pode escalar o orçamento em 20% por semana.' : 'ROAS baixo — melhore CTR e taxa de conversão antes de investir mais.',
        'Teste pelo menos 5 ângulos de criativo diferentes antes de concluir.',
        'Use retargeting para quem visitou o checkout mas não comprou (custo 3-5x menor).',
        'Lembre-se: com a KIYVO a taxa é só 8%+R$0,50 (teto R$50), então sua margem é maior que em concorrentes.',
      ],
      errosComuns: [
        'Calcular ROI só com base em faturamento (esquece custos de produto, plataforma e frete)',
        'Escalar campanha cedo demais (sem 50+ conversões)',
        'Desligar anúncios em 2 dias por que "não vendeu"',
        'Não separar campanhas de aquisição das de retargeting',
        'Ignorar LTV (vendas futuras do mesmo cliente mudam o ROI)',
      ],
      metaMinima: { cpaMaximo: Math.round(cpaMaximo * 100) / 100, roasMinimo: 2.0 },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. UPSELLQUIZ — quiz de upsell que aumenta ticket médio em 40%+
// ─────────────────────────────────────────────────────────────────────────────
export interface UpsellQuizInput_v10 {
  produto: string
  precoBase: number
  categoria: string
  publico: string
}
export interface UpsellQuizOutput_v10 {
  nome: string
  welcome: string
  perguntas: Array<{ id: string; pergunta: string; opcoes: Array<{ texto: string; recomenda: string; preco: number; razao: string }> }>
  ofertas: Array<{ id: string; nome: string; preco: number; desconto: string; copy: string; paraQuem: string }>
  resultado: string
  metricasEstimadas: { ticketMedio: number; aumentoPercentual: string; conversao: string }
}
export async function upsellquiz(input: UpsellQuizInput_v10, ctx: AgentContext): Promise<AgentResult<UpsellQuizOutput_v10>> {
  const { produto, precoBase, categoria, publico } = input
  return {
    ok: true,
    data: {
      nome: `Quiz: Qual ${categoria} é ideal para você?`,
      welcome: `Olá! Responda 5 perguntas rápidas e eu vou te recomendar o pacote perfeito de ${produto} — com desconto exclusivo no final. Leva menos de 60 segundos.`,
      perguntas: [
        {
          id: 'experiencia',
          pergunta: `Qual seu nível de experiência com ${categoria}?`,
          opcoes: [
            { texto: 'Estou começando do zero', recomenda: 'starter', preco: precoBase * 0.5, razao: 'Pacote inicial com fundamentos' },
            { texto: 'Já sei o básico mas quero evoluir', recomenda: 'pro', preco: precoBase, razao: 'Pacote completo' },
            { texto: 'Sou avançado e quero escalar', recomenda: 'vip', preco: precoBase * 2, razao: 'Mentoria + grupo VIP' },
          ],
        },
        {
          id: 'objetivo',
          pergunta: 'Qual seu objetivo principal?',
          opcoes: [
            { texto: 'Aprender e aplicar devagar', recomenda: 'starter', preco: precoBase * 0.5, razao: 'Ritmo gradual' },
            { texto: 'Começar a vender/resultar em 30 dias', recomenda: 'pro', preco: precoBase, razao: 'Método prático' },
            { texto: 'Escalar para 6 dígitos em 6 meses', recomenda: 'vip', preco: precoBase * 2, razao: 'Plano de escala' },
          ],
        },
        {
          id: 'tempo',
          pergunta: 'Quanto tempo por dia você pode dedicar?',
          opcoes: [
            { texto: 'Menos de 1h por dia', recomenda: 'starter', preco: precoBase * 0.5, razao: 'Plano compacto' },
            { texto: '1-3h por dia', recomenda: 'pro', preco: precoBase, razao: 'Ritmo ideal' },
            { texto: '4h+ por dia (quero acelerar)', recomenda: 'vip', preco: precoBase * 2, razao: 'Aceleração total' },
          ],
        },
        {
          id: 'orcamento',
          pergunta: 'Qual orçamento para investir na sua evolução?',
          opcoes: [
            { texto: `Até R$${(precoBase * 0.5).toFixed(0)}`, recomenda: 'starter', preco: precoBase * 0.5, razao: 'Entrada' },
            { texto: `R$${(precoBase * 0.5).toFixed(0)} a R$${precoBase.toFixed(0)}`, recomenda: 'pro', preco: precoBase, razao: 'Equilíbrio' },
            { texto: `Acima de R$${precoBase.toFixed(0)} (quero o melhor)`, recomenda: 'vip', preco: precoBase * 2, razao: 'Investimento alto' },
          ],
        },
        {
          id: 'suporte',
          pergunta: 'Você precisa de suporte e comunidade?',
          opcoes: [
            { texto: 'Prefiro estudar sozinho', recomenda: 'starter', preco: precoBase * 0.5, razao: 'Autonomia' },
            { texto: 'Quero suporte quando tiver dúvidas', recomenda: 'pro', preco: precoBase, razao: 'Suporte padrão' },
            { texto: 'Quero contato direto e grupo VIP', recomenda: 'vip', preco: precoBase * 2, razao: 'Acompanhamento próximo' },
          ],
        },
      ],
      ofertas: [
        {
          id: 'starter',
          nome: `${produto} — Starter`,
          preco: Math.round(precoBase * 0.5),
          desconto: '20% OFF exclusivo do quiz',
          copy: `Pacote ideal para quem está começando em ${categoria}. Conteúdo essencial, sem enrolação.`,
          paraQuem: `${publico} iniciantes`,
        },
        {
          id: 'pro',
          nome: `${produto} — Completo`,
          preco: precoBase,
          desconto: '15% OFF + bônus exclusivo',
          copy: `O pacote mais vendido. Tudo que você precisa para sair do zero ao resultado em ${categoria}, com suporte.`,
          paraQuem: `${publico} que quer resultado rápido`,
        },
        {
          id: 'vip',
          nome: `${produto} — VIP + Mentoria`,
          preco: Math.round(precoBase * 2),
          desconto: '30% OFF (exclusivo quiz) + bônus de R$997',
          copy: `Acompanhamento próximo, grupo VIP, mentorias mensais e todos os bônus. Para quem quer escalar rápido.`,
          paraQuem: `${publico} que quer ir mais longe`,
        },
      ],
      resultado: 'Com base nas suas respostas, o pacote recomendado para você é: [RECOMENDACAO]. Mas você pode escolher qualquer um com desconto exclusivo!',
      metricasEstimadas: { ticketMedio: Math.round(precoBase * 1.4), aumentoPercentual: '40-60%', conversao: '12-18%' },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CANVAPROMPTS — prompts prontos para Canva AI / Midjourney / DALL-E
// ─────────────────────────────────────────────────────────────────────────────
export interface CanvaPromptInput_v10 {
  tipo: 'banner' | 'capa' | 'anuncio' | 'story' | 'feed' | 'thumbnail' | 'mockup' | 'logo' | 'poster'
  nicho: string
  produto: string
  estilo?: 'minimalista' | 'moderno' | 'luxo' | 'despojado' | 'corporativo' | 'criativo' | '3d'
  cores?: string[]
}
export interface CanvaPromptOutput_v10 {
  prompts: Array<{ label: string; prompt: string; aspectRatio: string; configuracao: string }>
  dicas: string[]
  canvaMagic: string[]
}
export async function canvaprompts(input: CanvaPromptInput_v10, ctx: AgentContext): Promise<AgentResult<CanvaPromptOutput_v10>> {
  const { tipo, nicho, produto, estilo = 'moderno' } = input
  const aspect = tipo === 'story' ? '9:16' : tipo === 'feed' ? '1:1' : tipo === 'capa' ? '16:9' : tipo === 'thumbnail' ? '16:9' : tipo === 'banner' ? '16:9' : '4:5'
  return {
    ok: true,
    data: {
      prompts: [
        { label: 'Versão 1 (limpa)', prompt: `${tipo} design for ${produto} in ${nicho} niche, ${estilo} style, Brazilian market, high contrast, professional, premium quality, product focused, clean typography area, blue and dark palette, white background, 4k`, aspectRatio: aspect, configuracao: 'Qualidade: Alta, Estilo: Fotográfico/Ilustração' },
        { label: 'Versão 2 (emocional)', prompt: `emotional marketing ${tipo} for ${produto}, happy Brazilian customer using the product, bright natural lighting, ${estilo} aesthetic, lifestyle photography, warm colors, social media style, ux/ui design`, aspectRatio: aspect, configuracao: 'Adicionar pessoa real sorrindo, texto sobreposto' },
        { label: 'Versão 3 (conversão)', prompt: `direct response ${tipo} design, big bold headline, red CTA button, urgency badge "SÓ HOJE", product mockup center, ${estilo}, high contrast black and yellow, mobile-first, optimized for clicks`, aspectRatio: aspect, configuracao: 'Texto grande, botão amarelo/vermelho evidente' },
        { label: 'Versão 4 (luxo)', prompt: `luxury premium ${tipo} for ${produto}, dark background #0B0F1A, gold accents, spotlight product photography, minimalist ${estilo}, brazilian luxury market, soft shadows, cinematic lighting`, aspectRatio: aspect, configuracao: 'Fundo escuro, detalhes dourados' },
        { label: 'Versão 5 (3D/icon)', prompt: `3D icon illustration of ${produto}, floating in space, soft gradients, modern trend, isometric style, glass morphism, bento grid layout, Brazilian tech SaaS aesthetic, pastel colors`, aspectRatio: '1:1', configuracao: '3D, sombras suaves, glassmorphism' },
      ],
      dicas: [
        'Sempre deixe 20% da área livre para texto (especialmente em anúncios do Meta/Google)',
        'Use contraste alto entre texto e fundo (mínimo 4.5:1 para acessibilidade)',
        'Teste 5 variações de cor de botão — amarelo e vermelho costumam converter mais',
        'Rostos de pessoas reais aumentam CTR em até 38%',
        'Remova água genérica ("imagem meramente ilustrativa")',
        'Para Reels/Stories: coloque texto no centro-topo; NADA na área inferior (onde fica o botão)',
      ],
      canvaMagic: [
        'Use Magic Edit → trocar fundo',
        'Use Magic Write para gerar headline',
        'Use Auto-adjust para brilho/contraste',
        'Use Animate → "Fade" ou "Pop" para stories',
        'Use Brand Kit para aplicar paleta KIYVO automaticamente',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. HOTJARHEATMAP — análise de CRO (conversion rate optimization) heurística
// ─────────────────────────────────────────────────────────────────────────────
export interface HeatmapInput_v10 {
  url?: string
  elementos: Array<{ tipo: string; texto: string; posicao: string }>
  abaixoDaDobra?: boolean
  descricaoPagina: string
}
export interface HeatmapOutput_v10 {
  score: number
  problemas: Array<{ severidade: 'alta' | 'media' | 'baixa'; problema: string; correcao: string; impacto: string }>
  oportunidades: string[]
  scoreCor: string
}
export async function hotjarheatmap(input: HeatmapInput_v10, ctx: AgentContext): Promise<AgentResult<HeatmapOutput_v10>> {
  const { elementos, descricaoPagina, abaixoDaDobra } = input
  const problemas: HeatmapOutput_v10['problemas'] = []
  let score = 75
  if (descricaoPagina.length < 50) { problemas.push({ severidade: 'alta', problema: 'Descrição muito curta, sem contextualização acima da dobra', correcao: 'Adicione headline claro + subheadline + CTA acima da dobra', impacto: '-30% conversão' }); score -= 15 }
  const temCTA = elementos.some(e => /comprar|quero|come[cç]ar|cadastrar|acessar|saber mais/i.test(e.texto))
  if (!temCTA) { problemas.push({ severidade: 'alta', problema: 'Nenhum botão CTA identificado acima da dobra', correcao: 'Adicione um botão grande (ex: "Quero começar agora") em cor contrastante', impacto: '-40% conversão' }); score -= 25 }
  const temProvaSocial = elementos.some(e => /aprovado|cliente|aluno|estrela|4\.[0-9]|depoimento/i.test(e.texto))
  if (!temProvaSocial) { problemas.push({ severidade: 'media', problema: 'Sem prova social acima da dobra', correcao: 'Adicione selo "aprovado por X pessoas" ou "nota 4.8/5"', impacto: '-15% conversão' }); score -= 10 }
  if (abaixoDaDobra) { problemas.push({ severidade: 'baixa', problema: 'CTAs principais só aparecem abaixo da dobra', correcao: 'Mova pelo menos um CTA para a primeira seção (acima da dobra)', impacto: '-10%' }); score -= 5 }
  const muitosCampos = elementos.filter(e => /input|campo|form/i.test(e.tipo)).length
  if (muitosCampos > 3) { problemas.push({ severidade: 'alta', problema: `Formulário com ${muitosCampos} campos acima da dobra`, correcao: 'Reduza para 2 campos (ex: nome + email) ou 3 no máximo', impacto: '-25% abandono' }); score -= 12 }
  if (problemas.length === 0) { problemas.push({ severidade: 'baixa', problema: 'Sem problemas críticos detectados', correcao: 'Execute teste A/B nas cores dos botões', impacto: 'Otimização contínua' }) }
  const oportunidades = [
    'Adicione barra de urgência/escassez no topo ("restam X unidades")',
    'Teste CTA personalizado pelo parâmetro UTM do visitante',
    'Adicione seção FAQ diretamente na página de vendas',
    'Adicione garantia incondicional visível perto do botão',
    'Use exit-intent popup com cupom de 5% para quem está saindo',
    'Adicione sticky CTA mobile (barra fixa no rodapé)',
    'Implemente chat/bot de whatsapp flutuante com tempo de resposta <3min',
  ]
  const scoreCor = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  return { ok: true, data: { score, problemas, oportunidades, scoreCor } }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. EMAILSWIPEFILE — biblioteca de 100+ assuntos de email que abrem
// ─────────────────────────────────────────────────────────────────────────────
export interface EmailSwipeInput_v10 {
  nicho: string
  tipo?: 'boasvindas' | 'lancamento' | 'carrinho' | 'reentrada' | 'vendas' | 'newsletter' | 'bfsale' | 'abandonado'
  publico?: string
}
export interface EmailSwipeOutput_v10 {
  assunto: string[]
  modelos: Array<{ nome: string; assunto: string; preview: string; corpo: string }>
  estatisticas: { aberturaMedia: string; cliqueMedia: string }
}
export async function emailswipefile(input: EmailSwipeInput_v10, ctx: AgentContext): Promise<AgentResult<EmailSwipeOutput_v10>> {
  const { nicho, tipo = 'vendas' } = input
  const assuntos: Record<string, string[]> = {
    boasvindas: [
      'Bem-vindo! Aqui está o seu presente 🎁',
      'Seu primeiro passo começa agora',
      '[Nome], guardei isso pra você',
      'Antes de começar, leia isso',
      'Por que você está recebendo esse email?',
    ],
    carrinho: [
      'Esqueceu alguma coisa? 🛒',
      'Sua compra ficou para trás',
      'Seu produto está esperando',
      'Tem algo no seu carrinho...',
      'Última chance: seu carrinho expira em 24h',
    ],
    lancamento: [
      'ABRIU 🚀 (é agora ou nunca)',
      'Contagem regressiva: 48h',
      'Eu tenho uma notícia pra você...',
      'Você foi selecionado',
      'Atenção: o que eu vou te mostrar sai do ar em 72h',
      'Preço especial só para você',
    ],
    vendas: [
      `A verdade sobre ${nicho} que ninguém te conta`,
      'Eu errei para você não errar',
      '3 coisas que eu queria ter sabido antes',
      'Como eu saí do zero a 10k em 90 dias',
      'O erro que me custou R$15.000',
      'Desafio de 7 dias (gratuito)',
      'Pare de fazer isso imediatamente',
      'Você não está velho/atrasado',
      'Respondi a dúvida de um aluno',
      'Por que 87% desistem no primeiro mês',
    ],
    reentrada: [
      'Ainda quer continuar?',
      'Notei que você sumiu...',
      'Saudades? 😢',
      'Quer continuar recebendo?',
      'Tem novidade quente aqui',
    ],
    newsletter: [
      '[Newsletter] 5 notícias de ' + nicho + ' que importam essa semana',
      'O que rolou na semana: edição X',
      'A única coisa que você precisa ler hoje',
      'Sua leitura de sábado',
    ],
    bfsale: [
      '🔥 BLACK FRIDAY COMEÇOU (35% OFF)',
      'Seu desconto está aqui',
      'Black Friday: menor preço do ano',
      'Só hoje: 50% OFF em tudo',
      'Últimas 3 horas',
    ],
    abandonado: [
      'Sua sessão expirou — mas salvei tudo',
      'Posso te ajudar com algo?',
      'Notei que você parou no checkout',
      'Dúvida sobre o pagamento?',
    ],
  }
  return {
    ok: true,
    data: {
      assunto: assuntos[tipo] || assuntos.vendas,
      modelos: [
        { nome: 'PAS (Problema-Agitacao-Solucao)', assunto: `A dor de ${nicho} (e como resolver)`, preview: 'Isso está travando seus resultados?', corpo: `Olá [Nome],\n\nSe você é de ${nicho}, provavelmente já passou por isso:\n[DESCREVA A DOR].\n\nA verdade é que isso não é sua culpa. É que falta um método.\n\nE é exatamente isso que o [PRODUTO] resolve.\n\n[CTA]\n\nAbs,\nEquipe KIYVO` },
        { nome: 'História Pessoal', assunto: 'Como eu perdi R$15 mil em anúncios e o que aprendi', preview: 'Uma história real de falha e recuperação', corpo: `Olá [Nome],\n\nEm 2023 eu gastei R$15 mil em anúncios de ${nicho} e tive prejuízo.\n\nErrei o público, errei o criativo, errei o produto.\n\nHoje, com o método correto, eu recupero esse valor em 2 dias.\n\nQuer ver como?\n[CTA]` },
        { nome: 'Urgência Baixa', assunto: 'Isso pode esperar — mas se você quiser adiantar...', preview: 'Sem pressão, só uma oportunidade', corpo: `Olá [Nome],\n\nSabe aquela sensação de que "um dia eu começo"?\n\nEsse dia pode ser hoje se você quiser.\n\n[PRODUTO] está aberto agora, mas você decide quando.\n\n[CTA]` },
      ],
      estatisticas: { aberturaMedia: '20-35% (boas-vindas), 12-22% (campanhas), 25-40% (carrinho abandonado)', cliqueMedia: '2-5% (newsletter), 5-12% (ofertas), 8-15% (carrinho)' },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. WHATSAPPFUNNEL — funil completo de WhatsApp (sequência de mensagens que converte)
// ─────────────────────────────────────────────────────────────────────────────
export interface WhatsAppFunnelInput_v10 {
  produto: string
  preco: number
  nicho: string
  publico: string
  objeoPrincipal?: string
}
export interface WhatsAppFunnelOutput_v10 {
  boasVindas: string[]
  aquecimento: Array<{ atraso: string; mensagem: string; tipo: 'texto' | 'audio' | 'video' | 'imagem' }>
  oferta: Array<{ atraso: string; mensagem: string }>
  objeoes: Array<{ objecao: string; resposta: string }>
  fechamento: string[]
  metricas: { conversaoEstimada: string; tempoMedio: string }
}
export async function whatsappfunnel(input: WhatsAppFunnelInput_v10, ctx: AgentContext): Promise<AgentResult<WhatsAppFunnelOutput_v10>> {
  const { produto, preco, nicho, publico, objeoPrincipal = 'muito caro' } = input
  return {
    ok: true,
    data: {
      boasVindas: [
        `Olá [NOME]! Tudo bem? Sou a Kiya, assistente da KIYVO 🤖`,
        `Vi que você se interessou por ${produto}. Mandei um abraço!`,
        `Para começar, me conta: você já trabalha com ${nicho} ou está começando?`,
      ],
      aquecimento: [
        { atraso: '5min', mensagem: `Aliás, preparei um presente para você: um checklist gratuito de ${nicho} em PDF. Quer receber?`, tipo: 'texto' },
        { atraso: '15min', mensagem: '📚 Aqui está o checklist! É só aplicar que você já vê resultado nos próximos 7 dias. Me diga depois o que achou.', tipo: 'texto' },
        { atraso: '1 dia', mensagem: `E aí, [NOME], deu uma olhada no checklist? Qual parte você achou mais útil?`, tipo: 'texto' },
        { atraso: '2 dias', mensagem: `Uma pergunta rápida: qual a sua maior dificuldade hoje em ${nicho}?`, tipo: 'texto' },
        { atraso: '3 dias', mensagem: `Perfeito! Já ajudei mais de ${Math.floor(Math.random() * 3000) + 1000} ${publico} com essa mesma dificuldade. Vou te mandar um case de sucesso rapidinho 👇`, tipo: 'texto' },
        { atraso: '10min', mensagem: 'https://kiyvo.com.br/depoimentos — aqui você vê alguns prints de resultados de clientes.', tipo: 'texto' },
      ],
      oferta: [
        { atraso: '4 dias', mensagem: `[NOME], com base no que você me falou, eu queria te apresentar o ${produto} — é a solução que eu indico para todo ${publico} que quer ${nicho}. Ele custa R$${preco.toFixed(2)} e tem garantia de 7 dias. Quer saber mais detalhes ou prefere que eu te mande o link direto?` },
        { atraso: '1h', mensagem: `Esqueci de te falar um detalhe: por você ter entrado em contato por aqui, eu consigo um cupom de 5% OFF exclusivo. Quer aproveitar?` },
      ],
      objeoes: [
        { objecao: 'muito caro', resposta: `Entendo perfeitamente, [NOME]. Na verdade, R$${preco.toFixed(2)} é menos do que um café por dia no primeiro mês. E o ${produto} te dá potencial de ganhar esse valor de volta na primeira semana. Além disso, tem garantia de 7 dias — se não gostar, devolvemos 100% do dinheiro. Quer tentar?` },
        { objecao: 'vou pensar', resposta: `Claro! Pensar é importante. Uma pergunta: o que mais te faz hesitar? É o preço, o conteúdo, ou é medo de não dar certo?` },
        { objecao: 'não tenho dinheiro agora', resposta: `Sem problemas! A KIYVO parcela em até 12x no cartão, ou você pode pagar por PIX e ganhar mais 5% OFF. Além disso, se esperar muito, o preço pode aumentar — o cupom de 5% expira em 48h. Quer que eu te explique as formas de pagamento?` },
        { objecao: 'tenho medo de ser golpe', resposta: `Super compreensível. A KIYVO é uma plataforma brasileira registrada, CNPJ ativo, com mais de 50.000 usuários. Temos página de transparência (kiyvo.com.br/transparencia), política de reembolso clara e suporte 7 dias. Além disso, o vendedor só recebe o dinheiro após 7 dias da sua compra (garantia anti-golpe).` },
        { objecao: 'não tenho tempo', resposta: `${produto} foi desenhado para quem tem pouco tempo — são menos de 30 minutos por dia de aplicação. Muitos alunos começam aplicando no transporte do trabalho.` },
      ],
      fechamento: [
        `Clica aqui para garantir seu ${produto} com o cupom: https://kiyvo.com.br/p/PRODUTO?cupom=WPP5`,
        `Assim que o pagamento confirmar, você recebe acesso instantâneo no seu email.`,
        `Qualquer dúvida é só mandar aqui. Estou te esperando! 🚀`,
      ],
      metricas: { conversaoEstimada: '8-15% (lista não aquecida), 25-40% (leads aquecidos)', tempoMedio: '5-7 dias do primeiro contato à compra' },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. INSTAGRAMGRID — planejamento de grid do Instagram 9/12/18 posts + biografia
// ─────────────────────────────────────────────────────────────────────────────
export interface InstagramGridInput_v10 {
  nicho: string
  produto: string
  publico: string
  tom?: 'profissional' | 'descontraido' | 'educativo' | 'inspiracional' | 'ousado'
}
export interface InstagramGridOutput_v10 {
  bio: { nome: string; linha1: string; linha2: string; linha3: string; linha4: string; link: string }
  destaques: Array<{ nome: string; cor: string }>
  posts: Array<{ id: number; tipo: 'feed' | 'reel' | 'carrossel'; capa: string; legenda: string; hashtags: string[]; cor: string }>
  calendario30dias: Array<{ dia: number; tipo: string; tema: string }>
}
export async function instagramgrid(input: InstagramGridInput_v10, ctx: AgentContext): Promise<AgentResult<InstagramGridOutput_v10>> {
  const { nicho, produto, publico, tom = 'educativo' } = input
  const posts: InstagramGridOutput_v10['posts'] = []
  const tipos: Array<{ t: 'feed' | 'reel' | 'carrossel'; nome: string; cor: string }> = [
    { t: 'reel', nome: 'Hook de dor + revelação', cor: '#0F172A' },
    { t: 'carrossel', nome: '3 erros que te travam', cor: '#2563EB' },
    { t: 'feed', nome: 'Citação/motivacional', cor: '#FAFAFA' },
    { t: 'reel', nome: 'Tutorial rápido (30s)', cor: '#10B981' },
    { t: 'carrossel', nome: 'Antes vs Depois', cor: '#F59E0B' },
    { t: 'feed', nome: 'Prova social/depoimento', cor: '#8B5CF6' },
    { t: 'reel', nome: 'Mito vs Verdade', cor: '#EF4444' },
    { t: 'carrossel', nome: 'Passo a passo prático', cor: '#06B6D4' },
    { t: 'feed', nome: 'Oferta/CTA', cor: '#0F172A' },
  ]
  tipos.forEach((t, i) => {
    posts.push({
      id: i + 1,
      tipo: t.t,
      capa: `${t.nome} — ${nicho}`,
      legenda: `${t.nome} em ${nicho}:\n\n${tipoLegenda(t.t, nicho, produto, publico)}\n\n👇 Marca um amigo que precisa ver isso\n\n#${nicho.replace(/\s/g, '')} #marketingdigitalbrasil #kiyvo #${publico.replace(/\s/g, '')} #brasil #vendasonline #empreendedorismo`,
      hashtags: [`#${nicho.replace(/\s/g, '')}`, '#dicas', '#brasil', '#kiyvo', `#${publico.replace(/\s/g, '')}`, '#marketingdigital', '#empreendedorismo', '#vendasonline', '#rendaextra'],
      cor: t.cor,
    })
  })
  const calendario: Array<{ dia: number; tipo: string; tema: string }> = []
  for (let i = 1; i <= 30; i++) {
    const diaSemana = (i % 7)
    calendario.push({
      dia: i,
      tipo: diaSemana === 1 ? 'Reel + Story' : diaSemana === 3 ? 'Carrossel' : diaSemana === 5 ? 'Reel viral' : diaSemana === 0 ? 'Post de oferta' : 'Story + engajamento',
      tema: temasSemana[Math.floor(i / 7) % temasSemana.length].replace('{nicho}', nicho).replace('{produto}', produto),
    })
  }
  return {
    ok: true,
    data: {
      bio: {
        nome: `${produto} | ${nicho}`,
        linha1: `🔥 ${nicho} sem enrolação`,
        linha2: `🧠 +200k ${publico}`,
        linha3: `🎁 Grátis: [link da bio]`,
        linha4: `👇 ${produto} com 8% OFF só hoje`,
        link: 'https://kiyvo.com.br/p/xxx',
      },
      destaques: [
        { nome: '📚 Grátis', cor: '#2563EB' },
        { nome: '⭐ Depoimentos', cor: '#10B981' },
        { nome: '🎁 Ofertas', cor: '#F59E0B' },
        { nome: '❓ FAQ', cor: '#8B5CF6' },
        { nome: '💸 Resultados', cor: '#06B6D4' },
        { nome: '📞 Contato', cor: '#0F172A' },
      ],
      posts,
      calendario30dias: calendario,
    },
  }
}
function tipoLegenda(t: string, nicho: string, produto: string, publico: string): string {
  if (t === 'reel') return `Salva esse reel para aplicar depois! 🚀\n\nNesse vídeo eu te mostro exatamente o que funciona em ${nicho} em 2026. O resto é ruído.\n\nClica no link da bio para saber mais sobre o ${produto}.`
  if (t === 'carrossel') return `Arrasta pro lado para ver os 7 segredos de ${nicho} que ninguém te conta.\n\nA maioria dos ${publico} erra nesses pontos básicos e não entende por que não tem resultado.\n\nSalva esse post antes que ele saia do ar.`
  return `"O sucesso em ${nicho} não é sobre fazer mais, é sobre fazer o que realmente move o ponteiro."\n\nSe você é ${publico} e está cansado de consumir conteúdo d'agua com açúcar, clica no link da bio para conhecer o ${produto}.`
}
const temasSemana = [
  'Semana de Fundamentos de {nicho}',
  'Semana de Erros Comuns em {nicho}',
  'Semana de Resultados/Prova Social',
  'Semana de Oferta/Oferta Relâmpago',
]

// ─────────────────────────────────────────────────────────────────────────────
// 12. REVIEWREQUEST — pedidos de review que aumentam taxa de avaliação para 40%+
// ─────────────────────────────────────────────────────────────────────────────
export interface ReviewRequestInput_v10 {
  produto: string
  diasAposCompra?: number
  publico: string
}
export interface ReviewRequestOutput_v10 {
  emails: Array<{ assunto: string; corpo: string }>
  whatsapp: string[]
  incentivo: { tipo: string; descricao: string }
  regras: string[]
}
export async function reviewrequest(input: ReviewRequestInput_v10, ctx: AgentContext): Promise<AgentResult<ReviewRequestOutput_v10>> {
  const { produto, diasAposCompra = 3, publico } = input
  return {
    ok: true,
    data: {
      emails: [
        { assunto: `Como está o ${produto}, [NOME]? ⭐`, corpo: `Olá [NOME]! Tudo bem?\n\nJá se passaram ${diasAposCompra} dias desde que você recebeu o ${produto}. Queremos saber:\n\nO que você está achando?\n\nSua avaliação honestamente ajuda outros ${publico} a tomar a decisão certa. E como agradecimento, você ganha 50 KD Points (R$0,50 de desconto na próxima compra) quando deixar uma review com foto 🎁\n\n[Avaliar agora]\n\nAbs,\nEquipe KIYVO` },
        { assunto: 'Sua opinião vale KD Points! 🎁', corpo: `[NOME], notamos que você ainda não avaliou o ${produto}. Leva só 30 segundos e você ganha 50 KD Points de recompensa.\n\n⭐⭐⭐⭐⭐ Avaliar agora\n\nObrigado!` },
      ],
      whatsapp: [
        `[NOME], tudo bem? Como está sua experiência com ${produto}? Deixe uma review honestamente em 30 segundos e ganhe 50 KD Points (equivalente a R$0,50 em créditos) 👉 [LINK]`,
        `Lembrete: sua review ajuda outros ${publico} e te dá cashback para a próxima compra 🚀`,
      ],
      incentivo: { tipo: 'KD Points', descricao: '50 KD Points por review com texto; 100 KD Points por review com foto; 200 KD Points por review com vídeo. KD Points valem desconto em produtos da plataforma.' },
      regras: [
        'Incentivo não pode ser condicionado a avaliação POSITIVA (é contra o CDC e as políticas da KIYVO)',
        'Deixe claro que todas as avaliações (boas ou ruins) recebem o incentivo',
        'Avaliações falsas ou compradas serão removidas',
        'Resposta pública do vendedor a TODAS as reviews (positivas e negativas) em até 48h',
        'Reviews negativas são oportunidade de mostrar que se importa com o cliente',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. SALESPAGEMINIMALISTA — estrutura de página de vendas de alta conversão
// ─────────────────────────────────────────────────────────────────────────────
export interface SalesPageInput_v10 {
  produto: string
  preco: number
  nicho: string
  publico: string
  promessa: string
}
export interface SalesPageOutput_v10 {
  estrutura: Array<{ secao: string; titulo?: string; conteudo: string | string[]; altura?: string }>
  copyHeadline: string
  copySubheadline: string
  cores: { primaria: string; cta: string; fundo: string; texto: string }
  metricasEstimadas: { conversao: string; tempoLeitura: string }
}
export async function salespageminimalista(input: SalesPageInput_v10, ctx: AgentContext): Promise<AgentResult<SalesPageOutput_v10>> {
  const { produto, preco, nicho, publico, promessa } = input
  return {
    ok: true,
    data: {
      copyHeadline: `${produto}: ${promessa}`,
      copySubheadline: `A solução completa para ${publico} que querem ${nicho} sem enrolação, sem curso de 80 horas, sem promessas milagrosas. Acesse agora por apenas R$${preco.toFixed(2)}.`,
      estrutura: [
        { secao: 'Cabeçalho', conteudo: ['Logo KIYVO', 'Contador de oferta ("Restam 23h")'] },
        { secao: 'Hero (acima da dobra)', titulo: `H1: ${produto}: ${promessa}`, conteudo: ['Headline grande (font-black)', 'Subheadline de suporte', 'Preço RISCADO + preço atual', 'Botão CTA grande ("Quero acessar agora")', 'Selo "Garantia de 7 dias" + "Entrega imediata"'], altura: '85vh' },
        { secao: 'Problema', titulo: 'A dor que você está sentindo é real (e não é sua culpa)', conteudo: ['Parágrafo curto descrevendo a dor do público', '3 bullets de dores reais', 'Identificação: "Eu também já passei por isso"'] },
        { secao: 'Solucao', titulo: `Apresentando ${produto}`, conteudo: ['Vídeo curto do produto (60-90s)', '3-5 bullets do que o produto entrega', 'Screenshot/demo visual'] },
        { secao: 'Beneficios', titulo: 'O que você recebe ao acessar hoje?', conteudo: ['Lista de 8-12 benefícios (não features, benefícios!)'] },
        { secao: 'Modulos/Conteudo', titulo: 'Conteúdo completo', conteudo: ['Accordion com módulos/aulas/recursos'] },
        { secao: 'Prova social', titulo: `Mais de ${Math.floor(Math.random() * 20000) + 5000} ${publico} já transformaram seus resultados`, conteudo: ['8-12 depoimentos com foto + nome + profissão', 'Print de resultados', 'Vídeo curtos de depoimento'] },
        { secao: 'Bonus', titulo: 'Bônus exclusivos (só essa semana)', conteudo: ['5-8 bônus com valor monetário ("R$497 de valor")', 'Acesso vitalício/atualizações gratuitas'] },
        { secao: 'Garantia', titulo: 'Garantia incondicional de 7 dias', conteudo: ['Selo/crachá de garantia', 'Texto: "Se em 7 dias você não gostar, devolvemos 100% do dinheiro, sem perguntas."'] },
        { secao: 'Oferta', titulo: `Por apenas R$${preco.toFixed(2)} à vista`, conteudo: [`Preço anterior: R$${(preco * 1.8).toFixed(2)} RISCADO`, `Preço atual: R$${preco.toFixed(2)}`, 'Parcelamento em até 12x', 'Botão CTA', 'Contador regressivo'] },
        { secao: 'FAQ', titulo: 'Dúvidas frequentes', conteudo: ['8-12 perguntas com accordion'] },
        { secao: 'Sobre o criador', titulo: 'Quem criou o produto', conteudo: ['Foto + bio curta + credenciais'] },
        { secao: 'Rodape', conteudo: ['Links KIYVO (termos, privacidade, suporte)', 'Pagamento seguro', 'KD Points'] },
      ],
      cores: { primaria: '#2563EB', cta: '#0F172A', fundo: '#FAFAFA', texto: '#0F172A' },
      metricasEstimadas: { conversao: '3-8% (página otimizada)', tempoLeitura: '4-6 minutos' },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. PODCASTGUESTPITCH — pitch para aparecer em podcast/canal do YouTube e ganhar autoridade
// ─────────────────────────────────────────────────────────────────────────────
export interface PodcastPitchInput_v10 {
  nomeEspecialista: string
  nicho: string
  especialidade: string
  resultados?: string
}
export interface PodcastPitchOutput_v10 {
  templates: Array<{ canal: string; assunto: string; corpo: string }>
  temasEpisodio: string[]
  preparacaoChecklist: string[]
}
export async function podcastguestpitch(input: PodcastPitchInput_v10, ctx: AgentContext): Promise<AgentResult<PodcastPitchOutput_v10>> {
  const { nomeEspecialista, nicho, especialidade, resultados = 'mais de 1.000 alunos transformados' } = input
  return {
    ok: true,
    data: {
      templates: [
        {
          canal: 'Podcast pequeno/médio (<10k inscritos)',
          assunto: `Proposta de participação — ${nomeEspecialista}`,
          corpo: `Olá [APRESENTADOR], tudo bem?\n\nMe chamo ${nomeEspecialista}, trabalho com ${especialidade} em ${nicho}, e tenho ${resultados}.\n\nSou ouvinte do [NOME DO PODCAST] há [TEMPO] e gostei MUITO do episódio [EPISÓDIO ESPECÍFICO].\n\nQueria propor uma participação no seu podcast para falar sobre [TEMA] — um assunto que gera MUITA dúvida no público e que ainda não foi abordado por aí.\n\nPontos que posso trazer:\n- [Ponto 1 contra-intuitivo]\n- [Ponto 2 prático com número]\n- [Ponto 3 polêmico mas verdadeiro]\n\nA audiência sai do episódio com um passo a passo aplicável no mesmo dia.\n\nCaso interesse, posso enviar um roteiro prévio com os pontos e me adaptar ao seu formato.\n\nAbs,\n${nomeEspecialista}`,
        },
        {
          canal: 'Podcast grande (>50k inscritos)',
          assunto: `Indicação de convidado: ${nomeEspecialista} — ${especialidade}`,
          corpo: `Olá [APRESENTADOR/EDIÇÃO], tudo bem?\n\nAcompanho o [PODCAST] há anos e sou fã do trabalho de vocês.\n\nQueria indicar um convidado que acho que os ouvintes iriam amar: ${nomeEspecialista}, referência em ${especialidade} (${nicho}).\n\nEle/ela tem ${resultados}, e um ponto de vista contra-intuitivo sobre [TEMA POLÊMICO] que geraria MUITO burburinho.\n\nPontos de destaque:\n- [Credencial específica]\n- [Opinião polêmica sobre o nicho]\n- [Case real com números]\n\nPosso conectar vocês se fizer sentido?\n\nAbs,\n[SEU NOME]`,
        },
      ],
      temasEpisodio: [
        `A verdade sobre ${nicho} que ninguém te conta (2026)`,
        `Como eu saí do zero aos 6 dígitos em ${nicho} em 12 meses (sem gastar em anúncio)`,
        `3 erros que matam ${publicoSimulado(nicho)} antes mesmo deles começarem`,
        `${nicho}: mitos que estão te impedindo de crescer em 2026`,
        `O futuro de ${nicho}: o que vai funcionar e o que vai morrer nos próximos 2 anos`,
        `Debate: ${especialidade} funciona mesmo ou é golpe?`,
      ],
      preparacaoChecklist: [
        'Assistir/ouvir pelo menos 5 episódios recentes do podcast para entender a vibe',
        'Mencionar um episódio ESPECÍFICO no pitch (prova que você realmente ouve)',
        'Preparar 3 pontos principais (1 contra-intuitivo, 1 prático, 1 polêmico)',
        'Ter uma história pessoal curta e impactante (2min) pronta para contar',
        'Levar números/estudos para embasar afirmações (não só opinião)',
        'Preparar uma pergunta polêmica para fazer ao apresentador (audiência ama)',
        'Chegar 15min antes do horário da gravação para teste de áudio',
        'Usar microfone de lapela ou headset (não microfone de notebook)',
        'Ter linktree/link de oferta pronta para compartilhar nos comentários',
        'Enviar sugestão de títulos e timestamps para o editor depois da gravação',
      ],
    },
  }
}
function publicoSimulado(nicho: string): string { return `pessoas de ${nicho}` }

// ─────────────────────────────────────────────────────────────────────────────
// 15. CROAUDIT — auditoria de CRO (conversion rate optimization) baseada em heurísticas
// ─────────────────────────────────────────────────────────────────────────────
export interface CROAuditInput_v10 {
  headline?: string
  temCTAAcimaDobra?: boolean
  temProvaSocial?: boolean
  temGarantia?: boolean
  temFAQ?: boolean
  camposFormulario?: number
  velocidadeCarregamento?: 'rapido' | 'medio' | 'lento'
  mobileResponsivo?: boolean
  precoClaro?: boolean
  temObjeoesRespondidas?: boolean
}
export interface CROAuditOutput_v10 {
  score: number
  corScore: string
  falhas: Array<{ gravidade: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'; titulo: string; correcao: string }>
  recomendacoes: string[]
  checklistFinal: Array<{ item: string; ok: boolean }>
}
export async function croaudit(input: CROAuditInput_v10, ctx: AgentContext): Promise<AgentResult<CROAuditOutput_v10>> {
  const falhas: CROAuditOutput_v10['falhas'] = []
  let score = 100
  if (!input.headline || input.headline.length > 120) { falhas.push({ gravidade: 'CRITICA', titulo: 'Headline acima da dobra ausente ou muito longa (>120 caracteres)', correcao: 'Crie headline de até 60 caracteres com promessa clara e benefício principal.' }); score -= 20 }
  if (!input.temCTAAcimaDobra) { falhas.push({ gravidade: 'CRITICA', titulo: 'Sem CTA acima da dobra', correcao: 'Adicione um botão CTA grande (ex: "Quero comprar agora") visível sem rolagem.' }); score -= 20 }
  if (!input.temProvaSocial) { falhas.push({ gravidade: 'ALTA', titulo: 'Sem prova social acima da dobra', correcao: 'Adicione avaliações, número de clientes, ou selos de confiança.' }); score -= 12 }
  if (!input.temGarantia) { falhas.push({ gravidade: 'ALTA', titulo: 'Garantia não visível', correcao: 'Exiba "Garantia de 7 dias" em um selo perto do botão de compra.' }); score -= 10 }
  if (input.camposFormulario && input.camposFormulario > 3) { falhas.push({ gravidade: 'ALTA', titulo: `Formulário com ${input.camposFormulario} campos (muitos)`, correcao: 'Reduza para 2-3 campos no máximo.' }); score -= 10 }
  if (input.velocidadeCarregamento === 'lento') { falhas.push({ gravidade: 'ALTA', titulo: 'Site lento', correcao: 'Comprima imagens, use next/image, remova scripts desnecessários.' }); score -= 12 }
  if (input.mobileResponsivo === false) { falhas.push({ gravidade: 'CRITICA', titulo: 'Não responsivo mobile', correcao: '90% das compras são mobile — responsividade é obrigatória.' }); score -= 20 }
  if (!input.precoClaro) { falhas.push({ gravidade: 'ALTA', titulo: 'Preço não claro ou escondido', correcao: 'Mostre preço imediatamente (esconder preço reduz conversão em 30%+).' }); score -= 10 }
  if (!input.temObjeoesRespondidas) { falhas.push({ gravidade: 'MEDIA', titulo: 'Objeções não são respondidas', correcao: 'Liste as 5 principais objeções e responda uma por uma na página.' }); score -= 7 }
  if (!input.temFAQ) { falhas.push({ gravidade: 'BAIXA', titulo: 'Sem FAQ', correcao: 'Adicione seção FAQ com 8-12 perguntas (ajuda com SEO também).' }); score -= 4 }
  score = Math.max(0, score)
  const corScore = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  return {
    ok: true,
    data: {
      score,
      corScore,
      falhas,
      recomendacoes: [
        'Adicione sticky CTA no mobile (barra fixa inferior)',
        'Use exit-intent popup com cupom de 5%',
        'Teste cores de botão (preto, amarelo, vermelho convertem mais)',
        'Adicione vídeo curto (60-90s) explicando o produto na dobra',
        'Implemente timer de urgência na oferta (sem fake, por favor)',
        'Use microcopy no botão ("Sim! Quero acessar agora" em vez de "Comprar")',
        'Adicione badges de segurança/pagamento perto do CTA',
        'Rode teste A/B com pelo menos 2 versões de headline antes de concluir',
      ],
      checklistFinal: [
        { item: 'Headline com promessa clara (<=60 caracteres)', ok: !!input.headline && input.headline.length <= 120 },
        { item: 'CTA acima da dobra', ok: !!input.temCTAAcimaDobra },
        { item: 'Prova social visível', ok: !!input.temProvaSocial },
        { item: 'Garantia de 7 dias', ok: !!input.temGarantia },
        { item: 'FAQ com 8+ perguntas', ok: !!input.temFAQ },
        { item: 'Formulário com até 3 campos', ok: !input.camposFormulario || input.camposFormulario <= 3 },
        { item: 'Mobile responsivo', ok: input.mobileResponsivo !== false },
        { item: 'Preço claro à primeira vista', ok: !!input.precoClaro },
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. KDPOINTSCAMPAIGN — cria campanhas de KD Points (100KD = R$1) para fidelizar
// ─────────────────────────────────────────────────────────────────────────────
export interface KDPointsInput_v10 {
  tipo: 'cadastro' | 'compra' | 'review' | 'indicacao' | 'aniversario' | 'primeira_compra' | 'comentario'
  produto?: string
  pontosPorReal?: number
}
export interface KDPointsOutput_v10 {
  nome: string
  descricao: string
  regras: string[]
  pontos: number
  valorFinanceiro: number
  custo: string
  textoDivulgacao: string
  badge: string
}
export async function kdpointscampaign(input: KDPointsInput_v10, ctx: AgentContext): Promise<AgentResult<KDPointsOutput_v10>> {
  const { tipo, pontosPorReal = 5 } = input
  const configs: Record<string, { pontos: number; nome: string; desc: string; badge: string }> = {
    cadastro: { pontos: 200, nome: 'Boas-vindas KIYVO', desc: 'Ganhe pontos ao se cadastrar e confirmar email', badge: '🎁' },
    compra: { pontos: 0, nome: 'Cashback KIYVO', desc: `Ganhe ${pontosPorReal} KD Points por cada R$1 gasto`, badge: '💰' },
    review: { pontos: 100, nome: 'Opinião que Vale', desc: 'Avalie um produto comprado e ganhe pontos', badge: '⭐' },
    indicacao: { pontos: 500, nome: 'Indique e Ganhe', desc: 'Indique um amigo que comprar, vocês dois ganham', badge: '🤝' },
    aniversario: { pontos: 300, nome: 'Presente de Aniversário', desc: 'Pontos extras no mês do seu aniversário', badge: '🎂' },
    primeira_compra: { pontos: 300, nome: 'Primeira Compra', desc: 'Pontos em dobro na primeira compra', badge: '🎉' },
    comentario: { pontos: 50, nome: 'Participa e Ganha', desc: 'Comente em produtos e posts do blog', badge: '💬' },
  }
  const c = configs[tipo] || configs.compra
  const pontos = tipo === 'compra' ? 0 : c.pontos
  return {
    ok: true,
    data: {
      nome: c.nome,
      descricao: c.desc,
      pontos,
      valorFinanceiro: pontos / 100,
      custo: '0% — KD Points só geram custo quando usados em desconto máximo de 50%',
      regras: [
        '100 KD Points = R$1 de desconto em compras futuras',
        'Desconto máximo de 50% do valor do produto usando KD Points',
        'Pontos expiram em 12 meses',
        'Pontos não são sacáveis em dinheiro',
        'A cada R$1 gasto, o comprador ganha 5 KD Points (ajustável por plano)',
        'Vendedores recebem pontos em dobro em assinatura Plus/Pro/Vendor Pro',
        'Indicação: 500 pontos para quem indicou + 200 para quem se cadastrou pelo link',
      ],
      textoDivulgacao: `${c.badge} ${c.nome}: ${c.desc}. Cadastre-se agora e ganhe ${c.pontos} KD Points (equivalente a R$${(c.pontos / 100).toFixed(2).replace('.', ',')}) para usar na primeira compra.`,
      badge: c.badge,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. PLRESPINNER — reescreve conteúdo PLR para ficar original (evita Google penalty)
// ─────────────────────────────────────────────────────────────────────────────
export interface PLRSpinnerInput_v10 {
  textoOriginal: string
  nicho: string
  tom?: 'profissional' | 'conversacional' | 'autoritativo'
}
export interface PLRSpinnerOutput_v10 {
  versaoOriginal: string
  versaoReescrita: string
  titulosAlternativos: string[]
  melhorias: string[]
  seoTips: string[]
}
export async function plrspinner(input: PLRSpinnerInput_v10, ctx: AgentContext): Promise<AgentResult<PLRSpinnerOutput_v10>> {
  const { textoOriginal, nicho, tom = 'conversacional' } = input
  const paragrafos = textoOriginal.split(/\n\n+/).filter(p => p.trim().length > 20)
  const reescrito = paragrafos.map((p, i) => {
    const substituicoes = [
      { de: /hoje em dia/gi, para: 'em 2026' },
      { de: /muitas pessoas/gi, para: 'milhares de brasileiros' },
      { de: /é importante/gi, para: 'faz TODA a diferença' },
      { de: /você precisa/gi, para: 'você PRECISA' },
      { de: /neste artigo/gi, para: 'nesse conteúdo exclusivo' },
      { de: /no mercado/gi, para: `no mercado de ${nicho}` },
      { de: /dicas/gi, para: 'estratégias testadas' },
    ]
    let novo = p
    for (const s of substituicoes) novo = novo.replace(s.de, s.para)
    // Adiciona frases de abertura/fechamento
    if (i === 0) novo = `Se você atua com ${nicho} em 2026, existe uma verdade que ninguém te conta:\n\n${novo}`
    if (i === paragrafos.length - 1) novo = `${novo}\n\nE uma última coisa: se você aplicar o que eu te falei aqui nos próximos 7 dias, você vai se surpreender com o resultado.`
    return novo
  }).join('\n\n')
  const primeiraLinha = textoOriginal.split('\n')[0]?.slice(0, 60) || nicho
  return {
    ok: true,
    data: {
      versaoOriginal: textoOriginal,
      versaoReescrita: reescrito,
      titulosAlternativos: [
        `Guia Completo de ${nicho} em 2026 (atualizado)`,
        `${primeiraLinha} — o que ninguém te conta`,
        `7 verdades sobre ${nicho} que só quem atua sabe`,
        `[2026] ${nicho}: do zero ao resultado em 30 dias`,
        `O guia definitivo de ${nicho} para brasileiros`,
      ],
      melhorias: [
        'Adicione exemplos práticos do mercado brasileiro (dados do IBGE, Sebrae, etc)',
        'Inclua números e estatísticas atualizadas (2025/2026)',
        'Adicione uma experiência/opinião pessoal para dar originalidade',
        'Insira imagens/diagramas originais (use Canva ou screenshots seus)',
        'Crie uma introdução com uma história pessoal (relato real)',
        'Adicione uma FAQ com 5-8 perguntas no final do artigo',
        'Inclua links internos para outros posts/produtos da KIYVO',
        'Adicione um CTA no final (produto, newsletter ou grupo de WhatsApp)',
      ],
      seoTips: [
        'Use a palavra-chave principal no primeiro parágrafo e na URL',
        'Crie H2 com perguntas (ex: "Como começar com X?")',
        'Adicione meta description entre 120-155 caracteres',
        'Imagens com alt-text descritivo',
        'URL curta (4-5 palavras)',
        'Artigo com 1500+ palavras ranqueia melhor no Google',
        'Marque schema.org/Article ou BlogPosting',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. LAUNCHECKLIST30D — checklist de lançamento de produto digital em 30 dias
// ─────────────────────────────────────────────────────────────────────────────
export interface LaunchChecklist30Input {
  produto: string
  preco: number
  dataLancamento?: string
  listaEmails?: number
  seguidores?: number
}
export interface LaunchChecklist30Output {
  resumo: { produto: string; preco: number; dataLancamento: string; diasRestantes: number; faturamentoEstimado: number }
  dias: Array<{ dia: number; tarefas: string[]; fase: string }>
  diaLancamento: string[]
  posLancamento: string[]
  metricasMeta: { conversao: string; vendas: number; faturamento: number }
}
export async function launchecklist30d(input: LaunchChecklist30Input, ctx: AgentContext): Promise<AgentResult<LaunchChecklist30Output>> {
  const { produto, preco, listaEmails = 100, seguidores = 500 } = input
  const dataL = input.dataLancamento || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  const diasRestantes = Math.ceil((new Date(dataL).getTime() - Date.now()) / (1000 * 3600 * 24))
  const vendasEst = Math.floor(listaEmails * 0.03 + seguidores * 0.005) + 20
  const faturamentoEst = vendasEst * preco
  const dias: LaunchChecklist30Output['dias'] = []
  const tarefasPorDia: Array<{ fase: string; tarefas: string[] }> = [
    { fase: 'Preparação', tarefas: ['Definir promessa principal (1 frase)', 'Criar estrutura do produto (módulos/aulas)', 'Definir preço e possibilidade de parcelamento', 'Registrar/verificar produto na KIYVO'] },
    { fase: 'Preparação', tarefas: ['Gravar/criar 20% do produto (módulo 1)', 'Criar página de captura para lead magnet', 'Definir persona (nome, idade, dor, objeção)'] },
    { fase: 'Preparação', tarefas: ['Criar lead magnet (checklist/ebook)', 'Escrever headline da página de vendas', 'Escolher cores e identidade visual'] },
    { fase: 'Pré-lançamento', tarefas: ['Criar perfil Instagram/TikTok/YouTube se não tiver', 'Postar 3 conteúdos sobre a dor do público', 'Configurar lista de email (Mailchimp/ConvertKit/Resend)'] },
    { fase: 'Pré-lançamento', tarefas: ['Abrir lista de espera (landing page)', 'Postar 3x mais conteúdos', 'Começar a aquecer WhatsApp'] },
    { fase: 'Pré-lançamento', tarefas: ['Criar o restante do produto (até 80%)', 'Gravar vídeo de vendas (VSL) 8-12min', 'Gravar/receber 3 depoimentos'] },
    { fase: 'Pré-lançamento', tarefas: ['Finalizar página de vendas com headline + bullets + prova social', 'Configurar checkout na KIYVO', 'Configurar KD Points e cupom de lançamento'] },
    { fase: 'Pré-lançamento', tarefas: ['Escrever 7 emails de aquecimento', 'Criar 10 posts para Instagram/Reels', 'Testar fluxo completo de compra (cartão + PIX)'] },
    { fase: 'Aquecimento', tarefas: ['Começa contagem regressiva (D-7)', 'Enviar email 1: problema + identificação', 'Postar 1 reel por dia'] },
    { fase: 'Aquecimento', tarefas: ['Email 2: mais dor + agitação', 'Fazer live nos stories respondendo dúvidas', 'Mostrar bastidores'] },
    { fase: 'Aquecimento', tarefas: ['Email 3: revelação do produto (sem preço)', 'Postar carrossel "o que está por vir"', 'Oferecer VIP/desconto para os primeiros'] },
    { fase: 'Aquecimento', tarefas: ['Email 4: prova social + caso de sucesso', 'Depoimento em vídeo', 'Revelar preço "vazado"'] },
    { fase: 'Aquecimento', tarefas: ['Email 5: amanhã abre + condições especiais', 'Criar grupo VIP de WhatsApp', 'Revelar bônus'] },
    { fase: 'Lançamento', tarefas: ['DIA 0 — Abrir carrinho às 20h para VIPs', 'Enviar email: "ABRIU"', 'Post em todas as redes', 'Responder comentários e dúvidas'] },
    { fase: 'Lançamento', tarefas: ['Email 2: prova social da noite anterior', 'Mostrar prints de vendas ("32 pessoas já compraram")', 'Live de lançamento'] },
    { fase: 'Lançamento', tarefas: ['Email 3: objeções', 'Post com FAQ', 'Reels "correria do lançamento"'] },
    { fase: 'Lançamento', tarefas: ['Email 4: mais um depoimento', 'Enviar cupom de desconto para quem abriu mas não comprou', 'Retargeting (Meta/Google)'] },
    { fase: 'Lançamento', tarefas: ['Email 5: ÚLTIMO DIA', 'Contador de urgência', 'Live de encerramento'] },
    { fase: 'Lançamento', tarefas: ['Últimas 6h — Email + WhatsApp + Stories', 'À meia-noite: carrinho FECHA'] },
    { fase: 'Pós-lançamento', tarefas: ['Email de agradecimento', 'Liberação de acesso imediata', 'Boas-vindas aos compradores'] },
    { fase: 'Pós-lançamento', tarefas: ['Pesquisa de satisfação', 'Pedir reviews/depoimentos', 'Coletar dúvidas para próxima edição'] },
    { fase: 'Pós-lançamento', tarefas: ['Enviar bônus prometidos', 'Adicionar compradores ao grupo/membros', 'Começar suporte ativo'] },
    { fase: 'Pós-lançamento', tarefas: ['Aplicar KD Points para compradores', 'Calcular ROI da campanha', 'Planejar próximo lançamento'] },
  ]
  tarefasPorDia.forEach((t, i) => dias.push({ dia: Math.max(0, diasRestantes) + i + 1 - 30, tarefas: t.tarefas, fase: t.fase }))
  return {
    ok: true,
    data: {
      resumo: { produto, preco, dataLancamento: dataL, diasRestantes, faturamentoEstimado: faturamentoEst },
      dias,
      diaLancamento: [
        'Acorde cedo — o dia será longo',
        'Responda TODOS os comentários e DMs em até 15min',
        'Envie emails conforme horário programado (não mude na hora)',
        'Tenha um apoio/sócio para responder WhatsApp e comentários',
        'Beba água — você vai falar muito',
        'Faça uma live à noite para responder dúvidas ao vivo',
        'Não abaixe o preço na hora — mantenha a palavra',
        'Comemore cada venda publicamente (stories) — isso cria prova social',
      ],
      posLancamento: [
        'Envie email de agradecimento com bônus em até 1h',
        'Entregue o que prometeu — sem desculpas',
        'Comece o suporte antes que as dúvidas apareçam',
        'Peça depoimentos em 7 dias (quando o cliente já aplicou algo)',
        'Mapeie objeções que surgiram para próxima página de vendas',
        'Calcule ROI e anote o que funcionou e o que não funcionou',
        'Não feche o carrinho completamente — mantenha um evergreen com preço mais alto',
      ],
      metricasMeta: { conversao: '2-5% (lista aquecida)', vendas: vendasEst, faturamento: faturamentoEst },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. VSLGENERATOR — Video Sales Letter script (8-12 minutos) com alta conversão
// ─────────────────────────────────────────────────────────────────────────────
export interface VSLInput_v10 {
  produto: string
  preco: number
  nicho: string
  publico: string
  promessa: string
}
export interface VSLOutput_v10 {
  titulo: string
  duracao: string
  slides: Array<{ tempo: string; slide: string; narracao: string; tipo: string }>
  cenas: string[]
  callToAction: string
}
export async function vslgenerator(input: VSLInput_v10, ctx: AgentContext): Promise<AgentResult<VSLOutput_v10>> {
  const { produto, preco, nicho, publico, promessa } = input
  return {
    ok: true,
    data: {
      titulo: `VSL: ${produto} — ${promessa}`,
      duracao: '10:30',
      slides: [
        { tempo: '0:00-0:30', slide: 'Texto preto com letra branca: "DESLIGA O CELULAR E FECHA AS ABAS"', narracao: 'Antes de qualquer coisa: desliga o celular, fecha as outras abas do navegador, e presta atenção nos próximos 10 minutos. Porque o que eu vou te revelar nos próximos minutos pode mudar completamente seus resultados em ' + nicho + '.', tipo: 'pattern_interrupt' },
        { tempo: '0:30-1:30', slide: 'Título grande: "AVISO: esse vídeo sai do ar em 24h"', narracao: 'Esse vídeo não vai ficar no ar para sempre. Ele foi feito exclusivamente para quem está cansado de promessas falsas em ' + nicho + '. Se você ficar até o final, eu vou te entregar algo que pode transformar seus resultados nas próximas semanas.', tipo: 'aviso' },
        { tempo: '1:30-3:00', slide: 'Sua dor/dificuldade', narracao: 'Eu sei exatamente como é... Você tenta, tenta, e parece que nunca sai do lugar em ' + nicho + '. Compra curso atrás de curso, consome conteúdo gratuito por horas, e mesmo assim o resultado não vem. E o pior: você começa a duvidar de si mesmo. Será que eu sou capaz? A resposta é SIM — só falta o método certo.', tipo: 'problema' },
        { tempo: '3:00-4:30', slide: 'Sua história pessoal ("eu também")', narracao: 'Eu também já estive exatamente onde você está. Em 2023, eu tinha R$0 na conta e passava 12h por dia tentando fazer dar certo em ' + nicho + '. Até que um dia eu descobri um padrão — algo que quem tem resultado em ' + nicho + ' faz, mas ninguém conta.', tipo: 'historia' },
        { tempo: '4:30-6:00', slide: 'A nova oportunidade/o método', narracao: `Foi aí que eu criei o ${produto}. Um método estruturado que já ajudou mais de 5.000 ${publico} a conseguirem ${promessa} — sem enrolação, sem curso de 80 horas, sem precisar investir em anúncios caros.`, tipo: 'solucao' },
        { tempo: '6:00-7:30', slide: 'Prova social (depoimentos, números)', narracao: 'Não sou eu quem está falando. São mais de 5.000 pessoas que aplicaram e tiveram resultado. João de São Paulo saiu do zero a R$15k em 60 dias. Maria de Belo Horizonte tinha 47 anos e largou o emprego em 3 meses. E por aí vai.', tipo: 'prova_social' },
        { tempo: '7:30-8:30', slide: 'Oferta + preço + bônus', narracao: `E hoje, exclusivamente para você que assistiu até aqui, você pode ter acesso ao ${produto} por apenas R$${preco.toFixed(2)} à vista. E como bônus, você recebe ainda: Bônus 1 (R$297), Bônus 2 (R$497) e o grupo VIP (R$997). Tudo junto, só hoje.`, tipo: 'oferta' },
        { tempo: '8:30-9:30', slide: 'Garantia de 7 dias', narracao: 'E tem mais: garantia incondicional de 7 dias. Se em 7 dias você aplicar o método e não gostar, devolvemos 100% do seu dinheiro — sem perguntas, sem burocracia. O risco é todo MEU.', tipo: 'garantia' },
        { tempo: '9:30-10:30', slide: 'CTA final com botão grande', narracao: `Clica no botão amarelo abaixo desse vídeo agora e garante seu acesso ao ${produto} com desconto de lançamento. Essa oferta sai do ar em 24h e o preço vai subir. Clica no botão e te vejo dentro.`, tipo: 'cta' },
      ],
      cenas: [
        'Começa olhando DIRETO para câmera (sem cortes, sem música alta)',
        'No pattern interrupt: tom de voz firme, pausado',
        'Na dor: expressão verdadeira, quase emocionada',
        'Na história: pessoal, vulnerável (não perfeito)',
        'Na solução: energia sobe, olho brilha',
        'Na oferta: tom calmo, confiante, não desesperado',
        'Na garantia: gesto com a mão "sem pegadinha"',
        'No CTA: aponta para o botão, reforça escassez REAL',
      ],
      callToAction: `Clica no botão amarelo abaixo e garanta ${produto} por R$${preco.toFixed(2)} com 7 dias de garantia incondicional.`,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. CHURNREDUCE — campanhas para reduzir cancelamento de assinatura
// ─────────────────────────────────────────────────────────────────────────────
export interface ChurnReduceInput_v10 {
  produto: string
  precoMensal: number
  publico: string
}
export interface ChurnReduceOutput_v10 {
  emailAntesCancelar: Array<{ assunto: string; corpo: string }>
  fluxoCancelamento: { paginas: Array<{ titulo: string; ofertas: string[] }>; botaoCancelar: string }
  winback: Array<{ assunto: string; corpo: string; desconto: string }>
  metricas: { reducaoEstimada: string; custo: string }
}
export async function churnreduce(input: ChurnReduceInput_v10, ctx: AgentContext): Promise<AgentResult<ChurnReduceOutput_v10>> {
  const { produto, precoMensal, publico } = input
  return {
    ok: true,
    data: {
      emailAntesCancelar: [
        { assunto: '[NOME], notamos que você está usando menos o ' + produto, corpo: `Olá [NOME]! Faz 14 dias que você não acessa o ${produto}. Notamos isso porque nos importamos com a sua experiência.\n\nExiste algo que podemos te ajudar? Alguma dúvida? Se precisar, nosso time está respondendo em até 1h por WhatsApp.\n\nQuer continuar? Posso te oferecer um mês grátis para você voltar com tudo — é só responder esse email.` },
        { assunto: 'Seu plano será renovado em 3 dias', corpo: `Olá! A renovação do ${produto} (R$${precoMensal.toFixed(2)}/mês) vai acontecer em 3 dias.\n\nAntes de renovar: você está tendo resultado? Se NÃO, temos algumas novidades que podem ajudar. Se SIM, pode ignorar esse email 😊\n\nPara qualquer coisa, é só responder.` },
      ],
      fluxoCancelamento: {
        paginas: [
          { titulo: 'Tem certeza que quer cancelar?', ofertas: ['Pausar por 30 dias em vez de cancelar', 'Trocar para plano mais barato', 'Conversar com suporte 1:1 (2 minutos)'] },
          { titulo: 'Qual o motivo do cancelamento?', ofertas: [] },
          { titulo: 'Temos uma oferta especial para você ficar', ofertas: [`30% de desconto por 3 meses (R$${(precoMensal * 0.7).toFixed(2)}/mês)`, '1 mês grátis se você ficar', 'Bônus exclusivo (valor R$197) liberado HOJE se continuar'] },
          { titulo: 'Confirmação final', ofertas: [] },
        ],
        botaoCancelar: 'Cancelar mesmo assim (sem retorno)',
      },
      winback: [
        { assunto: 'Sentimos sua falta 💙', corpo: `Olá [NOME]! Já faz 30 dias que você cancelou o ${produto}.\n\nNesse tempo atualizamos [X] coisas e adicionamos [Y] funcionalidades que ${publico} como você vinham pedindo.\n\nQuer voltar? Estamos te dando 50% OFF no primeiro mês de volta — só R$${(precoMensal * 0.5).toFixed(2)}.`, desconto: '50% OFF' },
        { assunto: 'Seu desconto expira em 48h', corpo: 'Seu cupom de 50% OFF para voltar para o ' + produto + ' expira em 48h. Quer aproveitar?', desconto: '50% OFF' },
        { assunto: 'Última chance', corpo: 'Essa é a última mensagem. Se quiser voltar, o desconto fica mais uma vez aqui para você. Depois disso, o preço volta ao normal.', desconto: '50% OFF' },
      ],
      metricas: { reducaoEstimada: '15-30% de redução no churn', custo: 'R$0 para a KIYVO — apenas implementar os fluxos' },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. WEBHOOKTEST — gera exemplos de payloads e testa fluxos de webhook (Stripe/Supabase)
// ─────────────────────────────────────────────────────────────────────────────
export interface WebhookTestInput_v10 {
  evento: 'checkout.completed' | 'subscription.created' | 'invoice.paid' | 'payment.failed' | 'refund.created' | 'payout.paid'
  valor?: number
  produto?: string
}
export interface WebhookTestOutput_v10 {
  payload: Record<string, unknown>
  acoesEsperadas: string[]
  testes: string[]
}
export async function webhooktest(input: WebhookTestInput_v10, ctx: AgentContext): Promise<AgentResult<WebhookTestOutput_v10>> {
  const { evento, valor = 97, produto = 'produto-teste' } = input
  const payloads: Record<string, Record<string, unknown>> = {
    'checkout.completed': {
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      apiVersion: '2026-06-24.dahlia',
      data: { object: { id: 'cs_test_123', payment_status: 'paid', amount_total: valor * 100, currency: 'brl', customer_email: 'teste@kiyvo.com.br', metadata: { product_id: produto, user_id: 'test-user', kd_points: '485' } } },
    },
    'subscription.created': {
      id: 'evt_test_' + Date.now(),
      type: 'customer.subscription.created',
      data: { object: { id: 'sub_test', status: 'active', customer: 'cus_test', items: { data: [{ price: { id: 'price_plus_1990' } }] }, current_period_end: Date.now() / 1000 + 30 * 86400 } },
    },
    'invoice.paid': {
      id: 'evt_test_' + Date.now(),
      type: 'invoice.paid',
      data: { object: { id: 'in_test', amount_paid: valor * 100, currency: 'brl', customer_email: 'teste@kiyvo.com.br', payment_intent: 'pi_test' } },
    },
    'payment.failed': {
      id: 'evt_test_' + Date.now(),
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_test', customer_email: 'teste@kiyvo.com.br', amount_due: valor * 100, next_payment_attempt: Date.now() / 1000 + 3 * 86400 } },
    },
    'refund.created': {
      id: 'evt_test_' + Date.now(),
      type: 'charge.refunded',
      data: { object: { id: 'ch_test', amount_refunded: valor * 100, metadata: { order_id: 'ord_test' } } },
    },
    'payout.paid': {
      id: 'evt_test_' + Date.now(),
      type: 'payout.paid',
      data: { object: { id: 'po_test', amount: valor * 100, currency: 'brl', metadata: { vendor_id: 'vendor_test', withdrawal_id: 'wd_test' } } },
    },
  }
  const acoesPorEvento: Record<string, string[]> = {
    'checkout.completed': ['Dar acesso ao produto', 'Criar ordem no banco', 'Adicionar KD Points (5 por R$1)', 'Enviar email de confirmação', 'Notificar vendedor', 'Adicionar na biblioteca do comprador'],
    'subscription.created': ['Ativar plano do usuário (Plus/Pro/Vendor Pro)', 'Criar registro de subscription no banco', 'Enviar email de boas-vindas', 'Dar acesso a benefícios do plano'],
    'invoice.paid': ['Renovar acesso por mais 30 dias', 'Dar KD Points da mensalidade', 'Enviar nota fiscal/recibo'],
    'payment.failed': ['Notificar usuário (email + WhatsApp)', 'Tentar novamente em 24h', 'Após 3 falhas: cancelar assinatura', 'Oferecer atualização de cartão'],
    'refund.created': ['Revogar acesso ao produto', 'Debitar KD Points ganhos', 'Notificar vendedor', 'Atualizar saldo'],
    'payout.paid': ['Marcar saque como "pago"', 'Notificar vendedor por email/WPP', 'Adicionar transação no extrato'],
  }
  return {
    ok: true,
    data: {
      payload: payloads[evento],
      acoesEsperadas: acoesPorEvento[evento],
      testes: [
        'Teste no ambiente Stripe Test antes de produção',
        'Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook',
        'Dispare o evento: stripe trigger ' + evento,
        'Verifique logs do Supabase para confirmar trigger SQL',
        'Confirme que email de confirmação foi enviado (usar Ethereal/Mailhog em dev)',
        'Confirme que KD Points foram adicionados corretamente',
        'Verifique que webhook retorna 200 em menos de 3 segundos',
        'Adicione tratamento de idempotência (Stripe pode enviar o mesmo evento 2x)',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. BOLSADEAPOSTAS — calculadora de bolsa de apostas/Dutching (nicho alto valor)
// (Agente para nicho de apostas/probabilidades — um dos mercados que mais cresce)
// ─────────────────────────────────────────────────────────────────────────────
export interface DutchingInput_v10 {
  odds: number[]
  valorTotal: number
}
export interface DutchingOutput_v10 {
  valoresApostar: number[]
  lucroGarantido: number
  roi: string
  recomendacao: string
}
export async function bolsadeapostas(input: DutchingInput_v10, ctx: AgentContext): Promise<AgentResult<DutchingOutput_v10>> {
  const { odds, valorTotal } = input
  const inv = odds.map(o => 1 / o)
  const soma = inv.reduce((a, b) => a + b, 0)
  const valores = inv.map(x => (x / soma) * valorTotal)
  const retorno = valores[0] * odds[0]
  const lucro = retorno - valorTotal
  return {
    ok: true,
    data: {
      valoresApostar: valores.map(v => Math.round(v * 100) / 100),
      lucroGarantido: Math.round(lucro * 100) / 100,
      roi: `${((lucro / valorTotal) * 100).toFixed(2)}%`,
      recomendacao: soma < 1 ? '✅ OPORTUNIDADE DE ARBITRAGEM! Soma das probabilidades < 100% — lucro garantido independente do resultado.' : '❌ Soma das probabilidades > 100% — sem arbitragem garantida. Use apenas se tiver uma vantagem/edge estatística.',
    },
  }
}
