// Agente RiskScore — score de risco antifraude (agente invisível)
export interface RiskInput {
  valor: number; novoCliente?: boolean; emailIdadeDias?: number; mesmoIPqueAntes?: boolean;
  pais?: string; cartaoPaisDiferente?: boolean; horario?: number; tentativasFalhas?: number; msmDeviceUsado?: boolean;
}
export interface RiskResult { score: number; decisao: 'aprovar' | 'revisao' | 'recusar'; fatores: string[]; recomendacoes: string[] }

export function calcularRisco(input: RiskInput): RiskResult {
  const { valor, novoCliente = true, emailIdadeDias = 0, mesmoIPqueAntes = false, pais = 'BR', cartaoPaisDiferente = false, horario = new Date().getHours(), tentativasFalhas = 0, msmDeviceUsado = false } = input
  let score = 100
  const fatores: string[] = []
  if (novoCliente) { score -= 15; fatores.push('Cliente novo (sem histórico)') }
  if (emailIdadeDias < 7) { score -= 20; fatores.push('Email criado há menos de 7 dias') }
  if (cartaoPaisDiferente) { score -= 25; fatores.push('País do cartão diferente do IP') }
  if (pais !== 'BR') { score -= 10; fatores.push(`País ${pais} fora do Brasil`) }
  if (horario >= 1 && horario <= 5) { score -= 8; fatores.push('Compra na madrugada') }
  if (tentativasFalhas >= 3) { score -= 25; fatores.push(`${tentativasFalhas} tentativas falhas recentes`) }
  if (!msmDeviceUsado && !novoCliente) { score -= 10; fatores.push('Novo dispositivo') }
  if (valor >= 2000 && novoCliente) { score -= 15; fatores.push('Valor alto para cliente novo') }
  if (!novoCliente && mesmoIPqueAntes) { score += 15; fatores.push('Cliente recorrente mesmo IP (bom)') }
  score = Math.max(0, Math.min(100, score))
  let decisao: RiskResult['decisao'] = 'revisao'
  if (score >= 75) decisao = 'aprovar'
  else if (score <= 35) decisao = 'recusar'
  const recomendacoes: string[] = []
  if (decisao === 'revisao') recomendacoes.push('Pedir confirmação por email/sms antes de aprovar.')
  if (cartaoPaisDiferente) recomendacoes.push('Verificar geolocalização do IP.')
  if (decisao === 'recusar') recomendacoes.push('Recusar pagamento automaticamente por antifraude.')
  if (!recomendacoes.length) recomendacoes.push('Aprovar automaticamente sem intervenção.')
  return { score, decisao, fatores, recomendacoes }
}
