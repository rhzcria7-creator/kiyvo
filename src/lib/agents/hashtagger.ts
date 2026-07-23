// Agente HashtagGenerator — hashtags otimizadas para Instagram/TikTok/YouTube
// Mistura hashtags grandes, médias e pequenas para alcance máximo
export interface HashtagInput {
  nicho: string
  produto?: string
  rede?: 'instagram' | 'tiktok' | 'youtube' | 'geral'
  quantidade?: number
}

export interface HashtagOutput {
  hashtags: Array<{ tag: string; tamanho: 'grande' | 'media' | 'nichada' }>
  legendas: string[]
  dicas: string[]
  frequenciaPostagem: string
  melhorHorario: string[]
}

const REPO: Record<string, { grandes: string[]; medias: string[]; nichadas: string[] }> = {
  marketing: {
    grandes: ['#marketingdigital', '#marketing', '#brasil', '#negocios', '#empreendedorismo', '#digital', '#sucesso', '#vendas'],
    medias: ['#afiliado', '#afiliadosbrasil', '#marketingbrasil', '#negociosonline', '#rendaextra', '#hotmart', '#monetizze', '#kiyo'],
    nichadas: ['#comovenderonline', '#vendernoinstagram', '#vendernotiktok', '#copys', '#funildevendas', '#trafegopagoiniciante', '#organicobrasil'],
  },
  fitness: {
    grandes: ['#fitness', '#saude', '#vidasaudavel', '#treino', '#academia', '#emagrecimento', '#brasil', '#dieta'],
    medias: ['#musculacao', '#hiit', '#crossfit', '#emagrecer', '#perderpeso', '#treinodepernas', '#fit', '#nopainnogain'],
    nichadas: ['#treinoemcasa', '#dietalowcarb', '#jejumintermitente', '#bulking', '#deficitcalorico', '#foconadieta', '#projetoverao'],
  },
  beleza: {
    grandes: ['#beleza', '#makeup', '#maquiagem', '#cabelo', 'skincare', '#moda', '#brasil', '#beauty'],
    medias: ['#make', '#makeupbrasil', '#pele', '#cabelos', '#belezaBrasil', '#dicasdebeleza', '#pelesaudavel', '#makeuptutorial'],
    nichadas: ['#peleoleosa', '#cabelocacheado', '#makeiniciante', '#skincarerotina', '#glowupbrasil', '#basicoskincare', '#dicasdeskincare'],
  },
}

function getForNicho(nicho: string) {
  const l = nicho.toLowerCase()
  for (const k of Object.keys(REPO)) {
    if (l.includes(k)) return REPO[k]
  }
  // Genérico BR
  return {
    grandes: ['#brasil', '#viral', '#fy', '#fyp', '#foryou', '#foryoupage', '#trending', '#explorar'],
    medias: ['#kiyo', '#digital', '#novidade', '#promoção', '#compra', '#oferta', '#brasil2025', '#fybrasil'],
    nichadas: [`#${l.replace(/\s+/g, '')}brasil`, `#${l.replace(/\s+/g, '')}`, `#dicas${l.replace(/\s+/g, '')}`, `#comprar${l.replace(/\s+/g, '')}`, `#${l.replace(/\s+/g, '')}br`, '#produtodigital', '#produtonovo', '#lancamento'],
  }
}

export function gerarHashtags(input: HashtagInput): HashtagOutput {
  const { nicho, produto = '', rede = 'geral', quantidade = 30 } = input
  const data = getForNicho(nicho)
  const tags: Array<{ tag: string; tamanho: 'grande' | 'media' | 'nichada' }> = []
  // 30% grandes, 40% medias, 30% nichadas
  const nGrandes = Math.round(quantidade * 0.3)
  const nMedias = Math.round(quantidade * 0.4)
  const nNichadas = quantidade - nGrandes - nMedias
  const shuffled = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
  const g = shuffled(data.grandes).slice(0, nGrandes).map(t => ({ tag: t, tamanho: 'grande' as const }))
  const m = shuffled(data.medias).slice(0, nMedias).map(t => ({ tag: t, tamanho: 'media' as const }))
  const n = shuffled(data.nichadas).slice(0, nNichadas).map(t => ({ tag: t, tamanho: 'nichada' as const }))
  if (produto) {
    const tagProduto = { tag: `#${produto.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20)}`, tamanho: 'nichada' as const }
    n.unshift(tagProduto)
  }
  // Tag KIYVO sempre
  n.unshift({ tag: '#kiyvo', tamanho: 'nichada' as const })
  tags.push(...g, ...m, ...n)

  const horarios: Record<string, string[]> = {
    instagram: ['7h-9h (café)', '12h-13h (almoço)', '19h-22h (pico noite)'],
    tiktok: ['11h-12h', '15h-17h (hora do tédio)', '20h-23h'],
    youtube: ['9h-11h (manhã produtiva)', '15h-18h', '20h-22h'],
    geral: ['12h', '18h', '21h'],
  }

  return {
    hashtags: tags,
    legendas: [
      `Marca quem precisa ver isso 👇 ${tags.slice(0, 10).map(t => t.tag).join(' ')}`,
      `Salva esse post pra não esquecer 🔥 ${tags.slice(0, 15).map(t => t.tag).join(' ')}`,
      `Link na bio ✨ ${tags.slice(0, 12).map(t => t.tag).join(' ')}`,
    ],
    dicas: [
      '📱 Use no MÁXIMO 5-10 hashtags no Instagram (2025 algoritmo penaliza muitas)',
      '🎯 No TikTok: 3-5 hashtags, sendo 1-2 grandes + 3 nichadas',
      '🎬 No YouTube: coloque hashtags no final da descrição (500 caracteres)',
      '✨ Misture 1 hashtag da marca (#kiyvo), 2 grandes e 5 nichadas = fórmula ideal',
      '🔄 Não use as mesmas hashtags em TODOS os posts — gire o conjunto',
    ],
    frequenciaPostagem: 'Reels/TikTok: 1x/dia • Posts Instagram: 4x/semana • YouTube: 1x/semana',
    melhorHorario: horarios[rede],
  }
}
