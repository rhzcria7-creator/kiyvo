// Agente InvoiceGen — gera Nota Fiscal / recibo em HTML
export interface InvoiceInput {
  numero: string
  emissor: { nome: string; cnpj?: string; cpf?: string; endereco?: string; email?: string }
  cliente: { nome: string; cnpj?: string; cpf?: string; email?: string; endereco?: string }
  itens: Array<{ descricao: string; qtd?: number; preco: number }>
  desconto?: number
  dataEmissao?: string
  formaPagamento?: string
}
export interface InvoiceResult { html: string; total: number; subtotal: number; desconto: number; textoCabe: string[] }

export function gerarFatura(input: InvoiceInput): InvoiceResult {
  const data = input.dataEmissao || new Date().toLocaleDateString('pt-BR')
  let subtotal = 0
  const rows = input.itens.map((it, idx) => {
    const q = it.qtd || 1
    const preco = Number(it.preco) || 0
    const total = q * preco
    subtotal += total
    return `<tr><td>${idx+1}</td><td>${it.descricao}</td><td style="text-align:right">${q}</td><td style="text-align:right">R$ ${preco.toFixed(2).replace('.',',')}</td><td style="text-align:right">R$ ${total.toFixed(2).replace('.',',')}</td></tr>`
  }).join('')
  const desconto = Number(input.desconto) || 0
  const total = subtotal - desconto
  const docEmissor = input.emissor.cnpj ? `CNPJ ${input.emissor.cnpj}` : input.emissor.cpf ? `CPF ${input.emissor.cpf}` : ''
  const docCliente = input.cliente.cnpj ? `CNPJ ${input.cliente.cnpj}` : input.cliente.cpf ? `CPF ${input.cliente.cpf}` : ''
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>NF ${input.numero}</title><style>
    body{font-family:Inter,Arial,sans-serif;padding:40px;color:#0F172A}
    .top{display:flex;justify-content:space-between;margin-bottom:40px}
    h1{margin:0 0 8px 0;font-size:28px}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{border-bottom:1px solid #e2e8f0;padding:8px 4px;text-align:left;font-size:14px}
    th{background:#f8fafc;text-transform:uppercase;font-size:10px;letter-spacing:1px;color:#64748b}
    .totals{margin-top:20px;max-width:320px;margin-left:auto}
    .totals div{display:flex;justify-content:space-between;padding:4px 0}
    .totals .t{border-top:2px solid #0F172A;font-weight:900;padding-top:10px;margin-top:6px}
    .obs{margin-top:40px;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;padding-top:16px}
  </style></head><body>
  <div class="top"><div><h1>KİYVO</h1><div>${input.emissor.nome}</div><div>${docEmissor}</div><div>${input.emissor.endereco||''}</div><div>${input.emissor.email||''}</div></div>
  <div style="text-align:right"><div style="font-size:20px;font-weight:900">RECBIO/NF Nº ${input.numero}</div><div>Emissão: ${data}</div><div>Pagamento: ${input.formaPagamento||'PIX/Cartão'}</div></div></div>
  <div style="margin-top:30px"><div style="font-size:10px;letter-spacing:1px;color:#64748b;font-weight:900;text-transform:uppercase;margin-bottom:8px">Cliente</div><div><b>${input.cliente.nome}</b></div><div>${docCliente}</div><div>${input.cliente.endereco||''}</div></div>
  <table><thead><tr><th>#</th><th>Descrição</th><th style="text-align:right">Qtd</th><th style="text-align:right">Preço</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="totals"><div><span>Subtotal</span><span>R$ ${subtotal.toFixed(2).replace('.',',')}</span></div>${desconto>0?`<div><span>Desconto</span><span>- R$ ${desconto.toFixed(2).replace('.',',')}</span></div>`:''}<div class="t"><span>TOTAL</span><span>R$ ${total.toFixed(2).replace('.',',')}</span></div></div>
  <div class="obs">Obrigado pela compra! Este recibo pode ser emitido automaticamente pela plataforma KIYVO. Produto 100% digital. Em caso de dúvidas: suporte@kiyvo.com.br</div>
  </body></html>`
  return {
    html, subtotal, total, desconto,
    textoCabe: [`Recibo nº ${input.numero}`, data, input.cliente.nome, `Total: R$ ${total.toFixed(2)}`],
  }
}
