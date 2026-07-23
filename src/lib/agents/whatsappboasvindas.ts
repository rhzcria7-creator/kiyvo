// Agente WhatsAppBoasVindas — sequência de boas-vindas para WhatsApp/Instagram
export interface WelcomeInput { nome?: string; nicho?: string; produto?: string; tom?: 'amigavel' | 'profissional' | 'descontraido' }
export interface WelcomeResult { sequencia: Array<{ delay: string; mensagem: string }>; saudacao: string; cta: string }

export function gerarBoasVindas(input: WelcomeInput): WelcomeResult {
  const { nome = 'pessoa', nicho = 'digital', produto = 'novo método', tom = 'amigavel' } = input
  const p = nome.split(' ')[0] || 'pessoa'
  const seq = []
  if (tom === 'amigavel') {
    seq.push({ delay: '0s', mensagem: `Oi ${p}! Tudo bem? Sou a Kiya da KIYVO 🤗 Vi que você se interessou por ${nicho} e vou te ajudar.` })
    seq.push({ delay: '10s', mensagem: `Pra começar: qual sua maior dificuldade em ${nicho} agora? É só responder aqui que te mando o melhor caminho.` })
    seq.push({ delay: '2h', mensagem: `Passando pra deixar aqui o ${produto} que preparei pra você → tem ajudado bastante gente 🚀` })
    seq.push({ delay: '1d', mensagem: `${p}, viu a mensagem? Posso te mostrar o passo a passo — só responde SIM que eu sigo.` })
  } else if (tom === 'profissional') {
    seq.push({ delay: '0s', mensagem: `Olá ${p}. Seja bem-vindo(a) à KIYVO.` })
    seq.push({ delay: '30s', mensagem: `Notamos seu interesse em ${nicho}. Se precisar de suporte, basta responder esta mensagem.` })
  } else {
    seq.push({ delay: '0s', mensagem: `Ih ${p} chegou no lugar certo 🤩 Preparei um conteúdo sobre ${nicho} que você vai AMAR` })
    seq.push({ delay: '15s', mensagem: `Qual seu level em ${nicho}? (iniciante/intermediário/avançado)` })
    seq.push({ delay: '3h', mensagem: `${produto} é o que está bombando essa semana — corre que as vagas estão acabando 🔥` })
  }
  return {
    sequencia: seq,
    saudacao: `Olá ${p}! Seja bem-vindo(a) à KIYVO.`,
    cta: `Me conta: o que te traz aqui em ${nicho}?`,
  }
}
