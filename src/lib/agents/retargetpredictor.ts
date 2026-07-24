// Agente RetargetPredictor — identifica quem deve receber retargeting
// e qual oferta/canal ideal. Agente invisível que roda em background.
export interface RetargetInput {
  visitouProduto: boolean
  addCarrinho: boolean
  iniciouCheckout: boolean
  comprou: boolean
  horasDesdeUltimoContato?: number
  vezesVoltou?: number
  valorCarrinho?: number
  abriuEmail?: boolean
  abriuWhats?: boolean
  abriuPush?: boolean
}
export interface RetargetResult {
  deveRetarget: boolean
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  melhorCanal: 'email' | 'whatsapp' | 'push' | 'ads'
  oferta: { tipo: string; valor: number; texto: string }
  timingHoras: number
  mensagem: string
}

export function preverRetarget(input: RetargetInput): RetargetResult {
  const {
    visitouProduto, addCarrinho, iniciouCheckout, comprou,
    horasDesdeUltimoContato = 999, vezesVoltou = 1, valorCarrinho = 0,
    abriuEmail = true, abriuWhats = false, abriuPush = true,
  } = input
  if (comprou) {
    return {
      deveRetarget: false,
      prioridade: 'baixa',
      melhorCanal: 'email',
      oferta: { tipo: 'upsell', valor: 10, texto: 'Oferta de pós-venda' },
      timingHoras: 24,
      mensagem: 'Obrigado pela compra! Confira os produtos recomendados.',
    }
  }
  let score = 0
  if (iniciouCheckout) score += 50
  else if (addCarrinho) score += 35
  else if (visitouProduto && vezesVoltou >= 3) score += 25
  else if (visitouProduto) score += 10
  if (horasDesdeUltimoContato < 1) score -= 30
  if (valorCarrinho > 200) score += 15
  const prioridade: RetargetResult['prioridade'] = score >= 45 ? 'urgente' : score >= 30 ? 'alta' : score >= 15 ? 'media' : 'baixa'
  const deveRetarget = score >= 15 && horasDesdeUltimoContato > 1
  // Canal
  let melhorCanal: RetargetResult['melhorCanal'] = 'email'
  if (iniciouCheckout && abriuWhats) melhorCanal = 'whatsapp'
  else if (addCarrinho && abriuPush) melhorCanal = 'push'
  else if (iniciouCheckout) melhorCanal = 'whatsapp'
  else if (!abriuEmail) melhorCanal = 'ads'
  const desconto = iniciouCheckout ? 15 : addCarrinho ? 10 : visitouProduto ? 5 : 0
  const tipoOferta = iniciouCheckout ? 'Carrinho abandonado' : addCarrinho ? 'Volte ao carrinho' : visitouProduto ? 'Produto visto' : 'Novidades'
  const texto = iniciouCheckout
    ? 'Percebi que você quase finalizou. Volta agora e ganha desconto exclusivo.'
    : addCarrinho
    ? 'Seu carrinho tá esperando! Finalize agora antes que acabe.'
    : 'Ainda pensando na compra? Veja o que separei pra você.'
  const timing = iniciouCheckout ? 2 : addCarrinho ? 6 : visitouProduto ? 24 : 72
  return {
    deveRetarget,
    prioridade,
    melhorCanal,
    oferta: { tipo: tipoOferta, valor: desconto, texto: `${desconto}% OFF` },
    timingHoras: timing,
    mensagem: texto,
  }
}
