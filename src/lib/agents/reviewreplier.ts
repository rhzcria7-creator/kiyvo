// Agente ReviewReplier — gera respostas automáticas para avaliações
export interface ReviewReplierInput {
  nota: number // 1-5
  comentario?: string
  nomeCliente?: string
  nomeLoja?: string
  tom?: 'profissional' | 'amigavel' | 'formal' | 'carismático'
  publica?: boolean
}
export interface ReviewReplierResult {
  resposta: string
  tom: string
  pedirParaAtualizar?: string
  nota: number
}

export function gerarRespostaReview(input: ReviewReplierInput): ReviewReplierResult {
  const { nota, comentario = '', nomeCliente = 'cliente', nomeLoja = 'KIYVO', tom = 'amigavel' } = input
  const first = nomeCliente.split(/\s+/)[0].trim() || 'cliente'
  let resposta = ''
  let pedirAtualizar: string | undefined
  if (nota >= 5) {
    resposta =
      tom === 'profissional'
        ? `${first}, agradecemos imensamente pela sua avaliação de 5 estrelas! Feedback como o seu nos motiva a continuar entregando o melhor. A equipe ${nomeLoja} fica muito feliz com a sua satisfação.`
        : `Muito obrigado, ${first}! 🎉 Que alegria ler sua avaliação de 5 estrelas — é por você que fazemos tudo com tanta dedicação. Compartilha com a gente se precisar de qualquer coisa! Equipe ${nomeLoja}.`
  } else if (nota === 4) {
    resposta = `${first}, obrigado por sua avaliação! Ficamos felizes que gostou, e vamos usar seu feedback para melhorar ainda mais. Qualquer ponto que achar que podemos aperfeiçoar, chama a gente! Abs, ${nomeLoja}.`
  } else if (nota === 3) {
    resposta = `${first}, agradecemos seu feedback sincero. Sentimos muito que sua experiência não foi perfeita. Queremos resolver: chame nosso suporte pelo chat que vamos corrigir o que ficou faltando pra você sair 100% satisfeito. Atenciosamente, ${nomeLoja}.`
    pedirAtualizar = `Oi ${first}, atualize sua avaliação depois que o problema for resolvido? Isso ajuda a gente a continuar melhorando.`
  } else if (nota === 2) {
    resposta = `${first}, pedimos sinceras desculpas pela sua experiência. Isso está longe do padrão que prometemos. Me chame pessoalmente no suporte — vou acompanhar pessoalmente seu caso até resolver. Equipe ${nomeLoja}.`
    pedirAtualizar = `Oi ${first}, vamos resolver tudo. Quando o problema estiver resolvido, nos dá uma nova chance atualizando sua avaliação?`
  } else {
    resposta = `${first}, li sua avaliação e quero pedir desculpas pessoalmente pelo ocorrido. Sua experiência foi frustrante, e isso não é aceitável. Me procure no chat privado — vou resolver isso HOJE, não importa o que aconteça. Atenciosamente, Equipe ${nomeLoja}.`
    pedirAtualizar = `Oi ${first}, vamos resolver tudo rapidinho para você. Depois que ficar satisfeito, poderia reavaliar? Sua opinião é importante demais pra gente.`
  }
  // Se tem comentário negativo específico, adicionar reconhecimento
  const low = comentario.toLowerCase()
  if (nota <= 3) {
    if (low.includes('demor') || low.includes('atraso') || low.includes('lento')) {
      resposta += ' Entendi que o prazo foi um problema — vamos ajustar isso com prioridade.'
    } else if (low.includes('suporte') || low.includes('atendimento')) {
      resposta += ' Seu feedback sobre atendimento já foi direcionado ao time responsável.'
    } else if (low.includes('qualidade') || low.includes('esperava')) {
      resposta += ' Vamos revisar o material do produto com base no que você comentou.'
    }
  }
  return { resposta, tom, pedirParaAtualizar: pedirAtualizar, nota }
}
