// ─────────────────────────────────────────────────────────────
// Invoice Engine v0.0.1 — Geração de Invoice/NFe em PDF
// resvg para renderização, HTML template para invoice
// ─────────────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string
  orderId: string
  buyerName: string
  buyerCpf: string
  buyerEmail: string
  sellerName: string
  sellerCpf: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  buyerServiceFee: number
  total: number
  paymentMethod: string
  paymentDate: string
  status: 'pending' | 'paid' | 'cancelled'
  pixQrCode?: string
}

export interface InvoiceItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export class InvoiceEngine {
  /**
   * Gera número de invoice único
   */
  generateInvoiceNumber(): string {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
    return `KIYVO-${year}-${random}`
  }

  /**
   * Gera HTML da invoice (para converter em PDF)
   */
  generateInvoiceHTML(data: InvoiceData): string {
    const itemsRows = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('')

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice ${data.invoiceNumber}</title></head>
<body style="font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff;">
  <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">KIYVO</h1>
        <p style="color: #64748b; margin: 4px 0 0;">Marketplace de Produtos Digitais</p>
      </div>
      <div style="text-align: right;">
        <h2 style="font-size: 18px; color: #0f172a; margin: 0;">INVOICE</h2>
        <p style="color: #64748b; margin: 4px 0 0;">${data.invoiceNumber}</p>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 32px; padding: 16px; background: #f8fafc; border-radius: 8px;">
      <div>
        <p style="font-size: 12px; color: #64748b; margin: 0 0 4px;">COMPRADOR</p>
        <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0;">${data.buyerName}</p>
        <p style="font-size: 12px; color: #64748b; margin: 2px 0;">CPF: ${data.buyerCpf}</p>
        <p style="font-size: 12px; color: #64748b; margin: 2px 0;">${data.buyerEmail}</p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 12px; color: #64748b; margin: 0 0 4px;">VENDEDOR</p>
        <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0;">${data.sellerName}</p>
        <p style="font-size: 12px; color: #64748b; margin: 2px 0;">CPF: ${data.sellerCpf}</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b;">Produto</th>
          <th style="padding: 8px; text-align: center; font-size: 12px; color: #64748b;">Qtd</th>
          <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b;">Preço</th>
          <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #64748b;">Subtotal</span>
        <span>R$ ${data.subtotal.toFixed(2)}</span>
      </div>
      ${data.discount > 0 ? `<div style="display: flex; justify-content: space-between;"><span style="color: #64748b;">Desconto</span><span style="color: #22c55e;">-R$ ${data.discount.toFixed(2)}</span></div>` : ''}
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #64748b;">Taxa de Serviço</span>
        <span>R$ ${data.buyerServiceFee.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        <span>Total</span>
        <span>R$ ${data.total.toFixed(2)}</span>
      </div>
    </div>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
      <p>Pagamento: ${data.paymentMethod.toUpperCase()} • Data: ${new Date(data.paymentDate).toLocaleDateString('pt-BR')}</p>
      <p>Status: ${data.status === 'paid' ? '✅ Pago' : data.status === 'pending' ? '⏳ Pendente' : '❌ Cancelado'}</p>
    </div>
  </div>
</body>
</html>`
  }

  /**
   * Formata CPF/CNPJ para exibição
   */
  formatCpf(cpf: string): string {
    const digits = cpf.replace(/\D/g, '')
    if (digits.length === 11) {
      return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`
    }
    return cpf
  }
}

export const invoiceEngine = new InvoiceEngine()
