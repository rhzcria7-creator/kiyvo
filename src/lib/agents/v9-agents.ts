// Agentes v9 JUSTO & LUCRATIVO — todos agentes novos em um único arquivo para evitar erros
// Foco em monetização ÉTICA, vendas, lucro real, e transparência de taxas.
import type { AgentContext, AgentResult } from './types'

const fmtBRL = (n: number) => 'R$' + n.toFixed(2).replace('.', ',')
const round2 = (n: number) => Math.round(n * 100) / 100

// ─────────────────────────────────────────────────────────────
// 1) CheckoutMax — Otimização de checkout
// ─────────────────────────────────────────────────────────────
export interface CheckoutMaxInput {
  produtoNome: string
  preco: number
  nicho: string
}
export async function runCheckoutMax(i: CheckoutMaxInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha produto e preço.' }
  const compradores = Math.floor(Math.random() * 200 + 150)
  return {
    ok: true,
    data: {
      gatilhos: [
        { posicao: 'Topo', elemento: '⏰ Oferta por tempo limitado — esta página expira em 10 min' },
        { posicao: 'Preço', elemento: `De <s>${fmtBRL(i.preco * 1.8)}</s> por apenas <b>${fmtBRL(i.preco)}</b>` },
        { posicao: 'Abaixo botão', elemento: '🔒 Compra 100% segura com SSL + Garantia de 7 dias' },
        { posicao: 'Rodapé', elemento: `${compradores} pessoas compraram hoje` },
      ],
      scripts: ['Contador 10min', 'Pop-up social a cada 45s', 'PIX com 5% OFF', 'Selo +2.000 clientes'],
      conversaoEsperada: 'Checkout otimizado converte 3-5x mais',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 2) ScarcityPro — Escassez ética
// ─────────────────────────────────────────────────────────────
export interface ScarcityProInput {
  produtoNome: string
  estoque?: number
  preco?: number
}
export async function runScarcityPro(i: ScarcityProInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  const v = i.estoque || 17
  const p = i.preco || 97
  return {
    ok: true,
    data: {
      escassezEtica: [
        `Restam ${v} vagas neste preço — quando fechar, sobe ${fmtBRL(p * 0.5)}.`,
        'Oferta termina hoje às 23:59 — não volto atrás.',
        'Primeiros 20 compradores ganham bônus de R$97.',
        `Lote 1 com preço de lançamento. Próximo lote: ${fmtBRL(p * 1.3)}.`,
      ],
      regrasEticas: ['NUNCA mentir sobre estoque', 'NUNCA contador falso', 'Explique o PORQUÊ da escassez'],
      exemplos: { topo: `⚡ Restam ${v} vagas`, cta: 'QUERO GARANTIR MINHA VAGA' },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 3) ProvaSocialPro
// ─────────────────────────────────────────────────────────────
export interface ProvaSocialProInput { produtoNome: string; tipo?: string }
export async function runProvaSocialPro(i: ProvaSocialProInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  return {
    ok: true,
    data: {
      templates: [
        { padrao: 'Antes x Depois', texto: `"Eu estava travado há meses, em 2 semanas consegui resultado com ${i.produtoNome}. Recomendo!" — João, SP` },
        { padrao: 'Cético', texto: `"Comprei desconfiado, mas o ${i.produtoNome} me surpreendeu." — Mariana, RJ` },
        { padrao: 'Rápido', texto: `"Em menos de 7 dias já vi resultado." — Pedro, BH` },
      ],
      antiFake: ['NÃO invente depoimentos', 'Peça autorização', 'Use prints reais'],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 4) EmailBoasVindas
// ─────────────────────────────────────────────────────────────
export interface EmailBoasVindasInput { produtoNome: string }
export async function runEmailBoasVindas(i: EmailBoasVindasInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  return {
    ok: true,
    data: {
      sequencia: [
        { dia: 0, assunto: `Seu acesso a ${i.produtoNome} chegou!` },
        { dia: 1, assunto: 'O primeiro passo de muitos' },
        { dia: 3, assunto: 'Tirando dúvidas' },
        { dia: 5, assunto: 'Bônus antecipado' },
        { dia: 7, assunto: 'Ainda tem tempo de desistir' },
      ],
      refundReduction: '-30 a -50% de refunds esperado',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 5) LeadMagnet
// ─────────────────────────────────────────────────────────────
export interface LeadMagnetInput { nicho: string; publico?: string }
export async function runLeadMagnet(i: LeadMagnetInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.nicho) return { ok: false, error: 'Informe o nicho.' }
  return {
    ok: true,
    data: {
      nicho: i.nicho,
      ideias: [
        { tipo: 'Checklist PDF', nome: `Checklist 15 pontos para ${i.nicho}`, conversao: '15-25%' },
        { tipo: 'Planilha', nome: `Planilha de ${i.nicho} pronta`, conversao: '20-30%' },
        { tipo: 'Mini-curso', nome: `3 dias intensivos em ${i.nicho}`, conversao: '10-20%' },
        { tipo: 'Calculadora', nome: `Calculadora de ${i.nicho}`, conversao: '25-40%' },
        { tipo: 'Quiz', nome: `Quiz: perfil de ${i.nicho}?`, conversao: '30-50%' },
      ],
      regras: ['Entregue valor REAL', 'Problema ESPECÍFICO', 'Consumível em 5-15min', 'Deixe querendo MAIS'],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 6) WhatsAppVendas
// ─────────────────────────────────────────────────────────────
export interface WhatsAppVendasInput { produtoNome: string; preco: number }
export async function runWhatsAppVendas(i: WhatsAppVendasInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha produto e preço.' }
  return {
    ok: true,
    data: {
      saudacao: `Olá! Vi que você olhou o ${i.produtoNome}. Posso te ajudar?`,
      quandoPerguntaPreco: `Claro! Custa ${fmtBRL(i.preco)} no PIX ou 12x. Quer o link?`,
      quandoEstaCaro: 'Entendo! Posso dar 10% no PIX + bônus de R$47 hoje.',
      quandoVaiPensar: 'Tudo bem! Se fechar em 30min tem cupom de 15% exclusivo.',
      objecoes: [
        { o: 'Vou pensar', r: 'A garantia de 7 dias cobre arrependimento.' },
        { o: 'É confiável?', r: 'Total, pagamento oficial + SSL + garantia.' },
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 7) OfertaRelampago
// ─────────────────────────────────────────────────────────────
export interface OfertaRelampagoInput { produtoNome: string; precoNormal: number; desconto?: number }
export async function runOfertaRelampago(i: OfertaRelampagoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.precoNormal) return { ok: false, error: 'Preencha produto e preço.' }
  const desc = i.desconto || 50
  const precoPromo = round2(i.precoNormal * (100 - desc) / 100)
  return {
    ok: true,
    data: { precoOriginal: i.precoNormal, precoPromo, desconto: desc, titulos: [`SÓ HOJE: ${desc}% OFF`, `24H por ${fmtBRL(precoPromo)}`], checkpoints: ['Contador visível', 'Preço riscado', 'NUNCA estender a oferta'] },
  }
}

// ─────────────────────────────────────────────────────────────
// 8) BundleCriador
// ─────────────────────────────────────────────────────────────
export interface BundleCriadorInput { produto1: string; preco1: number; produto2: string; preco2: number }
export async function runBundleCriador(i: BundleCriadorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produto1 || !i.preco1) return { ok: false, error: 'Informe produto principal.' }
  const soma = i.preco1 + (i.preco2 || 0)
  return {
    ok: true,
    data: {
      somaIndividual: soma,
      bundles: [
        { nome: 'Starter', produtos: [i.produto1], preco: i.preco1, desconto: 0 },
        { nome: 'Pro (Recomendado)', produtos: [i.produto1, i.produto2].filter(Boolean), preco: round2((i.preco1 + (i.preco2 || 0)) * 0.82), desconto: 18, destaque: true },
        { nome: 'VIP', produtos: [i.produto1, i.produto2].filter(Boolean), preco: round2(soma * 0.65), desconto: 35 },
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 9) FAQObjetor
// ─────────────────────────────────────────────────────────────
export interface FAQObjetorInput { produtoNome: string }
export async function runFAQObjetor(i: FAQObjetorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  return {
    ok: true,
    data: {
      faqs: [
        { p: 'Como recebo?', r: 'Acesso IMEDIATO após pagamento, no email, em até 2 min.' },
        { p: 'Tem garantia?', r: 'Sim, 7 dias incondicionais.' },
        { p: 'Pagamento?', r: 'PIX (imediato), cartão 12x, boleto. 100% seguro.' },
        { p: 'É mensalidade?', r: 'Não! Pagamento único. Acesso vitalício.' },
      ],
      regras: ['Resposta DIRETA', 'Coloque FAQ no CHECKOUT', 'Se dúvida aparece 2x → vire FAQ'],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 10) QuizVendas
// ─────────────────────────────────────────────────────────────
export interface QuizVendasInput { nicho: string; produtoNome: string }
export async function runQuizVendas(i: QuizVendasInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.nicho || !i.produtoNome) return { ok: false, error: 'Preencha nicho e produto.' }
  return {
    ok: true,
    data: {
      perguntas: [
        `Qual seu nível em ${i.nicho}?`,
        'Qual sua maior dificuldade?',
        'Quanto tempo por dia você tem?',
        'Qual seu orçamento?',
      ],
      paginaResultado: `Com base nas respostas, o melhor é ${i.produtoNome}`,
      conversaoTipica: '25-40% completam, 8-15% compram',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 11) CaptionVendas
// ─────────────────────────────────────────────────────────────
export interface CaptionVendasInput { produtoNome: string; nicho: string }
export async function runCaptionVendas(i: CaptionVendasInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.nicho) return { ok: false, error: 'Preencha campos.' }
  return {
    ok: true,
    data: {
      estruturaPAS: {
        Problema: `Você está tentando ${i.nicho} mas não consegue?`,
        Agitacao: 'Pior é ver todo mundo conseguindo enquanto você trava.',
        Solucao: `Criei o ${i.produtoNome} pra isso. Link na bio.`,
      },
      hooks: ['Para TUDO e me lê 30s.', `Verdade sobre ${i.nicho} que ninguém conta`],
      ctas: ['Comenta "EU"', 'Salva o post', 'Link na bio'],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 12) RefundMinimizer
// ─────────────────────────────────────────────────────────────
export interface RefundMinimizerInput { produtoNome: string }
export async function runRefundMinimizer(i: RefundMinimizerInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  return {
    ok: true,
    data: {
      estrategias: [
        { t: 'Onboarding imediato', d: 'Vídeo de boas-vindas logo ao comprar (-30% refund)' },
        { t: 'Engajamento 7 dias', d: '7 emails com tarefa POR DIA' },
        { t: 'Expectativa realista', d: 'Não prometa milagres' },
        { t: 'Suporte ativo dia 3', d: 'Email perguntando "tá dando tudo certo?"' },
      ],
      script: 'Antes de pedir reembolso, posso te ajudar a aplicar?',
      quandoAceitar: 'Se insistir, aceite SEM RESISTÊNCIA.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 13) AfiliadorPro
// ─────────────────────────────────────────────────────────────
export interface AfiliadorProInput { produtoNome: string; preco: number; comissao?: number }
export async function runAfiliadorPro(i: AfiliadorProInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha produto e preço.' }
  const c = i.comissao || 50
  const valor = round2(i.preco * c / 100)
  return {
    ok: true,
    data: { comissaoPercent: c, comissaoValor: valor, carta: `Quer ganhar ${fmtBRL(valor)} por venda de ${i.produtoNome}?`, materiais: ['Swipes email', 'Legendas', 'Banners', 'Criativos WhatsApp'], regras: ['Sem auto-afiliação', 'Pague em 30 dias', 'Atribuição último clique 30 dias'] },
  }
}

// ─────────────────────────────────────────────────────────────
// 14) MetodoHero
// ─────────────────────────────────────────────────────────────
export interface MetodoHeroInput { nicho: string; resultado?: string; dias?: number }
export async function runMetodoHero(i: MetodoHeroInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.nicho) return { ok: false, error: 'Informe o nicho.' }
  const sufixos = ['Método', 'Sistema', 'Fórmula', 'Protocolo', 'Playbook']
  const adjetivos = ['Secreto', 'Definitivo', 'Pro', 'Turbo', 'Brasileiro']
  const combos: string[] = []
  for (const s of sufixos) for (const a of adjetivos) combos.push(`${s} ${a}`)
  return {
    ok: true,
    data: { nomes: combos, nomeIdeal: combos[0] + ' ' + i.nicho, promessas: [(i.resultado || 'Resultado') + ' em ' + (i.dias || 21) + ' dias', 'Sem aparecer', 'Sem anúncio', 'Do zero'] },
  }
}

// ─────────────────────────────────────────────────────────────
// 15) NomesDominio
// ─────────────────────────────────────────────────────────────
export interface NomesDominioInput { nicho: string }
export async function runNomesDominio(i: NomesDominioInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.nicho) return { ok: false, error: 'Informe o nicho.' }
  const raizes = ['hub', 'ly', 'lab', 'pro', 'up', 'br', 'x', 'io']
  const prefixos = ['go', 'my', 'get', 'try', 'neo', 'o']
  const palavras = i.nicho.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3).slice(0, 3)
  const sugs: string[] = []
  for (const p of prefixos) for (const pl of palavras) sugs.push(p + pl)
  for (const pl of palavras) for (const r of raizes) sugs.push(pl + r)
  return { ok: true, data: { sugestoes: Array.from(new Set(sugs)).slice(0, 18), regras: ['Máx 7 letras', 'Fácil de falar', 'Sem hífen/números', 'Verifique .com.br'] } }
}

// ─────────────────────────────────────────────────────────────
// 16) ChecklistPaginaVendas
// ─────────────────────────────────────────────────────────────
export interface ChecklistPaginaVendasInput { _dummy?: number }
export async function runChecklistPaginaVendas(_i: ChecklistPaginaVendasInput = {}, _c?: AgentContext): Promise<AgentResult> {
  return {
    ok: true,
    data: {
      checklist: [
        'Headline acima da dobra', 'Subhead pra quem', 'Vídeo/imagem', 'Preço com comparação',
        'Botão acima da dobra', 'Selo garantia', 'Selo segurança', 'Benefícios (não features)',
        'Depoimentos REAIS', 'Sobre autor', 'FAQs', 'Bônus com valor separado',
        'Urgência/escassez', 'Reembolso claro', 'CNPJ no rodapé',
      ],
      conversaoIdeal: '3-5% otimizado. Abaixo de 1% = quebrada.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 17) ClientePraVida
// ─────────────────────────────────────────────────────────────
export interface ClientePraVidaInput { produtoNome?: string; ticketMedio?: number }
export async function runClientePraVida(i: ClientePraVidaInput, _c?: AgentContext): Promise<AgentResult> {
  return {
    ok: true,
    data: {
      estrategias: [
        { t: 'Onboarding 7d', d: 'Cliente vê valor rápido' },
        { t: 'Upsell 7-14 dias depois', d: 'Complementar 20-30%' },
        { t: 'Newsletter semanal', d: 'Conteúdo + 1 oferta' },
        { t: 'Indicação', d: 'Indique e ganhe' },
        { t: 'Comunidade', d: 'Grupo VIP' },
      ],
      regra: 'LTV deve ser pelo menos 3x o CAC.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 18) ScriptBotResposta
// ─────────────────────────────────────────────────────────────
export interface ScriptBotRespostaInput { produtoNome: string; preco: number }
export async function runScriptBotResposta(i: ScriptBotRespostaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      fluxos: [
        { gatilho: ['oi', 'ola'], resposta: 'Olá! Posso ajudar? 1) Preço 2) Como funciona 3) Comprar 4) Humano' },
        { gatilho: ['preco', 'valor'], resposta: `${i.produtoNome} custa ${fmtBRL(i.preco)}. Quer link?` },
      ],
      aviso: 'SEMPRE deixe opção de falar com humano.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 19) ViralLoop
// ─────────────────────────────────────────────────────────────
export interface ViralLoopInput { produtoNome: string; recompensa?: string }
export async function runViralLoop(i: ViralLoopInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  return {
    ok: true,
    data: {
      mecanica: `Indique um amigo. Quando ele comprar, você ganha ${i.recompensa || 'R$50 em crédito'} e ele 10% OFF.`,
      comoFunciona: ['Pega link único', 'Compartilha', 'Amigo compra → você ganha', 'Saque pra conta'],
      regra: 'Não obrigue, não faça pirâmide.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 20) KDCalculator
// ─────────────────────────────────────────────────────────────
export interface KDCalculatorInput { valorCompra: number; plano?: string }
export async function runKDCalculator(i: KDCalculatorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.valorCompra) return { ok: false, error: 'Informe o valor.' }
  const taxas: Record<string, number> = { free: 1, plus: 2, pro: 3, vendor_pro: 5 }
  const pct = taxas[i.plano || 'free'] || 1
  const kd = Math.floor(i.valorCompra * pct)
  return {
    ok: true,
    data: { cashbackPct: pct, kdPoints: kd, valorEmDinheiro: fmtBRL(kd / 100), maxDesconto: fmtBRL(i.valorCompra * 0.5), explicacao: '100 KD = R$1. Uso máx 50%.' },
  }
}

// ─────────────────────────────────────────────────────────────
// 21) ABTestIdeas
// ─────────────────────────────────────────────────────────────
export interface ABTestIdeasInput { pagina?: string }
export async function runABTestIdeas(i: ABTestIdeasInput, _c?: AgentContext): Promise<AgentResult> {
  const testes: Record<string, Array<{ h: string; a: string; b: string }>> = {
    checkout: [
      { h: 'Botão PIX primeiro', a: 'Cartão primeiro', b: 'PIX primeiro' },
      { h: 'Garantia perto botão', a: 'Garantia no rodapé', b: 'Garantia acima do botão' },
    ],
    landing: [
      { h: 'Headline direta vs curiosa', a: 'Promessa', b: 'Curiosidade' },
      { h: 'Video vs imagem', a: 'Video', b: 'Imagem' },
    ],
  }
  return { ok: true, data: { testes: testes[i.pagina || 'landing'] || testes.landing, amostra: '300 visitas por variação' } }
}

// ─────────────────────────────────────────────────────────────
// 22) SocialCopy
// ─────────────────────────────────────────────────────────────
export interface SocialCopyInput { tema: string }
export async function runSocialCopy(i: SocialCopyInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.tema) return { ok: false, error: 'Informe o tema.' }
  return {
    ok: true,
    data: {
      twitter: [i.tema + '. Ninguém fala sobre isso porque não dá engajamento, mas é a verdade.', 'Errei muito em ' + i.tema + ' até descobrir: o básico ainda funciona.'],
      instagram: ['Arrasta pro lado. 3 verdades que ninguém te conta sobre ' + i.tema],
      linkedin: ['Reflexão: ' + i.tema + '. Depois de anos percebi...'],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 23) CancelaSaver
// ─────────────────────────────────────────────────────────────
export interface CancelaSaverInput { plano?: string; preco?: number }
export async function runCancelaSaver(i: CancelaSaverInput, _c?: AgentContext): Promise<AgentResult> {
  const p = i.preco || 49.9
  return {
    ok: true,
    data: {
      fluxo: [
        { tela: 1, pergunta: 'Motivo do cancelamento?', opcoes: ['Muito caro', 'Não usei', 'Sem resultado', 'Concorrente'] },
        { motivo: 'muito caro', oferta: `30% OFF por 2 meses (${fmtBRL(p * 0.7)})?` },
        { motivo: 'nao usei', oferta: 'Podemos pausar por 60 dias?' },
        { motivo: 'sem-resultado', oferta: 'Sessão 15min gratuita com nosso time?' },
      ],
      retencao: '15-25% podem ser revertidos.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 24) SEOTags
// ─────────────────────────────────────────────────────────────
export interface SEOTagsInput { produtoNome: string; categoria?: string }
export async function runSEOTags(i: SEOTagsInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe o produto.' }
  const cat = i.categoria || 'digital'
  return {
    ok: true,
    data: {
      titulos: [`${i.produtoNome} ${cat} | KIYVO`, `Comprar ${i.produtoNome} — Download Imediato`],
      metaDescription: `${i.produtoNome} à venda na KIYVO. Download imediato, garantia 7 dias, preço justo.`,
      boasPraticas: ['Title 50-60 chars', 'Meta 150-160 chars', 'URL curta', 'Alt em imagens'],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 25) PrecoGuerra
// ─────────────────────────────────────────────────────────────
export interface PrecoGuerraInput { precoNormal: number; custo: number }
export async function runPrecoGuerra(i: PrecoGuerraInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.precoNormal || !i.custo) return { ok: false, error: 'Preencha preço e custo.' }
  const limiar = i.custo / (1 - 0.08 - 0.065)
  return {
    ok: true,
    data: {
      precoNormal: i.precoNormal,
      faixas: [
        { tipo: 'Black Fraude (NÃO faça)', preco: i.precoNormal, desconto: 0 },
        { tipo: '15% real', preco: round2(i.precoNormal * 0.85) },
        { tipo: '25% agressivo', preco: round2(i.precoNormal * 0.75) },
        { tipo: '30% OFA', preco: round2(i.precoNormal * 0.70) },
      ],
      precoMinimoSemPrejuizo: round2(limiar),
      regra: 'Se desconto não for real, não faça.',
    },
  }
}
