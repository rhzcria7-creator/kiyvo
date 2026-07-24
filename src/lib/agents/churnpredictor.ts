// Agente ChurnPredictor — prediz risco de evasão do usuário
// Agente invisível: acionado em login/uso e sugere ações de retenção
export interface ChurnInput {
  diasDesdeUltimaCompra?: number
  diasDesdeUltimoLogin?: number
  totalCompras: number
  totalAbandonosCarrinho?: number
  reembolsos?: number
  ticketsAbertos?: number
  abriuEmailUltimos30d?: number
  visitasUltimos7d?: number
  nivelSatisfacao?: number // 1-5
  plano?: 'free' | 'plus' | 'pro' | 'vendor_pro'
}

export interface ChurnResult {
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  score: number // 0-100
  probabilidadeChurn: number // 0-1
  acoesRecomendadas: string[]
  ofertaKD?: number
  ofertaCupom?: string
  mensagemKiya: string
}

export function preverChurn(input: ChurnInput): ChurnResult {
  const {
    diasDesdeUltimaCompra = 999,
    diasDesdeUltimoLogin = 999,
    totalCompras = 0,
    totalAbandonosCarrinho = 0,
    reembolsos = 0,
    ticketsAbertos = 0,
    abriuEmailUltimos30d = 0,
    visitasUltimos7d = 0,
    nivelSatisfacao = 5,
    plano = 'free',
  } = input
  let score = 0
  const fatores: string[] = []
  if (diasDesdeUltimoLogin > 60) { score += 35; fatores.push('Usuário não acessa há mais de 60 dias.') }
  else if (diasDesdeUltimoLogin > 30) { score += 20; fatores.push('Inativo há 30+ dias.') }
  else if (diasDesdeUltimoLogin > 14) { score += 10; fatores.push('Inativo há 14+ dias.') }
  if (totalCompras === 0 && diasDesdeUltimoLogin > 3) { score += 25; fatores.push('Cadastrou e nunca comprou.') }
  if (diasDesdeUltimaCompra > 90 && totalCompras > 0) { score += 25; fatores.push('Não compra há mais de 90 dias.') }
  if (totalAbandonosCarrinho > 3) { score += 10; fatores.push('Abandonou mais de 3 carrinhos recentemente.') }
  if (reembolsos > 1) { score += 15; fatores.push('Pediu mais de 1 reembolso.') }
  if (ticketsAbertos > 2) { score += 10; fatores.push('Abriu múltiplos tickets — provavelmente frustrado.') }
  if (abriuEmailUltimos30d === 0 && totalCompras > 0) { score += 10; fatores.push('Não abre emails há 30 dias.') }
  if (visitasUltimos7d === 0 && totalCompras > 0) { score += 10; fatores.push('Nenhuma visita nos últimos 7 dias.') }
  if (nivelSatisfacao <= 2) { score += 20; fatores.push('Satisfação baixa (≤2/5).') }
  if (plano === 'free' && totalCompras === 0) score += 10
  score = Math.min(100, score)
  let risco: ChurnResult['risco'] = 'baixo'
  if (score >= 75) risco = 'critico'
  else if (score >= 55) risco = 'alto'
  else if (score >= 30) risco = 'medio'
  const acoes: string[] = []
  let ofertaKD = 0
  let ofertaCupom: string | undefined
  if (risco === 'critico') {
    acoes.push('Enviar email personalizado da Kiya com oferta de boas-vindas de volta.')
    acoes.push('Notificar push com "sentimos sua falta" + 300 KD points.')
    acoes.push('Cupom VOLTA30 — 30% OFF em qualquer produto digital.')
    ofertaKD = 300
    ofertaCupom = 'VOLTA30'
  } else if (risco === 'alto') {
    acoes.push('Enviar lembrete com produtos relacionados às últimas visitas.')
    acoes.push('Oferecer 150 KD points por login nos próximos 3 dias.')
    acoes.push('Cupom BEMVINDO15 — 15% OFF.')
    ofertaKD = 150
    ofertaCupom = 'BEMVINDO15'
  } else if (risco === 'medio') {
    acoes.push('Mostrar KiyaWidget proativa com sugestões personalizadas.')
    acoes.push('Enviar newsletter semanal com novidades do nicho.')
    ofertaKD = 50
  } else {
    acoes.push('Manter fluxo padrão.')
    acoes.push('Recomendar upgrade de plano com 10% OFF.')
  }
  const mensagemKiya = risco === 'critico'
    ? 'Ei, percebi que você sumiu por aqui! 😢 Preparei um presente: 300 KD points e 30% OFF pra você voltar com tudo.'
    : risco === 'alto'
    ? 'Sentimos sua falta! Que tal dar uma olhada nas novidades? Tem ofertas esperando por você.'
    : risco === 'medio'
    ? 'As novidades de hoje tão MUITO boas, separei 3 que combinam com você.'
    : 'Você está arrasando, continue assim! 🚀'
  return {
    risco,
    score,
    probabilidadeChurn: Math.round(score) / 100,
    acoesRecomendadas: acoes,
    ofertaKD,
    ofertaCupom,
    mensagemKiya,
  }
}
