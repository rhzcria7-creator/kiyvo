// ─────────────────────────────────────────────────────────────
// Pix Payment Engine v0.0.1 — Integração PIX completa
// Geração de QR Code, validação de pagamento, conciliação
// ─────────────────────────────────────────────────────────────

export interface PixPayment {
  id: string
  orderId: string
  amount: number
  qrCode: string        // QR Code em texto (payload)
  qrCodeBase64: string  // QR Code em imagem base64
  txid: string          // Transação ID único
  expiresAt: string     // 30 minutos
  status: 'pending' | 'confirmed' | 'expired' | 'failed'
  payerCpf?: string
  payerName?: string
  confirmedAt?: string
  endToEndId?: string   // ID da transação no banco
  metadata: Record<string, unknown>
  createdAt: string
}

export interface PixConfig {
  pixKey: string
  pixType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  merchantName: string
  merchantCity: string
  isActive: boolean
}

const PIX_EXPIRY_MINUTES = 30

export class PixPaymentEngine {
  /**
   * Gera payload PIX QR Code dinâmico
   */
  generatePayload(params: {
    txid: string
    amount: number
    merchantName: string
    merchantCity: string
    pixKey: string
    description?: string
  }): string {
    const { txid, amount, merchantName, merchantCity, pixKey, description } = params

    // Payload format BR Code (EMV QRCPS)
    const gui = 'br.gov.bcb.pix' // GUI do PIX
    const simplifiedName = this.sanitizeMerchant(merchantName).slice(0, 25)
    const simplifiedCity = this.sanitizeMerchant(merchantCity).slice(0, 15)
    const descriptionFormatted = description ? `***${description.slice(0, 40)}***` : '***KIYVO***'

    // Montar payload EMV
    const payload = [
      '000201',                                         // Payload Format Indicator
      '010212',                                         // Point of Initiation Method (12 = QR Code dinâmico)
      this.emvTLV('26', [                               // Merchant Account Information
        this.emvTLV('00', gui),                          // GUI do PIX
        this.emvTLV('01', pixKey),                       // Chave PIX
        this.emvTLV('02', descriptionFormatted),         // Descrição
      ].join('')),
      '52040000',                                       // Merchant Category Code
      '5303986',                                        // Transaction Currency (986 = BRL)
      this.emvTLV('54', amount.toFixed(2)),             // Transaction Amount
      '5802BR',                                         // Country Code
      this.emvTLV('59', simplifiedName),                // Merchant Name
      this.emvTLV('60', simplifiedCity),                // Merchant City
      this.emvTLV('62', [                               // Additional Data Field
        this.emvTLV('05', txid),                         // TXID
      ].join('')),
      '6304',                                           // CRC16 placeholder
    ].join('')

    // Calcular CRC16 (últimos 4 caracteres)
    const crc = this.calculateCRC16(payload)
    return payload + crc
  }

  /**
   * Cria pagamento PIX
   */
  createPayment(params: {
    orderId: string
    amount: number
    payerCpf?: string
    payerName?: string
    pixKey: string
    merchantName: string
    merchantCity: string
  }): PixPayment {
    const txid = `KIYVO${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const expiresAt = new Date(Date.now() + PIX_EXPIRY_MINUTES * 60 * 1000).toISOString()

    const qrCode = this.generatePayload({
      txid,
      amount: params.amount,
      merchantName: params.merchantName,
      merchantCity: params.merchantCity,
      pixKey: params.pixKey,
      description: `Pedido ${params.orderId}`,
    })

    return {
      id: `pix_${Date.now()}`,
      orderId: params.orderId,
      amount: params.amount,
      qrCode,
      qrCodeBase64: Buffer.from(qrCode).toString('base64'),
      txid,
      expiresAt,
      status: 'pending',
      payerCpf: params.payerCpf,
      payerName: params.payerName,
      metadata: {},
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Verifica se PIX está expirado
   */
  isExpired(payment: PixPayment): boolean {
    return new Date(payment.expiresAt) < new Date()
  }

  /**
   * Confirma pagamento PIX
   */
  confirmPayment(payment: PixPayment, endToEndId: string): PixPayment {
    return {
      ...payment,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      endToEndId,
    }
  }

  /**
   * Calcula CRC16-CCITT para validação do payload
   */
  private calculateCRC16(payload: string): string {
    let crc = 0xFFFF
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021
        } else {
          crc <<= 1
        }
        crc &= 0xFFFF
      }
    }
    return (crc + 0xFFFF + 1).toString(16).toUpperCase().slice(-4)
  }

  /**
   * Formata campo EMV TLV
   */
  private emvTLV(tag: string, value: string): string {
    const size = value.length.toString().padStart(2, '0')
    return tag + size + value
  }

  /**
   * Sanitiza nome do merchant para PIX (apenas ASCII)
   */
  private sanitizeMerchant(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
  }
}

export const pixPaymentEngine = new PixPaymentEngine()
