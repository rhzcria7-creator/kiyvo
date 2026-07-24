// Agente WebhookTester — gera templates de payloads de webhook pra testes
export interface WebhookTestInput {
  evento: 'compra_aprovada' | 'compra_recusada' | 'reembolso' | 'pix_gerado' | 'pix_pago' | 'cupom_usado' | 'novo_lead' | 'review_novo'
  produto?: string
  valor?: number
  nome?: string
}
export interface WebhookTestResult {
  evento: string
  method: 'POST'
  headers: Record<string, string>
  body: Record<string, unknown>
  curl: string
  dicas: string[]
}

export function gerarWebhookTest(input: WebhookTestInput): WebhookTestResult {
  const { evento, produto = 'Produto Teste', valor = 97, nome = 'Maria Silva' } = input
  const eventMap: Record<string, Record<string, unknown>> = {
    compra_aprovada: {
      event: 'purchase.approved',
      data: {
        id: `ord_${Math.random().toString(36).slice(2, 10)}`,
        product: produto,
        amount: valor,
        currency: 'BRL',
        customer: { name: nome, email: nome.toLowerCase().replace(/\s+/g, '.') + '@email.com', phone: '+5511999999999' },
        payment_method: 'pix',
        status: 'paid',
      },
    },
    compra_recusada: { event: 'purchase.declined', data: { product: produto, amount: valor, reason: 'cartao_recusado' } },
    reembolso: { event: 'refund.created', data: { product: produto, amount: valor, reason: 'customer_request' } },
    pix_gerado: { event: 'pix.generated', data: { product: produto, amount: valor, pix_code: '00020126360014BR.GOV.BCB.PIX...' } },
    pix_pago: { event: 'pix.paid', data: { product: produto, amount: valor, paid_at: new Date().toISOString() } },
    cupom_usado: { event: 'coupon.used', data: { code: 'DESCONTO10', discount: valor * 0.1 } },
    novo_lead: { event: 'lead.created', data: { email: 'lead@exemplo.com', origem: 'quiz' } },
    review_novo: { event: 'review.created', data: { product: produto, rating: 5, comment: 'Produto excelente!' } },
  }
  const body = eventMap[evento] || eventMap.compra_aprovada
  const bodyStr = JSON.stringify(body, null, 2)
  const curl = `curl -X POST https://seu-dominio.com/api/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-KIYVO-Signature: sha256=teste123" \\
  -d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`
  return {
    evento,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-KIYVO-Signature': 'sha256=xxxx', 'X-Event': evento },
    body,
    curl,
    dicas: [
      'Sempre valide a assinatura X-KIYVO-Signature usando HMAC SHA256.',
      'Responda em menos de 5 segundos (webhooks com timeout são retentados).',
      'Retorne 2xx para confirmar recebimento.',
      'Use idempotência pelo ID do evento para não processar o mesmo evento 2x.',
      'Teste o payload com eventos reais antes de ir a produção.',
    ],
  }
}
