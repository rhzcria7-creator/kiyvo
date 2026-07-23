// Agente AntiFraude — detecção de compras suspeitas (invisível, roda no checkout)
// Regras heurísticas inspiradas em sistemas de fraude BR
export interface FraudeSinal { regra: string; severidade: 'baixa'|'media'|'alta'; pontuacao: number }
export interface CheckoutDados {
  valor: number
  ipPais?: string
  email: string
  nome: string
  paisCartao?: string
  emailIdade?: number // dias desde criação
  tentativasRecentes?: number
  pedidosPassados?: number
  valorHistorico?: number
  dominiosEmail?: string[]
  velocidadeCheckout?: number // segundos da entrada ao clique de compra
  cpf?: string
  cepCorresponde?: boolean
  riscoChargeback?: boolean
  ipProxy?: boolean
}
export interface FraudeAnalise { risco: 'baixo'|'medio'|'alto'|'critico'; pontuacao: number; sinais: FraudeSinal[]; acao: 'aprovar'|'revisar'|'recusar'|'2fa'; justificativa: string }
const DOMINIOS_DESCARTAVEIS = ['tempmail','10minutemail','guerrillamail','mailinator','throwaway','yopmail','trashmail','sharklasers','getnada','dropmail']
const CPF_INVALIDOS_CONHECIDOS = ['00000000000','11111111111','22222222222','33333333333','44444444444','55555555555','66666666666','77777777777','88888888888','99999999999','12345678909']
export function analisarRiscoFraude(d: CheckoutDados): FraudeAnalise {
  const sinais: FraudeSinal[] = []
  let pont = 0
  // Sinal: email descartável
  const dom = d.email.split('@')[1]?.toLowerCase() || ''
  if (DOMINIOS_DESCARTAVEIS.some(x => dom.includes(x))) { sinais.push({ regra: 'E-mail temporário/descartável', severidade:'alta', pontuacao: 50 }); pont += 50 }
  // Sinal: alta velocidade (bot)
  if (d.velocidadeCheckout !== undefined && d.velocidadeCheckout < 8) { sinais.push({ regra: 'Checkout muito rápido (<8s, suspeito de bot)', severidade:'media', pontuacao: 25 }); pont += 25 }
  // Sinal: tentativas recentes demais
  if ((d.tentativasRecentes || 0) > 3) { sinais.push({ regra: 'Muitas tentativas recentes de checkout', severidade:'media', pontuacao: 20 }); pont += 20 }
  // Sinal: valor muito alto para cliente novo
  if ((d.pedidosPassados || 0) === 0 && d.valor > 2000) { sinais.push({ regra: 'Primeiro pedido com valor muito alto (R$ 2k+)', severidade:'media', pontuacao: 20 }); pont += 20 }
  // Sinal: email recente
  if ((d.emailIdade || 999) < 3) { sinais.push({ regra: 'Conta de e-mail com menos de 3 dias', severidade:'media', pontuacao: 25 }); pont += 25 }
  // Sinal: país IP diferente do país cartão
  if (d.paisCartao && d.ipPais && d.paisCartao !== d.ipPais) { sinais.push({ regra: 'IP e cartão em países diferentes', severidade:'alta', pontuacao: 40 }); pont += 40 }
  // Sinal: proxy/VPN
  if (d.ipProxy) { sinais.push({ regra: 'IP de proxy/VPN detectado', severidade:'baixa', pontuacao: 10 }); pont += 10 }
  // Sinal: CPF conhecido como inválido
  if (d.cpf && CPF_INVALIDOS_CONHECIDOS.includes(d.cpf.replace(/\D/g,''))) { sinais.push({ regra: 'CPF na blacklist', severidade:'critica' as any, pontuacao: 100 }); pont += 100 }
  // Sinal: CEP não corresponde ao cartão
  if (d.cepCorresponde === false) { sinais.push({ regra: 'CEP de entrega diferente do endereço do cartão', severidade:'media', pontuacao: 20 }); pont += 20 }
  // Sinal: histórico de chargeback
  if (d.riscoChargeback) { sinais.push({ regra: 'Histórico prévio de chargeback', severidade:'alta', pontuacao: 60 }); pont += 60 }
  // Sinal: nome muito curto ou numérico
  if (d.nome.replace(/\s+/g,'').length < 5 || /^[0-9\W]+$/.test(d.nome)) { sinais.push({ regra: 'Nome inválido/suspeito', severidade:'baixa', pontuacao: 15 }); pont += 15 }
  pont = Math.min(100, pont)
  let risco: FraudeAnalise['risco'] = 'baixo'
  let acao: FraudeAnalise['acao'] = 'aprovar'
  let justificativa = 'Compra aprovada automaticamente. Sem sinais críticos de fraude.'
  if (pont >= 90) { risco = 'critico'; acao = 'recusar'; justificativa = 'Múltiplos sinais críticos de fraude. Pedido recusado automaticamente.' }
  else if (pont >= 60) { risco = 'alto'; acao = 'revisar'; justificativa = 'Risco alto de fraude. Pedido entra em análise manual antes da aprovação.' }
  else if (pont >= 30) { risco = 'medio'; acao = '2fa'; justificativa = 'Risco médio. Solicitar verificação 2FA antes de aprovar.' }
  return { risco, pontuacao: pont, sinais, acao, justificativa }
}
