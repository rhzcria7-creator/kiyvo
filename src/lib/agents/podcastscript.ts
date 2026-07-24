// Agente PodcastScript — gera pauta de podcast/entrevista
export interface PodcastInput { tema: string; convidado?: string; duracao?: number }
export interface Bloco { tempo: string; tipo: string; descricao: string; perguntas?: string[] }
export interface PodcastResult { tituloEpisodio: string; descricao: string; blocos: Bloco[]; tags: string[]; perguntasChave: string[] }

export function gerarPodcast(input: PodcastInput): PodcastResult {
  const { tema, convidado = 'especialista', duracao = 40 } = input
  const blocos: Bloco[] = [
    { tempo: '0:00-2:00', tipo: 'abertura', descricao: 'Vinheta + apresentação do episódio, convidado e tema' },
    { tempo: '2:00-5:00', tipo: 'warmup', descricao: `Perguntas leves: "${convidado}, quem é você e como chegou até aqui?"` , perguntas: [`${convidado}, quem é você antes de ser referência em ${tema}?`, 'Como você entrou nessa área?'] },
    { tempo: '5:00-25:00', tipo: 'conteudo', descricao: `Bloco principal: ${tema} — perguntas profundas, casos e lições.`,
      perguntas: [
        `Qual o maior erro que pessoas iniciantes em ${tema} cometem?`,
        `Como você faz ${tema} no seu dia a dia?`,
        `Qual o momento que tudo mudou pra você nesse tema?`,
        `Quais as 3 maiores crenças limitantes em ${tema}?`,
        `Se tivesse que recomeçar hoje, o que faria diferente?`,
      ]},
    { tempo: '25:00-35:00', tipo: 'perguntas_rapidas', descricao: 'Perguntas rápidas de sim/não, livros favoritos e hábitos.' },
    { tempo: '35:00-38:00', tipo: 'cta', descricao: 'Onde encontrar o convidado + oferta/recomendação final.' },
    { tempo: '38:00-40:00', tipo: 'encerramento', descricao: 'Agradecimentos, preview do próximo episódio e vinheta final.' },
  ]
  void duracao
  return {
    tituloEpisodio: `${convidado} — o que ninguém te conta sobre ${tema}`,
    descricao: `Neste episódio, ${convidado} revela os bastidores de ${tema}, os erros mais caros e o que realmente funciona na prática.`,
    blocos, tags: [tema, 'entrevista', 'podcast', 'brasil', 'kiyo'],
    perguntasChave: blocos.flatMap(b => b.perguntas || []),
  }
}
