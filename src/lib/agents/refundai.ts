// Agente RefundAI — analisa solicitações de reembolso e decide automaticamente (invisível)
export interface RefundInput { motivo: string; diasDesdeCompra: number; jaUsou: boolean; valor: number; historicoCompras: number; historicoReembolsos: number; avaliacao?: number }
export interface RefundAnalise { decisao: 'aprovar_automatico'|'aprovar_manual'|'negar_manual'|'negar_automatico'|'contatar_cliente'; pontuacao: number; justificativa: string; respostaAutomatica: string; tempoMedioAnalise: string; acoesRecomendadas: string[] }
export function analisarReembolso(input: RefundInput): RefundAnalise {
  const { motivo, diasDesdeCompra, jaUsou, valor, historicoCompras, historicoReembolsos, avaliacao } = input
  let pont = 50
  const ml = motivo.toLowerCase()
  // Garantia de 7 dias é LEI no Brasil
  if (diasDesdeCompra <= 7) pont += 35
  if (diasDesdeCompra > 30) pont -= 40
  if (diasDesdeCompra > 49) pont -= 20 // fora da garantia legal
  // Palavras no motivo
  if (/arrepend|não gostei|nao gostei|devolver|reembolso/.test(ml)) pont += 15
  if (/defeito|erro|bug|não funciona|nao funciona/.test(ml)) pont += 25
  if (/propaganda enganosa|enganad|golpe/.test(ml)) pont += 30 // sério
  if (/não recebi|nao recebi|não entregue|nao entregue/.test(ml)) pont += 20
  // Uso
  if (!jaUsou) pont += 10
  // Histórico
  if (historicoReembolsos > 3 && historicoCompras < historicoReembolsos*2) pont -= 30 // cliente faz chargeback sempre
  if (historicoCompras >= 5 && historicoReembolsos <= 1) pont += 10 // cliente bom
  // Avaliação baixa
  if (avaliacao !== undefined && avaliacao <= 2) pont += 15
  pont = Math.max(0, Math.min(100, pont))
  let decisao: RefundAnalise['decisao'] = 'contatar_cliente'
  let justificativa = ''
  let respostaAutomatica = ''
  const acoes: string[] = []
  if (pont >= 80 && diasDesdeCompra <= 7) {
    decisao = 'aprovar_automatico'
    justificativa = 'Dentro da garantia de 7 dias, solicitação legítima. Aprovação automática para fidelizar cliente.'
    respostaAutomatica = `Olá! Seu reembolso foi APROVADO automaticamente pela KIYVO. Em até 24h úteis o valor ${valor>200?'retorna para o seu cartão/saldo':'estará no seu KIYVO Wallet'}. Lamentamos que o produto não atendesse suas expectativas — se quiser dar um feedback pra gente melhorar, é só responder esse e-mail. 💙`
    acoes.push('Enviar reembolso em até 24h', 'Encaminhar feedback para o vendedor')
  } else if (pont >= 60) {
    decisao = 'aprovar_manual'
    justificativa = 'Solicitação com indícios de legitimidade mas fora do fluxo automático. Requer validação de um atendente.'
    respostaAutomatica = 'Olá! Recebemos sua solicitação de reembolso e nosso time está analisando com carinho. Em até 24h úteis você terá retorno. 💙'
    acoes.push('Atribuir ticket para atendente humano em até 2h', 'Verificar uso do produto')
  } else if (pont >= 35) {
    decisao = 'contatar_cliente'
    justificativa = 'Fora da garantia legal ou sinais mistos. Contatar cliente para entender antes de decidir.'
    respostaAutomatica = 'Olá! Recebemos sua solicitação. Para poder avaliar melhor, pode nos contar um pouco mais sobre o problema que teve? Em até 24h voltamos a contato com a solução.'
    acoes.push('Contatar cliente solicitando detalhes adicionais', 'Verificar logs de entrega/acesso')
  } else if (pont >= 15) {
    decisao = 'negar_manual'
    justificativa = 'Fora da garantia legal (mais de 30 dias) ou padrão de abuso. Revisão manual para segurança.'
    respostaAutomatica = 'Olá! Recebemos sua solicitação. Notamos que o pedido está fora do prazo de garantia — mas nosso time vai analisar caso a caso. Em breve entraremos em contato.'
    acoes.push('Atribuir para analista sênior', 'Verificar histórico de abusos')
  } else {
    decisao = 'negar_automatico'
    justificativa = 'Múltiplos sinais de abuso de política de reembolso ou pedido muito fora do prazo sem indícios de problema.'
    respostaAutomatica = 'Olá! Analisamos sua solicitação e, por estar fora dos termos da garantia (prazo de 7 dias após a compra) e sem indícios de defeito do produto, não podemos aprovar o reembolso nesse momento. Se precisar de ajuda com o uso, nosso suporte está à disposição.'
    acoes.push('Marcar conta para monitoramento', 'Oferecer suporte de uso do produto')
  }
  return { decisao, pontuacao: pont, justificativa, respostaAutomatica, tempoMedioAnalise: '2 segundos', acoesRecomendadas: acoes }
}
