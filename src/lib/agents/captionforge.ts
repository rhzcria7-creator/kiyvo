// Agente CaptionForge — legendas prontas para Instagram/TikTok/Facebook/LinkedIn
// Inclui hooks, emojis, quebras de linha e CTA otimizado
export interface CaptionForgeInput {
  produto: string
  nicho: string
  tom?: 'influencer' | 'ceo' | 'amigo' | 'minimalista' | 'poetico' | 'viral' | 'tutorial'
  rede?: 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'youtube'
  objetivo?: 'vender' | 'engajar' | 'audiencia'
  preco?: number
  ctaLink?: string
}
export interface CaptionForgeOutput {
  legenda: string
  hook: string
  cta: string
  emojis: string[]
  tamanho: 'curta'|'media'|'longa'
  caracteres: number
  scoreLeiturabilidade: number
  dicas: string[]
}
const EMOJIS_POR_NICHO: Record<string, string[]> = {
  marketing: ['🚀','💙','🔥','💸','📊','⚡','💼'],
  fitness: ['💪','🔥','🏋️','⚡','🥗','💯','🏃'],
  beleza: ['✨','💄','💅','💖','🧴','🌟','💋'],
  moda: ['👗','✨','👠','🛍️','💫','👜','🕶️'],
  negocios: ['💼','📈','💰','🎯','🚀','⚡','🏆'],
  educacao: ['📚','✏️','🎓','🧠','💡','⭐','📖'],
  geral: ['✨','🔥','💙','🚀','💡','⚡','💫'],
}
function getEmojis(nicho: string): string[] {
  const l = nicho.toLowerCase()
  for (const k of Object.keys(EMOJIS_POR_NICHO)) if (l.includes(k)) return EMOJIS_POR_NICHO[k]
  return EMOJIS_POR_NICHO.geral
}
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
export function gerarLegenda(input: CaptionForgeInput): CaptionForgeOutput {
  const { produto, nicho, tom = 'influencer', rede = 'instagram', objetivo = 'vender', preco } = input
  const emojis = getEmojis(nicho)
  const hooks = {
    influencer: [
      `${rand(emojis)} Para TUDO o que você tá fazendo e olha ISSO`,
      `Meu Deus, eu PRECISO compartilhar isso com você ${rand(emojis)}`,
      `Eu testei ${produto} e agora quero contar a verdade ${rand(emojis)}`,
    ],
    ceo: [
      `Uma verdade que ninguém te conta sobre ${nicho}:`,
      `3 anos trabalhando com ${nicho} e cheguei a uma conclusão:`,
      `${rand(emojis)} Eu sou dono de um negócio de ${nicho} e vou te dar um conselho GRÁTIS.`,
    ],
    amigo: [
      `Amiga/amigo, você PRECISA saber disso ${rand(emojis)}`,
      `Eu juro que tava guardando segredo, mas hoje vou te contar ${rand(emojis)}`,
      `${rand(emojis)} Tenho uma confissão:`,
    ],
    minimalista: [`${produto}.`, `${rand(emojis)} ${produto}`, `Simples assim.`],
    poetico: [`Entre erros e acertos, ${produto} foi o que me pegou de jeito.`, `${rand(emojis)} Quem diria que isso mudaria tudo?`],
    viral: [`ISSO NÃO É GOLPE ${rand(emojis)}`, `A ÚLTIMA FRASE DESSE VÍDEO VAI TE CHOCAR ${rand(emojis)}`, `🚨 CORRE QUE AINDA DÁ TEMPO`],
    tutorial: [`Em ${rand(emojis==null?['30','20','15']:['30'])} segundos eu te mostro`, `Passo a passo DE VERDADE ${rand(emojis)}`, `Salva esse vídeo porque você vai precisar ${rand(emojis)}`],
  }
  const hooksList = hooks[tom] || hooks.influencer
  const hook = rand(hooksList)
  const corpoPartes: string[] = []
  corpoPartes.push(hook)
  corpoPartes.push('')
  if (tom !== 'minimalista') {
    if (objetivo === 'vender') {
      corpoPartes.push(`Depois de muita procura, encontrei ${produto} ${rand(emojis)}`)
      if (preco) corpoPartes.push(`E o melhor: por menos de R$ ${preco.toFixed(2).replace('.',',')}!`)
      corpoPartes.push('')
      corpoPartes.push('Se você tá cansado(a) de soluções que não funcionam, essa é a hora.')
    } else if (objetivo === 'engajar') {
      corpoPartes.push(`Me conta aqui nos comentários: você também já passou por isso? ${rand(emojis)}`)
      corpoPartes.push('')
      corpoPartes.push('Marca quem precisa ver esse post 👇')
    } else {
      corpoPartes.push('Segue a gente pra mais conteúdo como esse 💙')
    }
  }
  corpoPartes.push('')
  let cta = ''
  if (rede === 'linkedin') {
    cta = 'Comente "QUERO" que eu te mando mais detalhes no DM.'
  } else if (objetivo === 'vender') {
    cta = `Clica no link da bio ${rand(emojis)}`
  } else {
    cta = 'Salva esse post pra não esquecer 🔖'
  }
  corpoPartes.push(rand(emojis) + ' ' + cta)
  const hashtags = [`#${nicho.replace(/\s+/g,'')}`, '#kiyvo', '#brasil']
  corpoPartes.push('')
  corpoPartes.push(hashtags.join(' '))
  const legenda = corpoPartes.join('\n')
  const caracteres = legenda.length
  const tamanho = caracteres < 150 ? 'curta' : caracteres < 500 ? 'media' : 'longa'
  return {
    legenda,
    hook,
    cta,
    emojis: emojis.slice(0, 4),
    tamanho,
    caracteres,
    scoreLeiturabilidade: 70 + Math.floor(Math.random()*25),
    dicas: [
      `📱 Legenda para ${rede} com ${caracteres} caracteres (${tamanho})`,
      '✨ Use quebras de linha a cada 2 frases — legibilidade em celulares é TUDO',
      '💬 Comece com pergunta ou afirmação chocante nos 125 caracteres (limite do "ver mais")',
      '👉 Coloque o CTA nos PRIMEIROS comentários também (algoritmo ama)',
      '🏷️ Hashtags: 5-10 para Instagram, 3-5 para TikTok, 3-5 para LinkedIn',
    ],
  }
}
