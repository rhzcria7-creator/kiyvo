// Agente GradeHorarios — sugere a melhor grade semanal de criação de conteúdo
export interface GradeInput {
  nicho?: string
  horasPorDia?: number
  redes?: string[]
  diasPorSemana?: number
}
export interface GradeDia {
  dia: string
  tarefas: Array<{ horario: string; tarefa: string; duracaoMin: number; categoria: string }>
  tema: string
}
export interface GradeResult {
  resumo: string
  totalHorasSemana: number
  postsPorSemana: number
  grade: GradeDia[]
  ferramentasSugeridas: string[]
}

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const TEMAS_SEMANA = ['Educação/valor', 'Engajamento/pergunta', 'Prova social', 'Venda direta', 'Storytelling/caso', 'Vida real/rotina', 'Planejamento']

export function gerarGrade(input: GradeInput): GradeResult {
  const { horasPorDia = 2, redes = ['Instagram', 'TikTok'], diasPorSemana = 6 } = input
  const grade: GradeDia[] = []
  let postsSemana = 0
  for (let i = 0; i < Math.min(7, diasPorSemana || 7); i++) {
    const tema = TEMAS_SEMANA[i]
    const tarefas: GradeDia['tarefas'] = []
    let hora = 8
    tarefas.push({ horario: `${hora}:00`, tarefa: 'Responder comentários e DM (redes)', duracaoMin: 20, categoria: 'engajamento' })
    hora = 9
    tarefas.push({ horario: `${hora}:00`, tarefa: `Criar conteúdo do dia: 1 Reel/TikTok sobre ${tema}`, duracaoMin: 60, categoria: 'criacao' })
    hora = 10
    tarefas.push({ horario: `${hora}:00`, tarefa: `Post no feed + stories em ${redes.join(', ')}`, duracaoMin: 20, categoria: 'publicacao' })
    postsSemana += 1
    if (horasPorDia >= 2) {
      tarefas.push({ horario: '14:00', tarefa: 'Interagir com 15 contas do nicho', duracaoMin: 20, categoria: 'crescimento' })
      tarefas.push({ horario: '19:30', tarefa: `Stories de fim de dia (pergunta + bastidores) em ${redes[0]}`, duracaoMin: 15, categoria: 'publicacao' })
    }
    if (i === 4 /*sexta*/) {
      tarefas.push({ horario: '20:00', tarefa: 'Live semanal 1h: tira-dúvidas e oferta', duracaoMin: 60, categoria: 'live' })
    }
    grade.push({ dia: DIAS[i], tarefas, tema })
  }
  const totalHorasSemana = Math.round((grade.reduce((s, d) => s + d.tarefas.reduce((ss, t) => ss + t.duracaoMin, 0), 0) / 60) * 10) / 10
  return {
    resumo: `Grade para ${diasPorSemana} dias por semana, ${horasPorDia}h por dia, em ${redes.join(', ')}.`,
    totalHorasSemana,
    postsPorSemana: postsSemana,
    grade,
    ferramentasSugeridas: ['Canva (criativos)', 'CapCut (edição)', 'Notion (plano)', 'Metricool/Buffer (agendamento)', 'KIYVO Agents (copy e scripts)'],
  }
}
