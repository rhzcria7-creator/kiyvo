// Agente CuponMaker — gera cupons inteligentes com datas, códigos e estratégia
export interface CuponMakerInput {
  objetivo: 'aquecer' | 'abandonar_carrinho' | 'boas_vindas' | 'reativacao' | 'aniversario' | 'blackfriday' | 'primeira_compra' | 'afiliado' | 'freela'
  ticketMedio?: number
  descontoMaximo?: number
  nome?: string
}
export interface CuponMakerOutput {
  codigo: string
  descricao: string
  descontoTipo: 'percentual' | 'fixed'
  descontoValor: number
  validadeDias: number
  valorMinimo?: number
  limiteUsos?: number
  publicoAlvo: string
  gatilhoEnvio: string
  copyWhatsapp: string
  copyEmail: string
  score: number
  estrategia: string
}
export function gerarCupom(input: CuponMakerInput): CuponMakerOutput {
  const { objetivo, ticketMedio = 97, nome = 'KIYVO' } = input
  const prefixos: Record<string, string[]> = {
    aquecer: ['QUENTE','VOLTA','AQUECER','FOMO'],
    abandonar_carrinho: ['VOLTA','ESQUECI','NAOSAI','PEGUEI'],
    boas_vindas: ['BEMVINDO','NOVO','WELCOME','HELLO'],
    reativacao: ['SAUDADES','VOLTA','SUMIU','SENTIMOS'],
    aniversario: ['NIVER','BDAY','FELIZ','ANIVERSARIO'],
    blackfriday: ['BF','BLACK','BLACKFRIDAY','SEXTOU'],
    primeira_compra: ['PRIMEIRA','NOVO10','PRIMEIRO','FIRST'],
    afiliado: ['AMIGO','INDICA','AMIGOS','FRIEND'],
    freela: ['FREELA','FREELA10','PROJETO','JOB'],
  }
  const prefs = prefixos[objetivo] || ['KIYVO']
  const sufixo = Math.floor(Math.random()*90+10)
  const codigo = `${prefs[Math.floor(Math.random()*prefs.length)]}${sufixo}`
  let descontoTipo: 'percentual'|'fixed' = 'percentual'
  let descontoValor = 10
  let validadeDias = 7
  let valorMinimo: number | undefined
  let limiteUsos: number | undefined
  let publicoAlvo = ''
  let gatilhoEnvio = ''
  let estrategia = ''
  switch(objetivo) {
    case 'boas_vindas':
      descontoValor = 10; validadeDias = 30; publicoAlvo = 'Novos leads e cadastros'; gatilhoEnvio = 'Logo após cadastro'; estrategia = 'Baixa barreira de entrada para primeira compra'; valorMinimo = Math.round(ticketMedio*0.5); break
    case 'abandonar_carrinho':
      descontoValor = 10; validadeDias = 2; publicoAlvo = 'Usuários que abandonaram o carrinho'; gatilhoEnvio = '1h, 24h e 47h após abandono'; estrategia = 'Urgência de 48h para fechar a compra'; valorMinimo = Math.round(ticketMedio*0.7); break
    case 'reativacao':
      descontoValor = 15; validadeDias = 7; publicoAlvo = 'Inativos há 30+ dias'; gatilhoEnvio = '30 dias sem compra'; estrategia = 'Desconto maior para recuperar cliente perdido'; break
    case 'aniversario':
      descontoValor = 20; validadeDias = 15; publicoAlvo = 'Clientes no mês do aniversário'; gatilhoEnvio = 'No dia do aniversário'; estrategia = 'Conexão emocional + presente'; break
    case 'blackfriday':
      descontoValor = 30; validadeDias = 5; publicoAlvo = 'Todos'; gatilhoEnvio = 'Semana da BF'; estrategia = 'Maior desconto do ano, CTA massivo'; limiteUsos = 1000; break
    case 'primeira_compra':
      descontoValor = 15; validadeDias = 14; publicoAlvo = 'Primeira compra'; gatilhoEnvio = 'Pré-checkout'; estrategia = 'Incentivo para virar cliente'; break
    case 'afiliado':
      descontoValor = 10; validadeDias = 30; publicoAlvo = 'Quem vem de link de afiliado'; gatilhoEnvio = 'Ao clicar no link do afiliado'; estrategia = 'Rastrear afiliado + dar desconto exclusivo'; break
    case 'freela':
      descontoValor = 10; descontoTipo = 'fixed'; validadeDias = 14; publicoAlvo = 'Freelancers e clientes freela'; gatilhoEnvio = 'Após cadastro como freela'; estrategia = 'Incentivar primeiro job'; break
    case 'aquecer':
      descontoValor = 7; validadeDias = 3; publicoAlvo = 'Visitantes engajados (muitas visitas)'; gatilhoEnvio = 'Após 3 visitas ao produto'; estrategia = 'Push para quem já está quente'; break
  }
  const copyWhatsapp = `🔥 *Cupom exclusivo KIYVO!*\n\nUse o código *${codigo}* e ganhe *${descontoValor}${descontoTipo==='percentual'?'%':' reais'} OFF* ${valorMinimo?`em compras acima de R$ ${valorMinimo}`:'em todo o site'}!\n\n⚠️ Válido por ${validadeDias} dias. Corre que é por tempo limitado!\n\n🛍️ ${nome}`
  const copyEmail = {
    assunto: `Seu cupom ${codigo} está esperando 🎁`,
    preheader: `${descontoValor}${descontoTipo==='percentual'?'%':' reais'} OFF só pra você`,
    corpo: `Olá!\n\nPreparamos um cupom exclusivo pra você: ${codigo}\n\nDesconto: ${descontoValor}${descontoTipo==='percentual'?'%':' reais'} OFF${valorMinimo?` (mínimo R$ ${valorMinimo})`:''}\nVálido por: ${validadeDias} dias\n\n${estrategia}\n\nBasta inserir no checkout. Boas compras!`,
  }
  return {
    codigo,
    descricao: `Cupom ${descontoValor}${descontoTipo==='percentual'?'%':' reais'} OFF — ${objetivo.replace(/_/g,' ')}`,
    descontoTipo,
    descontoValor,
    validadeDias,
    valorMinimo,
    limiteUsos,
    publicoAlvo,
    gatilhoEnvio,
    copyWhatsapp,
    copyEmail: `${copyEmail.assunto}\n\n${copyEmail.preheader}\n\n${copyEmail.corpo}`,
    score: 70 + Math.floor(Math.random()*20),
    estrategia,
  }
}
