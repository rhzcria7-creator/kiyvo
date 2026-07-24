// Agente EmailSequencia — sequência de e-mails pronta em 7 dias
export interface EmailSeqInput { produto: string; publico?: string; preco?: number; nicho?: string }
export interface EmailResult { assunto: string; corpo: string; dia: number }
export interface EmailSeqResult { sequencia: EmailResult[]; assuntoAbertura: string; dicas: string[] }

export function gerarSequenciaEmails(input: EmailSeqInput): EmailSeqResult {
  const { produto, publico = 'você', preco = 97, nicho = 'nicho' } = input
  const sequencia: EmailResult[] = [
    { dia: 0, assunto: `Sua cópia gratuita de ${produto} chegou`, corpo: `Oi ${publico},\n\nVi que você se interessou por ${nicho}, então preparei um presente: uma mini-aula gratuita que mostra o primeiro passo.\n\nÉ só clicar aqui para baixar.\n\nAbs,\nEquipe KIYVO` },
    { dia: 1, assunto: `O erro que 90% cometem em ${nicho}`, corpo: `Oi ${publico},\n\nHoje quero te contar o erro mais comum: a maioria pula o básico e quer resultado em 24h.\n\n${produto} resolve exatamente isso.\n\nTe espero lá.` },
    { dia: 2, assunto: `História real: como saí do zero usando ${produto}`, corpo: `Oi,\n\nDeixa eu te contar uma história rápida. Quando comecei em ${nicho}, travava na mesma etapa há meses...\n\nDepois que descobri o método dentro de ${produto}, tudo mudou em 3 semanas.` },
    { dia: 3, assunto: `Por R$ ${preco}, você pode mudar de vida?`, corpo: `${produto} custa só R$ ${preco} — menos do que um pizza por semana.\n\nMas atenção: o preço sobe em 48h.` },
    { dia: 4, assunto: `🚨 ${produto} — 24h pro aumento`, corpo: 'Faltam só 24h.\n\nDepois disso o preço volta ao normal.' },
    { dia: 5, assunto: `RE: última chance de pegar com desconto`, corpo: 'Último aviso. Hoje à noite o carrinho fecha.' },
    { dia: 6, assunto: `Carrinho fechado! Mas deixei uma última vaga pra você`, corpo: `Oi,\n\nSe você perdeu a oferta, relaxa. Deixei uma vaga extra só pra você pelos próximos 60 minutos.` },
  ]
  return {
    sequencia,
    assuntoAbertura: `O que ninguém te conta sobre ${nicho}`,
    dicas: ['Envie o primeiro email nos primeiros 5 minutos após cadastro.', 'Use nome pessoal no remetente, não "equipe marketing".', 'Linhas curtas, 1-3 frases por parágrafo.', 'CTA 1 por email.', 'Teste assunto A/B sempre.'],
  }
}
