// Agente ContentCalendar — gera calendário de 30 dias de conteúdo
// Para Reels, posts, lives, stories — com temas e CTAs
export interface CalendarInput { nicho: string; produto?: string; quantidade?: number; rede?: 'instagram'|'tiktok'|'youtube'|'geral' }
export interface CalendarDia { dia: number; semana: number; tipo: 'reel'|'post'|'story'|'live'|'carrossel'|'tutorial'; tema: string; hook: string; cta: string; emoji: string }
export interface CalendarOutput { dias: CalendarDia[]; temasChave: string[]; melhoresFormatos: {formato: string; percentual: number}[]; frequenciaRecomendada: string; ferramentasUteis: string[]; analise: string }
function formatarData(dia: number): string {
  const data = new Date(); data.setDate(data.getDate() + dia)
  return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}
export function gerarCalendario(input: CalendarInput): CalendarOutput {
  const { nicho, produto, quantidade = 30, rede = 'geral' } = input
  const temas = [
    `Erros comuns em ${nicho} (e como evitar)`,
    `3 coisas que ninguém te conta sobre ${nicho}`,
    `Tutorial rápido: resultado em 5 minutos`,
    `Mito x verdade sobre ${nicho}`,
    `Meu pior erro em ${nicho} (e o que aprendi)`,
    `Rotina de quem vive de ${nicho}`,
    `Antes e depois: o que muda quando você aplica ${nicho}`,
    `Respondendo comentários/dúvidas dos inscritos`,
    `Por onde começar em ${nicho} em 2025`,
    `Os 5 maiores mitos de ${nicho} desmentidos`,
    `Bastidores de um(a) ${nicho.replace(/\s+/g,'')}`,
    `Testando tendências de ${nicho} da semana`,
    `Checklist essencial para ${nicho}`,
    `Resumo da semana de ${nicho}`,
    `Convidei um expert pra falar sobre ${nicho}`,
  ]
  const hooks = [
    'Para TUDO o que você tá fazendo',
    'Você vai se surpreender',
    'Ninguém te conta isso...',
    'Em 30 segundos eu te mostro',
    'Eu errei isso por anos',
    'Essa dica vale OURO',
    'Me arrependi de não ver isso antes',
    '3 segredos que...',
  ]
  const tipos: CalendarDia['tipo'][] = ['reel','reel','carrossel','story','post','reel','reel','live']
  const dias: CalendarDia[] = []
  for (let i = 0; i < quantidade; i++) {
    const tema = temas[i % temas.length] + (produto && i % 5 === 0 ? ` (usando ${produto})` : '')
    const tipo = tipos[i % tipos.length]
    const diaSemana = new Date(new Date().setDate(new Date().getDate() + i)).getDay()
    const isFimDeSemana = diaSemana === 0 || diaSemana === 6
    const emojis = ['🔥','✨','💙','🚀','💡','⚡','🎯','💫']
    dias.push({
      dia: i+1,
      semana: Math.floor(i/7) + 1,
      tipo: isFimDeSemana ? (i % 3 === 0 ? 'live' : 'story') : tipo,
      tema,
      hook: hooks[i % hooks.length],
      cta: i % 4 === 0 && produto ? `Confira ${produto} no link da bio` : 'Comenta o que achou! Salva esse post 🔖',
      emoji: emojis[i % emojis.length],
    })
  }
  return {
    dias,
    temasChave: temas.slice(0, 8),
    melhoresFormatos: [
      { formato: 'Reels curtos (15-30s)', percentual: 45 },
      { formato: 'Carrosséis educativos', percentual: 20 },
      { formato: 'Stories interativos', percentual: 20 },
      { formato: 'Lives semanais', percentual: 10 },
      { formato: 'Posts longos / blog', percentual: 5 },
    ],
    frequenciaRecomendada: '5 posts/semana no feed + 3 stories/dia + 1 live/semana',
    ferramentasUteis: ['Canva para peças','CapCut para edição de vídeo','Meta Business Suite para agendar','Notion para organizar pautas','KIYVO ScriptForge para roteiros','KIYVO CaptionForge para legendas'],
    analise: `Plano de ${quantidade} dias para ${nicho}${produto?` com foco em ${produto}`:''}. Mistura entre engajamento (dicas/tutoriais), autoridade (bastidores/erros) e venda (1 em cada 5 posts). Use o ScriptForge e o CaptionForge da KIYVO para criar os conteúdos em 1 minuto.`,
  }
}
