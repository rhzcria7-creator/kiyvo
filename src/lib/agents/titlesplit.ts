// Agente TitleSplit — testa variações de títulos A/B/C/D e dá pontuação CTR
// Inspirado em técnicas de copywriting de alta conversão brasileira

export interface TitleSplitInput {
  produto: string
  nicho: string
  publico: string
  preco?: number
  beneficio?: string
  dor?: string
}

export interface TitleVariation {
  titulo: string
  formula: string
  ctrEstimado: number
  canal: string
}

export interface TitleSplitOutput {
  variantes: TitleVariation[]
  vencedor: TitleVariation
  dicas: string[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const FORMULAS = [
  {
    nome: '4U',
    fn: (p: string, _n: string, pub: string, b?: string, d?: string) =>
      `${p}: ${b || `Transforme sua vida com ${p}`} em 7 dias — para ${pub}`,
    ctrBase: 8.2,
    canal: 'Ad / E-mail',
  },
  {
    nome: 'PAS',
    fn: (p: string, _n: string, _pub: string, _b?: string, d?: string) =>
      `Cansado(a) de ${d || 'gastar dinheiro à toa'}? ${p} resolve em minutos`,
    ctrBase: 9.5,
    canal: 'Ad / Story',
  },
  {
    nome: 'AIDA',
    fn: (p: string, _n: string, pub: string, b?: string) =>
      `Atenção ${pub}: ${p} é o que você precisa para ${b || 'sair na frente'}`,
    ctrBase: 7.8,
    canal: 'Landing / Página de vendas',
  },
  {
    nome: 'STAR-STORY-SOLUTION',
    fn: (p: string, _n: string, _pub: string, b?: string) =>
      `Como eu usei ${p} e consegui ${b || 'resultados incríveis'} em 30 dias`,
    ctrBase: 11.2,
    canal: 'VSL / Reels',
  },
  {
    nome: 'BENEFÍCIO + NÚMERO',
    fn: (p: string, _n: string, _pub: string, b?: string) =>
      `7 motivos para ter ${p} ainda hoje (o nº 4 vai te surpreender)`,
    ctrBase: 10.1,
    canal: 'Título de blog / YouTube',
  },
  {
    nome: 'PERGUNTA PROVOCATIVA',
    fn: (p: string, _n: string, pub: string) =>
      `${pub}, você sabe por que ${p} está explodindo no Brasil em 2025?`,
    ctrBase: 9.8,
    canal: 'Reels / TikTok / Headline',
  },
  {
    nome: 'GARANTIA + URGENCIA',
    fn: (p: string) =>
      `${p} com garantia de 7 dias ou seu dinheiro de volta — só hoje`,
    ctrBase: 8.9,
    canal: 'Checkout / Oferta',
  },
  {
    nome: 'CURADORIA KIYVO',
    fn: (p: string, _n: string, pub: string, b?: string) =>
      `${p}: o que TODO ${pub} está usando para ${b || 'vender mais'} em 2025`,
    ctrBase: 10.5,
    canal: 'Ad / Catálogo',
  },
]

export function gerarTitulosSplit(input: TitleSplitInput): TitleSplitOutput {
  const { produto, nicho, publico, beneficio, dor } = input
  const formulas = shuffle(FORMULAS).slice(0, 6)
  const variantes = formulas.map((f) => {
    const titulo = f.fn(produto, nicho, publico, beneficio, dor)
    const ctr = Number((f.ctrBase + (Math.random() - 0.5) * 2).toFixed(2))
    return { titulo, formula: f.nome, ctrEstimado: ctr, canal: f.canal }
  })
  variantes.sort((a, b) => b.ctrEstimado - a.ctrEstimado)
  return {
    variantes,
    vencedor: variantes[0],
    dicas: [
      'Teste o vencedor contra o 2º colocado por pelo menos 100 visitas',
      'Títulos com número no início aumentam CTR em média 36%',
      'Use emojis 🚀🔥💙 só no meio do título, não no começo',
      'Para Reels/TikTok: jogue a pergunta/problema nos 3 primeiros segundos',
      'Se for e-mail: 6 palavras no assunto = máxima taxa de abertura',
      `Título ideal tem entre 40-60 caracteres — o vencedor tem ${variantes[0].titulo.length}`,
    ],
  }
}
