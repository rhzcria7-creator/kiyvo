// Agente FeedbackInterpreter — interpreta feedback de usuário e retorna categoria + sentimento
export interface FeedbackInput { texto: string; nota?: number }
export interface FeedbackResult { sentimento: 'positivo' | 'neutro' | 'negativo' | 'misto'; categorias: string[]; prioridade: 'baixa' | 'media' | 'alta' | 'urgente'; respostaAutomatica: string }

const POS = ['ótimo','otimo','excelente','perfeito','maravilhoso','adorei','amei','incrivel','incrível','recomendo','funcionou','gostei','obrigado','parabéns']
const NEG = ['ruim','péssimo','pessimo','horrível','horrivel','não funciona','nao funciona','problema','erro','não recebi','nao recebi','golpe','reembolso','decepcionado','devo','não abre','nao abre','lento','travou','quero cancelar']
const CAT_PALAVRAS: Record<string, string[]> = {
  bug_tecnico: ['erro','não funciona','bug','quebrado','travou','lento','não abre'],
  cobranca: ['cobrança','cobranca','cobrado','estorno','reembolso','cancelar assinatura'],
  entrega: ['não recebi','nao recebi','codigo','chave','acesso'],
  suporte: ['atendimento','resposta demorou','suporte não responde','não respondem'],
  conteudo: ['conteúdo','aula','video','material','expectativa'],
  elogio: ['parabéns','excelente','adorei','recomendo','perfeito'],
  sugestao: ['poderia','seria melhor','sugiro','deveriam'],
}

export function interpretarFeedback(input: FeedbackInput): FeedbackResult {
  const { texto, nota } = input
  const l = texto.toLowerCase()
  const pos = POS.filter(p => l.includes(p)).length
  const neg = NEG.filter(p => l.includes(p)).length
  let sent: FeedbackResult['sentimento'] = 'neutro'
  if (nota !== undefined) {
    if (nota >= 4) sent = 'positivo'
    else if (nota <= 2) sent = 'negativo'
    else sent = 'misto'
  }
  if (pos > neg) sent = 'positivo'
  else if (neg > pos) sent = 'negativo'
  else if (pos && neg) sent = 'misto'
  const cats: string[] = []
  for (const [cat, pals] of Object.entries(CAT_PALAVRAS)) if (pals.some(p => l.includes(p))) cats.push(cat)
  let prio: FeedbackResult['prioridade'] = 'baixa'
  if (sent === 'negativo') prio = 'alta'
  if (cats.includes('bug_tecnico') || cats.includes('cobranca')) prio = 'urgente'
  if (sent === 'misto' || cats.includes('sugestao')) prio = 'media'
  const res = sent === 'positivo'
    ? 'Agradecemos o feedback! Sua avaliação ajuda a gente a evoluir. Aproveite o produto e qualquer coisa, estamos aqui.'
    : sent === 'negativo'
    ? 'Lamento muito pelo ocorrido. Vou encaminhar seu caso para o time de suporte agora e você terá resposta em até 24h. Você será ressarcido em até 48h se o problema não for resolvido.'
    : sent === 'misto'
    ? 'Obrigado pelo feedback honesto! Vamos anotar sua sugestão e entrar em contato para resolver o ponto que não saiu como esperado.'
    : 'Obrigado pelo contato! Nossa equipe já recebeu sua mensagem.'
  return { sentimento: sent, categorias: cats.length ? cats : ['geral'], prioridade: prio, respostaAutomatica: res }
}
