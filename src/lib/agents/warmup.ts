// Agente WarmupDomains — plano de aquecimento de domínio para emails
export interface WarmupInput { dominio: string; dias?: number; volumeDiarioInicial?: number }
export interface WarmupResult { plano: Array<{ dia: number; enviar: number; lista: string; assuntos: string[] }>; taxaEsperadaEntrega: number; dicas: string[] }

export function gerarPlanoWarmup(input: WarmupInput): WarmupResult {
  const { dominio, dias = 14, volumeDiarioInicial = 10 } = input
  const plano = []
  let enviar = volumeDiarioInicial
  for (let dia = 1; dia <= dias; dia++) {
    const fator = dia <= 7 ? 0.5 + dia * 0.3 : 1 + (dia - 7) * 0.2
    enviar = Math.round(volumeDiarioInicial * fator)
    const lista = dia <= 7 ? 'Sua lista (segmentada engajada)' : 'Lista completa gradativamente'
    const assuntos = [`Re: [${dominio}]`, `Atualização`, `Novidades`, `Respondendo sua dúvida`, `Rápido aviso`, `Conteúdo novo`, `Caso real`, `Última chance`].slice(0, 3)
    plano.push({ dia, enviar, lista, assuntos })
  }
  return {
    plano,
    taxaEsperadaEntrega: 90 + Math.round(Math.random() * 7),
    dicas: [
      'Configure SPF, DKIM e DMARC corretamente antes de começar.',
      'Envie para contatos reais (amigos, seu próprio email) e peça para responder.',
      'Não envie promoção nos primeiros 7 dias — envie valor e conversas reais.',
      'Use tool como MailReach/Mailwarm para acelerar o warmup.',
      'Se cair em spam, pause e só envie 1:1 por 3 dias.',
    ],
  }
}
