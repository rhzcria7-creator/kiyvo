// Agente QuizFunnel — gera quiz/funil de perguntas para segmentar e recomendar
export interface QuizFunnelInput {
  nicho: string
  objetivo?: string
  publico?: string
  produto?: string
  totalPerguntas?: number
}
export interface QuizPergunta {
  id: string
  pergunta: string
  opcoes: Array<{ id: string; texto: string; pontos: number; recomenda?: string }>
}
export interface QuizFunnelResult {
  titulo: string
  subtitulo: string
  paginaResultadoTitulo: string
  perguntas: QuizPergunta[]
  segmentos: Array<{ perfil: string; recomendacao: string; oferta: string }>
  taxasConversaoEstimada: number
}

export function gerarQuiz(input: QuizFunnelInput): QuizFunnelResult {
  const { nicho, objetivo = 'vender', publico = 'iniciantes', produto = 'produto', totalPerguntas = 5 } = input
  const n = Math.max(3, Math.min(8, totalPerguntas))
  const perguntas: QuizPergunta[] = []
  perguntas.push({
    id: 'q1',
    pergunta: `Qual seu nível de experiência com ${nicho}?`,
    opcoes: [
      { id: 'q1_a', texto: 'Estou começando do zero', pontos: 0, recomenda: 'Iniciante' },
      { id: 'q1_b', texto: 'Já tenho algum conhecimento básico', pontos: 5 },
      { id: 'q1_c', texto: 'Sou intermediário/avançado', pontos: 10 },
    ],
  })
  perguntas.push({
    id: 'q2',
    pergunta: `Qual seu principal objetivo com ${nicho}?`,
    opcoes: [
      { id: 'q2_a', texto: 'Ganhar dinheiro extra / renda online', pontos: 10, recomenda: 'Monetização' },
      { id: 'q2_b', texto: 'Aprender por hobby / crescimento pessoal', pontos: 5 },
      { id: 'q2_c', texto: 'Aplicar no meu negócio atual', pontos: 8 },
      { id: 'q2_d', texto: 'Mudar de carreira', pontos: 7 },
    ],
  })
  perguntas.push({
    id: 'q3',
    pergunta: 'Quanto tempo por dia você consegue dedicar?',
    opcoes: [
      { id: 'q3_a', texto: 'Menos de 30 minutos por dia', pontos: 3 },
      { id: 'q3_b', texto: 'De 30min a 1h por dia', pontos: 7 },
      { id: 'q3_c', texto: '1h a 2h por dia', pontos: 9 },
      { id: 'q3_d', texto: 'Mais de 2h por dia', pontos: 10 },
    ],
  })
  perguntas.push({
    id: 'q4',
    pergunta: `Qual seu orçamento para investir em ${nicho} HOJE?`,
    opcoes: [
      { id: 'q4_a', texto: 'Quero começar de graça', pontos: 0 },
      { id: 'q4_b', texto: 'Até R$ 100', pontos: 3 },
      { id: 'q4_c', texto: 'R$ 100 a R$ 500', pontos: 7 },
      { id: 'q4_d', texto: 'R$ 500+', pontos: 10 },
    ],
  })
  perguntas.push({
    id: 'q5',
    pergunta: 'Se você tivesse um resultado garantido em 30 dias, qual seria?',
    opcoes: [
      { id: 'q5_a', texto: 'Primeira venda / primeiro cliente', pontos: 10 },
      { id: 'q5_b', texto: 'R$ 1k a R$ 5k por mês', pontos: 8 },
      { id: 'q5_c', texto: 'R$ 10k+ por mês', pontos: 10 },
      { id: 'q5_d', texto: 'Sair do emprego', pontos: 9 },
    ],
  })
  // Preenche até n perguntas
  while (perguntas.length < n) {
    perguntas.push({
      id: `q${perguntas.length + 1}`,
      pergunta: `Qual é seu maior desafio em ${nicho} no momento?`,
      opcoes: [
        { id: `q${perguntas.length + 1}_a`, texto: 'Não sei por onde começar', pontos: 5 },
        { id: `q${perguntas.length + 1}_b`, texto: 'Travei no meio do caminho', pontos: 7 },
        { id: `q${perguntas.length + 1}_c`, texto: 'Não consigo vender', pontos: 9 },
        { id: `q${perguntas.length + 1}_d`, texto: 'Quero escalar', pontos: 10 },
      ],
    })
  }
  return {
    titulo: `Quiz: descubra o ${produto} ideal para você em ${Math.round(n * 0.5)} minutos`,
    subtitulo: `Responda ${n} perguntas rápidas e receba uma recomendação personalizada de ${nicho}.`,
    paginaResultadoTitulo: 'Perfeito! Com base nas suas respostas, separei algo ideal para você 👇',
    perguntas: perguntas.slice(0, n),
    segmentos: [
      { perfil: 'Iniciante Total', recomendacao: `Comece pelo ${produto} Básico + trilha gratuita de ${nicho}.`, oferta: 'Oferta exclusiva: R$ 29,90 à vista (60% OFF)' },
      { perfil: 'Intermediário Determinado', recomendacao: `${produto} Completo com suporte 1:1 inicial.`, oferta: 'Oferta: 12x de R$ 9,74 ou 15% OFF à vista' },
      { perfil: 'Avançado que quer escalar', recomendacao: `${produto} PRO + mentoria em grupo + bônus avançados.`, oferta: 'Oferta PRO: R$ 497 à vista com R$ 2k em bônus' },
    ],
    taxasConversaoEstimada: 32,
  }
}
