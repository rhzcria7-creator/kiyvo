// Agente CompetidorRadar — analisa nicho e dá visão competitiva do mercado BR
// Preço médio, saturação, demanda, canais ideais, players, keywords

export interface CompetidorRadarInput {
  nicho: string
  produto?: string
  precoDesejado?: number
}

export interface Concorrente {
  tipo: 'grande' | 'medio' | 'pequeno' | 'afiliado'
  nome: string
  precoMedio: number
  pontosFortes: string
  pontosFracos: string
  comoBater: string
}

export interface CompetidorRadarOutput {
  saturacao: 'baixa' | 'media' | 'alta' | 'muito_alta'
  scoreDemanda: number
  precoMinimo: number
  precoMaximo: number
  precoIdeal: number
  precoMedio: number
  tamanhoMercado: string
  sazonalidade: string[]
  canaisIdeais: Array<{ canal: string; percentualTrafego: number; porQue: string }>
  palavrasChave: Array<{ kw: string; volume: 'alto' | 'medio' | 'baixo'; cpc: string; dificuldade: number }>
  concorrentes: Concorrente[]
  barreirasEntrada: string[]
  vantagensKiyvo: string[]
  acao30Dias: string[]
}

const NICHOS_CONHECIDOS: Record<string, Partial<CompetidorRadarOutput>> = {
  'marketing digital': { saturacao: 'muito_alta', tamanhoMercado: 'R$ 20B+/ano BR' },
  'emagrecimento': { saturacao: 'muito_alta', tamanhoMercado: 'R$ 10B+/ano BR' },
  'finan': { saturacao: 'alta', tamanhoMercado: 'R$ 5B+/ano BR (educação financeira)' },
  'investimento': { saturacao: 'alta', tamanhoMercado: 'R$ 5B+/ano BR' },
  'curso': { saturacao: 'muito_alta', tamanhoMercado: 'R$ 30B+/ano BR' },
  'beleza': { saturacao: 'alta', tamanhoMercado: 'R$ 60B+/ano BR' },
  'moda': { saturacao: 'muito_alta', tamanhoMercado: 'R$ 180B+/ano BR' },
  'fitness': { saturacao: 'alta', tamanhoMercado: 'R$ 10B+/ano BR' },
  'ia': { saturacao: 'media', tamanhoMercado: 'Crescente 200%/ano' },
  'tecnologia': { saturacao: 'alta', tamanhoMercado: 'R$ 200B+/ano BR' },
  'renda extra': { saturacao: 'muito_alta', tamanhoMercado: 'Grande demanda (busca "ganhar dinheiro")' },
}

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

export function analisarMercado(input: CompetidorRadarInput): CompetidorRadarOutput {
  const { nicho, produto = 'produto', precoDesejado = 97 } = input
  const nichoLow = nicho.toLowerCase()
  let saturacao: CompetidorRadarOutput['saturacao'] = 'media'
  let tamanho = 'Mercado em crescimento no Brasil'
  for (const [k, v] of Object.entries(NICHOS_CONHECIDOS)) {
    if (nichoLow.includes(k)) {
      saturacao = (v.saturacao as CompetidorRadarOutput['saturacao']) || 'media'
      tamanho = v.tamanhoMercado || tamanho
      break
    }
  }

  const precoMinimo = Math.max(7, precoDesejado * 0.5)
  const precoMaximo = precoDesejado * 1.8
  const precoIdeal = precoDesejado > 47 && precoDesejado < 297 ? precoDesejado : precoDesejado < 47 ? 47 : 197
  const precoMedio = precoIdeal * rand(0.9, 1.15)

  let scoreDemanda = 50
  if (saturacao === 'baixa') scoreDemanda = 35
  else if (saturacao === 'media') scoreDemanda = 65
  else if (saturacao === 'alta') scoreDemanda = 80
  else scoreDemanda = 75 // saturado mas demanda massiva

  const canaisIdeais = [
    { canal: 'Instagram Reels', percentualTrafego: 35, porQue: 'Maior alcance orgânico pago em 2025 no BR' },
    { canal: 'TikTok', percentualTrafego: 25, porQue: 'CPC mais barato e público comprador jovem' },
    { canal: 'YouTube Longo', percentualTrafego: 15, porQue: 'Melhor pra ticket alto e confiança' },
    { canal: 'Google Search', percentualTrafego: 15, porQue: 'Tráfego de intenção — menor CAC' },
    { canal: 'WhatsApp Broadcast', percentualTrafego: 10, porQue: 'Taxa de abertura > 70%' },
  ]

  const palavrasChave: CompetidorRadarOutput['palavrasChave'] = [
    { kw: `${produto} funciona`, volume: 'alto', cpc: 'R$ 1.20', dificuldade: 65 },
    { kw: `${produto} é bom`, volume: 'alto', cpc: 'R$ 0.95', dificuldade: 60 },
    { kw: `${produto} reclame aqui`, volume: 'medio', cpc: 'R$ 1.80', dificuldade: 45 },
    { kw: `como usar ${produto}`, volume: 'medio', cpc: 'R$ 0.55', dificuldade: 30 },
    { kw: `${produto} preço`, volume: 'alto', cpc: 'R$ 1.10', dificuldade: 55 },
    { kw: `${produto} download`, volume: 'baixo', cpc: 'R$ 0.40', dificuldade: 20 },
    { kw: `melhor ${nichoLow} brasil`, volume: 'medio', cpc: 'R$ 2.50', dificuldade: 75 },
  ]

  const concorrentes: Concorrente[] = [
    { tipo: 'grande', nome: 'Player grande estabelecido (Hotmart/Monetizze)', precoMedio: precoMedio * 1.4, pontosFortes: 'Autoridade e base de e-mail', pontosFracos: 'Suporte lento e genérico', comoBater: 'Suporte humano em PT-BR + bônus exclusivos' },
    { tipo: 'medio', nome: 'Infoprodutor/influencer médio', precoMedio: precoMedio, pontosFortes: 'Prova social forte', pontosFracos: 'Produto desatualizado, sem atualizações', comoBater: 'Atualizações mensais + comunidade KIYVO' },
    { tipo: 'pequeno', nome: 'Vendedores amadores (Mercado Livre/Shopee)', precoMedio: precoMinimo, pontosFortes: 'Preço baixo', pontosFracos: 'Sem garantia, cópia pirata, sem suporte', comoBater: 'Selo Oficial KIYVO + garantia 7 dias' },
    { tipo: 'afiliado', nome: 'Afiliados divulgando concorrentes', precoMedio: precoMedio, pontosFortes: 'Volume de divulgação', pontosFracos: 'Comissão e sem pós-venda', comoBater: 'Programa de afiliados KIYVO com 50% de comissão' },
  ]

  const barreirasEntrada = [
    'Autoridade no nicho (se saturado)',
    'Criativos que prendem atenção nos 3 primeiros segundos',
    'Prova social (depoimentos reais em vídeo)',
    'Copy de página de vendas que converte',
    'Lista de e-mail/audiência própria (para escala barata)',
  ]

  const vantagensKiyvo = [
    '💙 Infraestrutura completa (pagamento + checkout + afiliados + entrega digital) sem setup',
    '🤖 15+ agentes IA prontos para copy, banners, funis, anúncios',
    '⚡ Checkout PIX instantâneo com 0 de taxa no KIYVO Wallet',
    '🏷️ Selo Oficial KIYVO já transmite confiança',
    '👥 Afiliados nativos — 1000+ afiliados esperando seu produto',
    '📊 Dashboard unificado de vendas, métricas e IA',
  ]

  const acao30Dias = [
    'Dias 1-3: Definir oferta matadora (preço + 3 bônus)',
    'Dias 4-7: Criar produto mínimo + página de vendas com CopyMaster',
    'Dias 8-12: Criar 10 criativos com BannerForge + ScriptForge',
    'Dias 13-18: Subir R$ 50/dia em anúncios com 3 hooks diferentes',
    'Dias 19-25: Otimizar baseado em dados com AdOptimizer',
    'Dias 26-30: Ligar programa de afiliados + escalar campanhas lucrativas',
  ]

  const sazonalidade = ['Datas sazonais importantes:', '• Janeiro (virada, metas)', '• Fevereiro (Carnaval)', '• Maio (Dia das Mães)', '• Junho (Dia dos Namorados)', '• Agosto (Dia dos Pais)', '• Outubro (Black Friday aquecimento)', '• Novembro (Black Friday — 30-40% das vendas do ano)', '• Dezembro (Natal + Ano Novo)']

  return {
    saturacao,
    scoreDemanda,
    precoMinimo,
    precoMaximo,
    precoIdeal,
    precoMedio,
    tamanhoMercado: tamanho,
    sazonalidade,
    canaisIdeais,
    palavrasChave,
    concorrentes,
    barreirasEntrada,
    vantagensKiyvo,
    acao30Dias,
  }
}
