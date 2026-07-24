// Agente ScriptForge — gera roteiros completos para Reels/TikTok/Shorts/VSL
// Inclui: hook de 3s, virada, call-to-action, hashtags, ritmo

export interface ScriptForgeInput {
  produto: string
  nicho: string
  duracao?: 15 | 30 | 60 | 90 // segundos
  tom?: 'influencer' | 'ceo' | 'amigo' | 'urgente' | 'tutorial'
  publico?: string
  preco?: number
  formato?: 'reels' | 'tiktok' | 'shorts' | 'vsl' | 'stories'
  objetivo?: 'vender' | 'engajar' | 'leads' | 'audiencia'
}

export interface Cena {
  segundo: string
  texto: string
  visual: string
  audio?: string
  legenda?: string
}

export interface ScriptForgeOutput {
  titulo: string
  hook: string
  cenas: Cena[]
  cta: string
  hashtags: string[]
  legendaCompleta: string
  duracaoSeg: number
  scoreViral: number
  dicasGravacao: string[]
  musicaSugerida: string
}

const HOOKS = {
  influencer: [
    (p: string) => `Para TUDO o que você tá fazendo e olha ISSO 🔥`,
    (p: string) => `Eu testei ${p} por 7 dias e olha no que deu... 😱`,
    (p: string) => `O segredo que ninguém te conta sobre ${p} 🤫`,
  ],
  ceo: [
    (p: string) => `Eu sou dono de uma loja de ${p} e vou te dar um conselho GRÁTIS.`,
    (p: string) => `3 anos vendendo ${p}: isso SIM funciona.`,
  ],
  amigo: [
    (p: string) => `Mana/mana, você PRECISA ver isso. ${p} mudou tudo pra mim. 🥹`,
    (p: string) => `Eu comprei ${p} no impulso... e CARA... que escolha! 🤯`,
  ],
  urgente: [
    (p: string) => `CORRE que essa oferta de ${p} ACABA EM 10 MINUTOS 🚨`,
    (p: string) => `ÚLTIMAS UNIDADES de ${p} — eu tô te avisando! 🔥`,
  ],
  tutorial: [
    (p: string) => `Como usar ${p} em 30 segundos (resultado no final) ✨`,
    (p: string) => `Passo a passo DE VERDADE de ${p} — sem enrolação.`,
  ],
}

export function gerarRoteiroVideo(input: ScriptForgeInput): ScriptForgeOutput {
  const { produto, nicho, duracao = 30, tom = 'influencer', publico = 'pessoas que querem resultados', preco, formato = 'reels', objetivo = 'vender' } = input
  const isTutorial = tom === 'tutorial'
  const hooks = HOOKS[tom]
  const hook = hooks[Math.floor(Math.random() * hooks.length)](produto)

  const cenas: Cena[] = []
  let segAtual = 0
  const segHook = formato === 'vsl' ? 8 : 3
  cenas.push({
    segundo: `0s-${segHook}s`,
    texto: hook,
    visual: tom === 'tutorial' ? 'Close no produto com texto grande' : 'Rosto com expressão de choque/alegria + texto',
    legenda: hook,
  })
  segAtual += segHook

  const meioDur = duracao - segHook - (objetivo === 'vender' ? 6 : 4)
  const meioSeg = Math.max(8, meioDur / 2)
  const problemas = [
    `Sabe quando você tenta de tudo e nada funciona? Eu também passei por isso.`,
    `Todo mundo fala que é fácil, mas na prática a história é outra...`,
    `Eu já perdi R$ ${preco ? preco * 5 : 500} tentando errar até descobrir ${produto}.`,
  ]
  cenas.push({
    segundo: `${segAtual}s-${segAtual + meioSeg}s`,
    texto: problemas[Math.floor(Math.random() * problemas.length)],
    visual: 'Cortes rápidos de situação-problema / B-roll',
    legenda: 'Antes: frustração, dor, dinheiro jogado fora',
  })
  segAtual += meioSeg

  cenas.push({
    segundo: `${segAtual}s-${segAtual + meioSeg}s`,
    texto: `Foi aí que eu conheci ${produto}. Em ${isTutorial ? 'minutos' : 'dias'}, eu vi a diferença.`,
    visual: 'Unboxing / antes e depois / resultado na tela',
    legenda: `A virada: ${produto}`,
  })
  segAtual += meioSeg

  const ctaSeg = objetivo === 'vender' ? 6 : 4
  const ctaText = objetivo === 'vender'
    ? preco
      ? `Clica no link da bio, usa o cupom KIYVO10 e leva ${produto} por só R$ ${preco.toFixed(2).replace('.', ',')} 🔥`
      : `Corre pro link da bio, promo exclusiva KIYVO por tempo limitado 🚀`
    : objetivo === 'leads'
    ? `Comenta "QUERO" que eu te mando o link DIRETO no DM 📩`
    : objetivo === 'engajar'
    ? `Marca quem precisa ver isso! Segue para mais 👊`
    : `Segue a gente pra não perder os próximos ${nicho} que vão bombar 🎯`

  cenas.push({
    segundo: `${segAtual}s-${segAtual + ctaSeg}s`,
    texto: ctaText,
    visual: 'Produto em destaque + arrow pointing down + dedo apontando',
    legenda: ctaText,
  })

  const hashtagsBase = [`#${nicho.replace(/\s+/g, '')}`, '#kiyvo', '#brasil', '#fy', '#fyp', '#viral', '#comprarbrasil']
  const hashtags = [...hashtagsBase, `#${produto.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 15)}`, '#digital', '#promocao']

  const legendaCompleta = `${hook.toUpperCase()}\n\n${produto} — para ${publico}.\n\n${ctaText}\n\n${hashtags.join(' ')}`

  let score = 70 + Math.floor(Math.random() * 20)
  if (hook.includes('?')) score += 3
  if (objetivo === 'vender' && preco) score += 5
  if (duracao <= 30) score += 4

  const musicas = ['"Trend Funk BR" — áudio em alta', '"Montagem Cosmic" — beat viral', '"Senta e Contempla" (edit)', 'Som autoral com voz robótica', '"Beat de transição" viral do momento']

  return {
    titulo: `${produto} — ${formato.toUpperCase()} ${tom}`,
    hook,
    cenas,
    cta: ctaText,
    hashtags,
    legendaCompleta,
    duracaoSeg: duracao,
    scoreViral: Math.min(99, score),
    dicasGravacao: [
      '🔴 GRAVE NA VERTICAL 9:16 com a câmera frontal',
      '👀 Os 3 primeiros segundos DECIDEM — não enrole',
      '🎬 Use cortes a cada 1.5s para reter atenção',
      '💬 ATIVE legendas grandes em amarelo (maior retenção em 38%)',
      '🎵 Use o ÁUDIO EM ALTA do dia (não música ambiente)',
      '👆 Dedo apontando pro link na bio aumenta cliques em 27%',
      '🗣️ Fale olhando DIRETO pra lente como se estivesse conversando',
      '⏱️ Vídeos de 15-22s performam melhor no Brasil',
    ],
    musicaSugerida: musicas[Math.floor(Math.random() * musicas.length)],
  }
}
