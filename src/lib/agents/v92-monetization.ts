// Agentes v9.2 — +12 agentes focados em LUCRO REAL para vendedores e plataforma
import type { AgentContext, AgentResult } from './types'

const fmtBRL = (n: number) => 'R$' + n.toFixed(2).replace('.', ',')
const round2 = (n: number) => Math.round(n * 100) / 100

// Planos KIYVO com taxas reais (Stripe + PIX reais)
const PLAN_TAXES: Record<string, { taxaPlataforma: number; fixa: number; teto: number }> = {
  free:        { taxaPlataforma: 8.0, fixa: 0.50, teto: 50 },
  plus:        { taxaPlataforma: 6.5, fixa: 0.40, teto: 40 },
  pro:         { taxaPlataforma: 5.0, fixa: 0.30, teto: 30 },
  vendor_pro:  { taxaPlataforma: 3.0, fixa: 0.20, teto: 20 },
}
const STRIPE_CARTAO = { pct: 3.99, fixa: 0.40 }
const PIX_TAXA = { pct: 0, fixa: 0 } // PIX é 0% no Stripe BR
const BOLETO = { pct: 0, fixa: 3.00 }

// ─────────────────────────────────────────────────────────────
// 1) CustosReaisVenda — detalha TODOS os custos: plataforma + gateway + impostos
// ─────────────────────────────────────────────────────────────
export interface CustosReaisVendaInput {
  preco: number
  meioPagamento?: 'pix' | 'cartao' | 'boleto'
  parcelas?: number
  planoVendedor?: keyof typeof PLAN_TAXES
  comissaoAfiliado?: number
  custoProduto?: number
  cac?: number // custo por aquisição
}
export async function runCustosReaisVenda(i: CustosReaisVendaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.preco || i.preco <= 0) return { ok: false, error: 'Informe o preço.' }
  const plano = PLAN_TAXES[i.planoVendedor || 'free']
  const mp = i.meioPagamento || 'pix'
  const gateway = mp === 'cartao' ? STRIPE_CARTAO : mp === 'boleto' ? BOLETO : PIX_TAXA
  const parcelas = Math.max(1, i.parcelas || 1)
  // Acréscimo por parcelamento (Stripe tem taxas maiores > 1x)
  const taxaParcelamento = parcelas > 1 ? 0.01 * Math.min(parcelas, 6) : 0
  const taxaGateway = i.preco * ((gateway.pct / 100) + taxaParcelamento) + gateway.fixa

  let taxaKiyvo = i.preco * (plano.taxaPlataforma / 100) + plano.fixa
  if (taxaKiyvo > plano.teto) taxaKiyvo = plano.teto

  const comissao = i.preco * ((i.comissaoAfiliado || 0) / 100)
  const custo = i.custoProduto || 0
  const cac = i.cac || 0
  const taxasTotal = taxaGateway + taxaKiyvo + comissao
  const lucroLiquido = i.preco - taxasTotal - custo - cac
  const margem = (lucroLiquido / i.preco) * 100

  // Recomendação de melhor meio
  const melhorMeio = taxaGateway < 1 ? 'PIX' : 'à vista no cartão'

  return {
    ok: true,
    data: {
      precoVenda: i.preco,
      meioPagamento: mp.toUpperCase(),
      parcelas,
      custos: [
        { nome: 'Taxa Stripe/gateway (' + mp + (parcelas > 1 ? ` ${parcelas}x` : '') + ')', valor: round2(taxaGateway) },
        { nome: `Taxa KIYVO (${plano.taxaPlataforma}% + R$${plano.fixa.toFixed(2).replace('.',',')})`, valor: round2(taxaKiyvo) },
        { nome: 'Comissão afiliado', valor: round2(comissao) },
        { nome: 'Custo do produto', valor: round2(custo) },
        { nome: 'CAC (anúncio)', valor: round2(cac) },
      ],
      taxaGateway: round2(taxaGateway),
      taxaKiyvo: round2(taxaKiyvo),
      totalCustos: round2(taxasTotal + custo + cac),
      lucroLiquido: round2(lucroLiquido),
      margemPercent: round2(margem),
      recomendacao: `Use ${melhorMeio} para maior margem. ${margem >= 40 ? 'Margem saudável ✅' : margem >= 15 ? 'Margem apertada ⚠️' : 'Margem crítica ❌ Aumente preço'}`,
      saude: margem >= 40 ? 'excelente' : margem >= 20 ? 'boa' : margem >= 10 ? 'media' : 'ruim',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 2) CriadorBumpOrder — bump de checkout otimizado
// ─────────────────────────────────────────────────────────────
export interface CriadorBumpInput { produtoNome: string; preco: number }
export async function runCriadorBump(i: CriadorBumpInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha.' }
  const bumpPreco = round2(i.preco * 0.27)
  return {
    ok: true,
    data: {
      precoBump: bumpPreco,
      copy: `✅ SIM, quero também: Pack de ${i.produtoNome} PRÓ (versão editável + 30 templates) por apenas ${fmtBRL(bumpPreco)} à vista (adiciona R$${round2(bumpPreco/12).toFixed(2).replace('.',',')} no parcelamento).`,
      ondeColocar: 'Checkbox LOGO acima do botão de comprar, dentro de uma caixa destacada com fundo amarelo claro.',
      regra: 'Bump deve ser 15-30% do preço principal. Conversão média de 20-40% dos compradores.',
      exemplos: {
        titulo: 'OFERTA ESPECIAL (só aparece uma vez)',
        subtitulo: 'Adicione este upgrade ao seu pedido',
      },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 3) OTOSequencia — sequência completa de 3 OTOs
// ─────────────────────────────────────────────────────────────
export interface OTOSequenciaInput { produtoNome: string; preco: number; nicho?: string }
export async function runOTOSequencia(i: OTOSequenciaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      produto: i.produtoNome,
      sequencia: [
        { ordem: 1, tipo: 'BUMP', preco: round2(i.preco * 0.27), oferta: `Versão PRO do ${i.produtoNome} com +30 templates/editáveis`, quando: 'Checkout, antes de pagar', conversao: '25-40%' },
        { ordem: 2, tipo: 'OTO 1 (Upsell)', preco: round2(i.preco * 1.97), oferta: 'Pacote COMPLETO + Mentoria 1:1 de 30min', quando: 'Após pagamento, 1ª página', conversao: '8-15%' },
        { ordem: 3, tipo: 'Downsell', preco: round2(i.preco * 0.57), oferta: 'Mesmo pacote, SEM mentoria', quando: 'Se recusar OTO 1', conversao: '15-25% dos recusos' },
        { ordem: 4, tipo: 'OTO 2 (Subscription)', preco: round2(i.preco * 0.15), oferta: 'Assinatura mensal: novos templates + comunidade', quando: 'Após downsell', conversao: '5-10%' },
      ],
      ganhoEstimadoPor100Compradores: round2(
        (i.preco * 100) +
        (i.preco * 0.27 * 30) +
        (i.preco * 1.97 * 10) +
        (i.preco * 0.57 * 8) +
        (i.preco * 0.15 * 7 * 3)
      ),
      dica: 'Cada comprador pode gerar 1.5x a 2.5x o ticket inicial com a sequência.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 4) ScriptVendaSPN — Script S.P.N. (Sofrimento, Ponte, Nova vida)
// ─────────────────────────────────────────────────────────────
export interface ScriptSPNInput { produtoNome: string; dor: string; sonho?: string }
export async function runScriptSPN(i: ScriptSPNInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.dor) return { ok: false, error: 'Preencha produto e dor.' }
  const sonho = i.sonho || ('ter resultado em ' + i.produtoNome)
  return {
    ok: true,
    data: {
      estrutura: 'S = Sofrimento, P = Ponte (produto), N = Nova Vida',
      partes: {
        sofrimento: `Você está cansado de ${i.dor}? De tentar tudo, gastar dinheiro, consumir conteúdo gratuito e mesmo assim não sair do lugar? Eu sei exatamente como é porque eu já passei por isso.`,
        ponte: `Foi por isso que criei o ${i.produtoNome}. Dentro dele você encontra exatamente o passo-a-passo pra ir do ponto A (onde você está hoje) pro ponto B (onde quer chegar), sem enrolação.`,
        novaVida: `Quando você aplicar, você vai ${sonho}. Vai olhar pra trás e ver que todo o esforço valeu a pena. Essa sensação não tem preço.`,
        fechamento: 'Clica no botão agora. A garantia de 7 dias cobre qualquer arrependimento, e você não tem nada a perder.',
      },
      video: `Abra o vídeo falando da dor (sofrimento), mostre que você entende, apresenta o produto (ponte), mostre o resultado que a pessoa vai ter (nova vida), feche com CTA.`,
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 5) RefundDesescalador — texto que reduz refund SEM negar reembolso
// ─────────────────────────────────────────────────────────────
export interface RefundDesescaladorInput { produtoNome: string; valorPago?: number; motivo?: string }
export async function runRefundDesescalador(i: RefundDesescaladorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Preencha.' }
  const motivo = i.motivo || 'não conseguir usar'
  return {
    ok: true,
    data: {
      etapas: [
        { momento: '1. Confirmar recebimento', texto: 'Olá [Nome], recebi seu pedido de reembolso e quero resolver da melhor forma possível.' },
        { momento: '2. Validar sentimento', texto: 'Peço desculpas se o ' + i.produtoNome + ' não atendeu suas expectativas ou se você está com dificuldade. É super normal travar no começo, eu também travei.' },
        { momento: '3. Oferecer ajuda', texto: 'Antes de processar o reembolso, posso te ajudar pessoalmente a destravar? Muitas vezes o pessoal abandona porque começa pelo módulo errado. Me diga onde está travando que eu te mando o caminho certo.' },
        { momento: '4. Bônus de compensação (se quiser)', texto: 'Se quiser ficar, posso liberar um bônus exclusivo e 15min de ajuda individual por mensagem pra você ver resultado mais rápido.' },
        { momento: '5. Respeitar escolha', texto: 'Se mesmo assim quiser o reembolso, sem problema. Ele será processado em até 3 dias úteis pelo PIX, sem burocracia.' },
      ],
      oQueNaoDizer: [
        'NUNCA negue o reembolso',
        'NUNCA faça o cliente se explicar ou se sentir culpado',
        'NUNCA demore mais de 24h pra responder',
        'NUNCA insista mais de 1 vez (respeite a decisão)',
      ],
      regra: 'Trate bem o cliente no reembolso. 15% pedem reembolso mas voltam a comprar depois por causa do bom atendimento.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 6) ProfitFirstSimulator — regra 50/30/10/10 do Profit First
// ─────────────────────────────────────────────────────────────
export interface ProfitFirstSimulatorInput { receitaMensal: number; custosFixos?: number }
export async function runProfitFirstSimulator(i: ProfitFirstSimulatorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.receitaMensal) return { ok: false, error: 'Informe receita mensal.' }
  const receita = i.receitaMensal
  return {
    ok: true,
    data: {
      receita,
      distribuicaoSugerida: [
        { nome: '💳 Taxas KIYVO/gateway (10%)', valor: round2(receita * 0.10), conta: 'Mesma conta, desconta automaticamente' },
        { nome: '💰 LUCRO (10%)', valor: round2(receita * 0.10), conta: 'Separe NO DIA do recebimento, NÃO MEXA' },
        { nome: '🧑‍💼 Seu salário (50%)', valor: round2(receita * 0.50), conta: 'Conta pessoal' },
        { nome: '📈 Impostos (15%)', valor: round2(receita * 0.15), conta: 'Guarde para IR/Simples' },
        { nome: '🚀 Operação (15%)', valor: round2(receita * 0.15), conta: 'Ferramentas, anúncios, equipe' },
      ],
      regra: 'Separe o lucro PRIMEIRO. Se o orçamento de operação ficar pequeno, significa que você precisa vender mais ou cortar custos, NÃO pegar do lucro.',
      proverbio: 'Quem lucra por último, nunca lucra.',
      erroComum: 'Esperar o "mês que vem" para ser lucrativo — separe 10% hoje mesmo.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 7) GiftCardCreator — gera gift card promocional
// ─────────────────────────────────────────────────────────────
export interface GiftCardCreatorInput { valor: number; bonusPercent?: number }
export async function runGiftCardCreator(i: GiftCardCreatorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.valor || i.valor < 5) return { ok: false, error: 'Valor mínimo R$5.' }
  const bonus = i.bonusPercent || (i.valor >= 100 ? 20 : i.valor >= 50 ? 10 : 5)
  const bonusValor = round2(i.valor * bonus / 100)
  const total = i.valor + bonusValor
  const codigo = 'KIYVO' + Math.random().toString(36).slice(2, 8).toUpperCase()
  return {
    ok: true,
    data: {
      codigo,
      valorPago: i.valor,
      bonusPercent: bonus,
      valorBonus: bonusValor,
      valorTotal: total,
      mensagem: `Gift card de ${fmtBRL(i.valor)} com ${bonus}% de bônus! Total de ${fmtBRL(total)} pra usar na KIYVO.`,
      uso: 'Enviar como presente, bônus de lançamento, recompensa de indicação ou premiação.',
      regra: 'Gift cards não expiram em menos de 12 meses (lei).',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 8) CashbackEngine — cria regras de cashback por KP
// ─────────────────────────────────────────────────────────────
export interface CashbackEngineInput { preco: number; plano?: 'free' | 'plus' | 'pro' | 'vendor_pro' }
export async function runCashbackEngine(i: CashbackEngineInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.preco) return { ok: false, error: 'Informe preço.' }
  const pct: Record<string, number> = { free: 1, plus: 2, pro: 3, vendor_pro: 5 }
  const p = pct[i.plano || 'free']
  const kd = Math.floor(i.preco * p)
  return {
    ok: true,
    data: {
      cashbackKDPontos: kd,
      valorEmDinheiro: fmtBRL(kd / 100),
      mensagem: `Parabéns! Você ganhou ${kd} KD Points (= ${fmtBRL(kd/100)}). Use na próxima compra, até 50% de desconto.`,
      regras: [
        '100 KD = R$1 de desconto',
        'Máximo 50% de desconto em qualquer produto',
        'Cashback expira em 12 meses',
        'KD não é sacável em dinheiro (só desconto)',
      ],
      kdNaoGanha: 'Cashback NÃO é dado em taxas/gateway, só no valor líquido.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 9) CriadorLeadMagnetAvancado — 7 ideias de isca + copy
// ─────────────────────────────────────────────────────────────
export interface CriadorLeadMagnetInput { nicho: string; publico?: string }
export async function runCriadorLeadMagnet(i: CriadorLeadMagnetInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.nicho) return { ok: false, error: 'Informe nicho.' }
  return {
    ok: true,
    data: {
      nicho: i.nicho,
      iscas: [
        { tipo: 'Checklist PDF (15-20 itens)', nome: `Checklist Definitivo de ${i.nicho} (15 pontos)`, conversao: '15-25%', trabalho: '1-2h pra fazer' },
        { tipo: 'Planilha', nome: `Planilha automática de ${i.nicho} (basta preencher)`, conversao: '20-30%', trabalho: '2-3h' },
        { tipo: 'Calculadora online', nome: `Calculadora de ${i.nicho}`, conversao: '25-40%', trabalho: '4-6h' },
        { tipo: 'Quiz', nome: `Quiz: Qual seu perfil em ${i.nicho}?`, conversao: '30-50%', trabalho: '3-4h' },
        { tipo: 'Mini-curso 3 vídeos', nome: `3 dias intensivos de ${i.nicho}`, conversao: '10-20%', trabalho: '1 dia' },
        { tipo: 'Template/arquivo pronto', nome: `Template editável de ${i.nicho}`, conversao: '30-45%', trabalho: '1h' },
        { tipo: 'Série de 5 emails', nome: `5 lições gratuitas de ${i.nicho}`, conversao: '12-22%', trabalho: '2h' },
      ],
      recomendado: 'Comece pelo CHECKLIST. É o mais rápido de fazer e já traz leads.',
      paginaObrigacao: '1 campo só: email (nome é opcional). Entrega imediata após confirmar.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 10) TicketMedioAumento — 10 estratégias de aumento de AOV
// ─────────────────────────────────────────────────────────────
export interface TicketMedioAumentoInput { ticketAtual: number }
export async function runTicketMedioAumento(i: TicketMedioAumentoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.ticketAtual) return { ok: false, error: 'Informe ticket.' }
  const t = i.ticketAtual
  return {
    ok: true,
    data: {
      ticketAtual: t,
      estrategias: [
        { nome: 'Order Bump (checkbox)', ganhoPercent: '+10-30%', como: `Adicione produto complementar de R$${round2(t*0.27)} no checkout.`, dificuldade: 'Baixa' },
        { nome: 'Upsell 1-click (OTO)', ganhoPercent: '+20-40%', como: `Ofereça versão premium R$${round2(t*1.97)} DEPOIS do pagamento.`, dificuldade: 'Média' },
        { nome: 'Desconto por quantidade', ganhoPercent: '+15-25%', como: 'Leve 2 e ganhe 15%, leve 3 e ganhe 30%.', dificuldade: 'Baixa' },
        { nome: 'Frete grátis acima de X', ganhoPercent: '+10-20%', como: `Adicione R$${round2(t*0.4)} pra chegar no "frete grátis".`, dificuldade: 'Baixa' },
        { nome: 'Bundle/Kit', ganhoPercent: '+30-60%', como: `Kit 3 produtos por R$${round2(t*2.3)} (economia de 30%).`, dificuldade: 'Média' },
        { nome: 'Venda casada (cross-sell)', ganhoPercent: '+5-15%', como: `Clientes que compram X também levam Y (R$${round2(t*0.4)}).`, dificuldade: 'Baixa' },
        { nome: 'Assinatura', ganhoPercent: '+50-200% LTV', como: `Plano mensal R$${round2(t*0.15)} para novos conteúdos.`, dificuldade: 'Alta' },
        { nome: 'Garantia estendida', ganhoPercent: '+5-10%', como: `+R$${round2(t*0.15)} pra ter garantia 30 dias (em vez de 7).`, dificuldade: 'Baixa' },
        { nome: 'Brinde pago', ganhoPercent: '+5-15%', como: `Por +R$${round2(t*0.12)} leve um brinde exclusivo.`, dificuldade: 'Baixa' },
        { nome: 'Pontos KD bonus por valor acima', ganhoPercent: '+10%', como: `Compras acima de R$${round2(t*1.5)} ganham 2x KD Points.`, dificuldade: 'Baixa' },
      ],
      meta: 'Combinando 2-3 estratégias, seu ticket pode aumentar 50% a 100%.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 11) ScriptWebinarRoteiro — roteiro de webinar que vende
// ─────────────────────────────────────────────────────────────
export interface ScriptWebinarRoteiroInput { produtoNome: string; preco: number; dor: string; resultado?: string }
export async function runScriptWebinarRoteiro(i: ScriptWebinarRoteiroInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco || !i.dor) return { ok: false, error: 'Preencha.' }
  const res = i.resultado || ('ver resultado real em ' + i.produtoNome)
  return {
    ok: true,
    data: {
      estrutura: [
        { minuto: '0-5', parte: 'Abertura e autoridade', script: 'Quem eu sou, por que estou aqui, promessa do webinar.' },
        { minuto: '5-15', parte: 'A dor', script: `Conto história sobre ${i.dor}, peço engajamento no chat, construo tensão.` },
        { minuto: '15-35', parte: 'Conteúdo de valor', script: 'Entrego 3 dicas acionáveis que o pessoal pode usar MESMO SEM comprar nada.' },
        { minuto: '35-45', parte: 'Virada (revelação)', script: `Revelo o motivo que 99% falham em ${i.dor} — é o que o ${i.produtoNome} resolve.` },
        { minuto: '45-60', parte: 'Oferta', script: `Apresento ${i.produtoNome}, bônus, preço ${fmtBRL(i.preco)} com 30% OFF só no webinar.` },
        { minuto: '60-75', parte: 'Perguntas + escassez', script: 'Respondo dúvidas, aviso que a oferta sai em 15 min.' },
        { minuto: '75-90', parte: 'Fechamento', script: 'Oferta acaba, anúncio de replay só vai ficar 4h.' },
      ],
      mediaCvr: 'Webinars bons convertem 8-15% dos presentes AO VIVO.',
      tecnicaChave: 'CTA só aparece DEPOIS de entregar valor (não seja vendido antes dos 45 min).',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 12) CriadorPerguntasFechamento — 12 perguntas que fecham venda
// ─────────────────────────────────────────────────────────────
export interface CriadorPerguntasInput { produtoNome: string }
export async function runCriadorPerguntas(i: CriadorPerguntasInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      regra: 'Perguntas levam a resposta. Afirmações geram resistência. Faça perguntas.',
      perguntas: [
        'Se você pudesse ter [resultado] sem ter que [dor], valeria a pena pra você?',
        'O que mudaria na sua vida se você tivesse esse resultado nos próximos 30 dias?',
        'Quanto você já gastou tentando resolver isso sem sucesso?',
        'Se hoje tivesse um caminho passo-a-passo, você estaria disposto a aplicar?',
        'Qual é o PIOR cenário se continuar fazendo o que está fazendo hoje?',
        'O que te impede de começar HOJE?',
        'Você prefere continuar como está ou tentar algo que já funcionou para outras pessoas?',
        `Se eu te mostrasse 3 depoimentos de pessoas que conseguiram resultado com o ${i.produtoNome}, valeria a pena considerar?`,
        'Quanto você acha que custa NÃO resolver isso?',
        'Se a garantia de 7 dias te dá segurança, por que não tentar?',
        'Quantas horas por dia você tem pra aplicar?',
        'Posso te enviar o link?',
      ],
      aoTerminar: 'Quando a pessoa responde SIM para "Posso te enviar o link?", feche. Não fale mais nada, envie e cale a boca.',
    },
  }
}
