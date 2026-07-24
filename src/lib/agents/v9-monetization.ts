// Agentes v9.1 MONETIZAÇÃO EXTRA — focados em gerar receita
import type { AgentContext, AgentResult } from './types'

const fmtBRL = (n: number) => 'R$' + n.toFixed(2).replace('.', ',')
const round2 = (n: number) => Math.round(n * 100) / 100

// ─────────────────────────────────────────────────────────────
// 1) SaqueSimulator — simula saque e mostra quanto chega na conta
// ─────────────────────────────────────────────────────────────
export interface SaqueSimulatorInput { valorSaque: number; valorJaSacado?: number }
export async function runSaqueSimulator(i: SaqueSimulatorInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.valorSaque || i.valorSaque < 30) return { ok: false, error: 'Saque mínimo R$30.' }
  const taxaSaque = 0.99
  const liquido = i.valorSaque - taxaSaque
  return {
    ok: true,
    data: {
      valorSolicitado: i.valorSaque,
      taxaFixa: taxaSaque,
      valorLiquidoRecebido: round2(liquido),
      prazo: 'PIX em até 1 dia útil',
      minimo: 30,
      observacao: 'Taxa única de R$0,99 cobre custo do PIX. Sem mais taxas escondidas.',
      quantoFicaKiyvo: taxaSaque,
      percentualCobrado: round2((taxaSaque / i.valorSaque) * 100),
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 2) PrecificacaoAssinatura — preços de planos recorrentes
// ─────────────────────────────────────────────────────────────
export interface PrecificacaoAssinaturaInput { valorUnico: number; nomeProduto?: string }
export async function runPrecificacaoAssinatura(i: PrecificacaoAssinaturaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.valorUnico) return { ok: false, error: 'Informe valor do produto.' }
  const mensal = round2(i.valorUnico * 0.15)
  const trimestral = round2(mensal * 2.5) // 2 meses pagos
  const anual = round2(mensal * 10) // 2 meses grátis
  return {
    ok: true,
    data: {
      produto: i.nomeProduto || 'Produto',
      valorUnico: i.valorUnico,
      sugestoes: [
        { plano: 'Mensal', valor: mensal, comparado: '15% do valor único', estrategia: 'Sem fidelidade, cancela quando quiser' },
        { plano: 'Trimestral', valor: trimestral, comparado: 'Equivale a R$' + round2(trimestral/3).toFixed(2).replace('.',',') + '/mês', desconto: '17% OFF' },
        { plano: 'Anual', valor: anual, comparado: 'Equivale a R$' + round2(anual/12).toFixed(2).replace('.',',') + '/mês', desconto: '33% OFF + 2 meses grátis' },
      ],
      regra: 'Assinatura deve ser no máximo 15% do valor do produto pago à vista.',
      psicologico: 'Sempre ofereça anual como "mais escolhido" com faixa destacada.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 3) UpsellCarrinho — sugestão automática de complemento no carrinho
// ─────────────────────────────────────────────────────────────
export interface UpsellCarrinhoInput { produtoNome: string; preco: number; categoria?: string }
export async function runUpsellCarrinho(i: UpsellCarrinhoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Informe produto.' }
  const bump = round2(i.preco * 0.27)
  const upsell = round2(i.preco * 1.97)
  return {
    ok: true,
    data: {
      orderBump: {
        texto: `✅ QUERO TAMBÉM: Versão PRO com +20 templates — ${fmtBRL(bump)} à vista`,
        preco: bump,
        regra: 'Mostrar checkbox no carrinho, 20-30% do valor',
      },
      upsellPagamento: {
        texto: 'Oferta única: Leve o pacote premium completo com mentoria 1:1 por ' + fmtBRL(upsell),
        preco: upsell,
        regra: 'Mostrar DEPOIS do clique em comprar. Conversão média 8-15%.',
      },
      downsell: {
        texto: 'Sem problema! Versão avançada SEM mentoria por ' + fmtBRL(round2(i.preco * 0.57)),
        preco: round2(i.preco * 0.57),
      },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 4) CupomRelampago — cupom que expira rápido para KD points
// ─────────────────────────────────────────────────────────────
export interface CupomRelampagoInput { descontoPercent?: number; minimoValor?: number; horas?: number }
export async function runCupomRelampago(i: CupomRelampagoInput, _c?: AgentContext): Promise<AgentResult> {
  const desc = i.descontoPercent || 15
  const min = i.minimoValor || 47
  const h = i.horas || 2
  const codigo = 'KD' + Math.floor(Math.random() * 900 + 100)
  return {
    ok: true,
    data: {
      codigo,
      desconto: desc + '%',
      valorMinimo: fmtBRL(min),
      validadeHoras: h,
      regra: 'Máx um uso por usuário. Não cumulativo.',
      mensagemWhatsapp: `Corre! Cupom ${codigo} dá ${desc}% OFF em compras acima de ${fmtBRL(min)}. Expira em ${h}h!`,
      mensagemEmail: {
        assunto: `⚡ Cupom ${desc}% EXPIRA em ${h}h`,
        corpo: `Seu cupom exclusivo: ${codigo}\n\nUse no checkout e ganhe ${desc}% OFF em qualquer produto acima de ${fmtBRL(min)}. Vence em ${h}h.`,
      },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 5) PlanoUpgradeOferta — discurso de upgrade de plano
// ─────────────────────────────────────────────────────────────
export interface PlanoUpgradeOfertaInput { planoAtual: string; planoDesejado: string; valorPlano: number }
export async function runPlanoUpgradeOferta(i: PlanoUpgradeOfertaInput, _c?: AgentContext): Promise<AgentResult> {
  const planos = {
    free: { taxa: 8, limite: 2 },
    plus: { taxa: 6.5, limite: 15, preco: 19.9 },
    pro: { taxa: 5, limite: 60, preco: 49.9 },
    vendor_pro: { taxa: 3, limite: 200, preco: 99.9 },
  }
  const atual = (planos as any)[i.planoAtual] || planos.free
  const desejo = (planos as any)[i.planoDesejado]
  if (!desejo) return { ok: false, error: 'Plano inválido.' }
  const economiaTaxa = desejo.taxa - atual.taxa // negativo = economia
  const vendasParaPagar = round2(desejo.preco / ((atual.taxa - desejo.taxa) / 100))
  return {
    ok: true,
    data: {
      planoAtual: i.planoAtual,
      planoDesejado: i.planoDesejado,
      precoPlano: desejo.preco,
      reducaoTaxa: (atual.taxa - desejo.taxa) + '%',
      vendasParaPagarPlano: 'Vendendo R$' + vendasParaPagar.toFixed(2).replace('.',',') + '/mês, o plano se paga SOZINHO com a economia de taxa.',
      script: `Assinando ${i.planoDesejado}, você reduz a taxa de ${atual.taxa}% pra ${desejo.taxa}% e ganha ${desejo.limite} usos de agentes por dia. O valor é R$${desejo.preco}/mês.`,
      garantia: '7 dias de garantia. Se não curtir, devolvemos 100%.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 6) VendaCruzada — produtos que combinam (recommender)
// ─────────────────────────────────────────────────────────────
export interface VendaCruzadaInput { produtoNome: string; preco: number; nicho?: string }
export async function runVendaCruzada(i: VendaCruzadaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome) return { ok: false, error: 'Informe produto.' }
  return {
    ok: true,
    data: {
      titulo: 'Quem viu ' + i.produtoNome + ' também comprou:',
      regras: [
        'Adicionar produtos de preço 30-60% do original',
        'Nunca adicionar produto mais caro que o principal como recomendação',
        'Mostrar no máximo 3 sugestões',
        'Ordenar por "mais vendidos" primeiro',
      ],
      ordem: [
        'Produto complementar imediato (ex: curso + templates)',
        'Produto similar de outro vendedor (comissão afiliado)',
        'Produto mais barato por impulso (R$9-R$27)',
      ],
      exemplo: {
        principal: i.produtoNome,
        sugestoes: [
          { nome: 'Pack de templates prontos', preco: round2(i.preco * 0.27), razao: 'Complementa 100%' },
          { nome: 'Checklist + planner', preco: round2(i.preco * 0.17), razao: 'Ideal para executar' },
          { nome: 'Grupo VIP', preco: round2(i.preco * 0.47), razao: 'Suporte da comunidade' },
        ],
      },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 7) PrimeiraCompra — boas-vindas de 1ª compra com cashback
// ─────────────────────────────────────────────────────────────
export interface PrimeiraCompraInput { valorCompra: number }
export async function runPrimeiraCompra(i: PrimeiraCompraInput, _c?: AgentContext): Promise<AgentResult> {
  const kd = Math.floor(i.valorCompra * 2) // Dobro do cashback
  return {
    ok: true,
    data: {
      kdBonus: kd,
      valorEmDinheiro: fmtBRL(kd / 100),
      mensagem: `BEM-VINDO! 🎉 Por ser sua primeira compra, você ganhou ${kd} KD Points de bônus (= ${fmtBRL(kd/100)} pro desconto da próxima compra).`,
      proximoPasso: 'Aproveite o produto! Em 3 dias vamos enviar um cupom exclusivo pra você.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 8) CalculadoraROIAds — calcula ROI de anúncio
// ─────────────────────────────────────────────────────────────
export interface CalculadoraROIAdsInput { precoProduto: number; custoPorClique?: number; conversaoPercent?: number }
export async function runCalculadoraROIAds(i: CalculadoraROIAdsInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.precoProduto) return { ok: false, error: 'Informe preço.' }
  const cpc = i.custoPorClique || 0.5
  const conv = i.conversaoPercent || 2
  const taxaPct = 0.08 // 8%
  const taxaFixa = 0.5 // R$0,50
  const lucroPorVenda = i.precoProduto - (i.precoProduto * taxaPct) - taxaFixa
  const cliquesParaVender = 100 / conv
  const cac = cpc * cliquesParaVender
  const roi = ((lucroPorVenda - cac) / cac) * 100
  return {
    ok: true,
    data: {
      precoProduto: i.precoProduto,
      cpc,
      conversao: conv + '%',
      cacEstimado: round2(cac),
      lucroPorVendaLiquido: round2(lucroPorVenda),
      roiPercent: round2(roi),
      valePena: roi >= 30 ? 'SIM! ROI positivo. Pode escalar.' : roi > 0 ? 'Margem apertada. Otimize página.' : 'NÃO. Vai ter prejuízo. Melhore conversão.',
      regra: 'CAC deve ser no máximo 30% do valor do produto.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 9) BlackFridayEstrategia — estratégia de BF
// ─────────────────────────────────────────────────────────────
export interface BlackFridayEstrategiaInput { precoNormal: number; custo?: number }
export async function runBlackFridayEstrategia(i: BlackFridayEstrategiaInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.precoNormal) return { ok: false, error: 'Informe preço.' }
  const limiar = (i.custo || 0) / (1 - 0.08 - 0.065)
  return {
    ok: true,
    data: {
      precoNormal: i.precoNormal,
      precoMinimo: round2(limiar),
      fases: [
        { fase: 'Pré-BF (1 semana antes)', desconto: '15%', preco: round2(i.precoNormal * 0.85), objetivo: 'Lista de espera' },
        { fase: 'Black Friday (sexta)', desconto: '30%', preco: round2(i.precoNormal * 0.70), objetivo: 'Pico de vendas' },
        { fase: 'Sábado estendido', desconto: '22%', preco: round2(i.precoNormal * 0.78), objetivo: 'Quem perdeu a sexta' },
        { fase: 'Cyber Monday', desconto: '25% + bonus', preco: round2(i.precoNormal * 0.75), objetivo: 'Última chance' },
      ],
      lembretes: [
        'Comece a aquecer lista 15 dias antes',
        'Mostre preço antigo riscado (lei obriga preço praticado nos últimos 30 dias)',
        'Prova social em tempo real durante o evento',
        'Contadores regressivos por oferta',
        'NUNCA dê desconto maior que 30% em produto digital (desvaloriza)',
      ],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 10) ReceitaRecorrente — calcula MRR com assinatura
// ─────────────────────────────────────────────────────────────
export interface ReceitaRecorrenteInput { assinantes: number; valorMensal: number; churnPercent?: number }
export async function runReceitaRecorrente(i: ReceitaRecorrenteInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.assinantes || !i.valorMensal) return { ok: false, error: 'Preencha.' }
  const churn = i.churnPercent || 5
  const mrr = i.assinantes * i.valorMensal
  const arr = mrr * 12
  const ltv = i.valorMensal / (churn / 100)
  const perdidosMes = Math.ceil(i.assinantes * churn / 100)
  const precisaParaManter = perdidosMes
  return {
    ok: true,
    data: {
      assinantes: i.assinantes,
      valorMensal: i.valorMensal,
      mrr: round2(mrr),
      arr: round2(arr),
      ltvPorCliente: round2(ltv),
      churn: churn + '%',
      clientesPerdidosMes: perdidosMes,
      precisaVenderPorMes: precisaParaManter + ' assinaturas só pra manter',
      dica: 'Churn ideal é abaixo de 3% ao mês. Acima de 7% você precisa corrigir o produto.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 11) ScriptLancamento — plano de lançamento (7 dias)
// ─────────────────────────────────────────────────────────────
export interface ScriptLancamentoInput { produtoNome: string; preco: number }
export async function runScriptLancamento(i: ScriptLancamentoInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.preco) return { ok: false, error: 'Preencha.' }
  return {
    ok: true,
    data: {
      produto: i.produtoNome,
      preco: i.preco,
      cronograma: [
        { dia: -7, acao: 'Anunciar que vem aí (sem mostrar preço)', canal: 'Instagram/WhatsApp', objetivo: 'Aquecer' },
        { dia: -5, acao: 'Mostrar bastidores + 1 dor que o produto resolve', canal: 'Reels/Stories', objetivo: 'Consciência' },
        { dia: -3, acao: 'Abrir lista de espera (desconto exclusivo pra quem entrar)', canal: 'Link na bio', objetivo: 'Capturar leads' },
        { dia: -2, acao: 'Mostrar 3 depoimentos de beta testers', canal: 'Email/Stories', objetivo: 'Prova' },
        { dia: -1, acao: 'Contagem regressiva + bônus surpresa', canal: 'Todos', objetivo: 'Expectativa' },
        { dia: 0, acao: 'ABERTURA! Preço promocional primeiras 48h', canal: 'Todos', objetivo: 'VENDER' },
        { dia: 2, acao: 'Aumentar preço, divulgar números de vendas', canal: 'Todos', objetivo: 'Urgência' },
        { dia: 7, acao: 'Fechar carrinho (abrir só mês que vem)', canal: 'Todos', objetivo: 'Escassez' },
      ],
      meta: 'Vender 3-5% da sua lista de leads.',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// 12) CopyLancamentoSniper — copy de lançamento que converte
// ─────────────────────────────────────────────────────────────
export interface CopyLancamentoSniperInput { produtoNome: string; nicho: string; dor: string }
export async function runCopyLancamentoSniper(i: CopyLancamentoSniperInput, _c?: AgentContext): Promise<AgentResult> {
  if (!i.produtoNome || !i.nicho) return { ok: false, error: 'Preencha.' }
  const dor = i.dor || ('travar em ' + i.nicho + ' sem resultado')
  return {
    ok: true,
    data: {
      aberturaCarrinho: `HOJE ÀS 20H o ${i.produtoNome} abre. Marca na agenda. Se você tá cansado de ${dor}, esse é o produto que vai mudar o jogo.`,
      fechamento: `Faltam 2h pra fechar o carrinho do ${i.produtoNome}. Se você ficar de fora dessa vez, vai pagar mais caro quando abrir de novo.`,
      sequenciaEmails: [
        { dia: 'D-7', assunto: 'Aviso importante sobre ' + i.nicho },
        { dia: 'D-3', assunto: 'O que ninguém te conta sobre ' + i.dor },
        { dia: 'D-1', assunto: 'Amanhã você vai entender tudo' },
        { dia: 'D-0', assunto: 'ABERTO!' },
        { dia: 'D+2', assunto: 'R$100 mais caro amanhã' },
        { dia: 'D+7', assunto: 'Últimas 2h' },
      ],
      ctas: ['Quero garantir minha vaga', 'Me avise quando abrir', 'Quero entrar na lista'],
    },
  }
}
