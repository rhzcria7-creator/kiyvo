// ─────────────────────────────────────────────────────────────
// Testes — Email Service (Templates e Validação)
// ─────────────────────────────────────────────────────────────

import { emailTemplates } from '..'

describe('Email — Template de Verificação', () => {
  it('contém o link de verificação', () => {
    const { html } = emailTemplates.emailVerification({
      email: 'joao@test.com',
      confirmationUrl: 'https://kiyvo.com.br/verify?token=abc123',
    })
    expect(html).toContain('https://kiyvo.com.br/verify?token=abc123')
  })

  it('contém o email do usuário', () => {
    const { html } = emailTemplates.emailVerification({
      email: 'maria@test.com',
      confirmationUrl: 'https://kiyvo.com.br/verify',
    })
    expect(html).toContain('maria@test.com')
  })

  it('contém o nome Kiyvo', () => {
    const { html } = emailTemplates.emailVerification({
      email: 'user@test.com',
      confirmationUrl: 'https://kiyvo.com.br/verify',
    })
    expect(html).toContain('Kiyvo')
  })

  it('é HTML válido (tem tags básicas)', () => {
    const { html } = emailTemplates.emailVerification({
      email: 'user@test.com',
      confirmationUrl: 'https://kiyvo.com.br/verify',
    })
    expect(html).toContain('<!DOCTYPE')
    expect(html).toContain('</html>')
  })

  it('tem subject correto', () => {
    const { subject } = emailTemplates.emailVerification({
      email: 'user@test.com',
      confirmationUrl: 'https://kiyvo.com.br/verify',
    })
    expect(subject).toContain('Confirme seu email')
  })
})

describe('Email — Template de Reset', () => {
  it('contém o link de reset', () => {
    const { html } = emailTemplates.passwordReset({
      email: 'joao@test.com',
      resetUrl: 'https://kiyvo.com.br/reset?token=xyz',
    })
    expect(html).toContain('https://kiyvo.com.br/reset?token=xyz')
  })

  it('contém o email do usuário no footer', () => {
    const { html } = emailTemplates.passwordReset({
      email: 'ana@test.com',
      resetUrl: 'https://kiyvo.com.br/reset',
    })
    // O email é substituído no footer via notifyUser (replace {email})
    // No template gerado diretamente, aparece como {email} placeholder
    expect(html).toContain('{email}')
  })

  it('é HTML válido', () => {
    const { html } = emailTemplates.passwordReset({
      email: 'user@test.com',
      resetUrl: 'https://kiyvo.com.br/reset',
    })
    expect(html).toContain('<!DOCTYPE')
    expect(html).toContain('</html>')
  })

  it('tem subject correto', () => {
    const { subject } = emailTemplates.passwordReset({
      email: 'user@test.com',
      resetUrl: 'https://kiyvo.com.br/reset',
    })
    expect(subject).toContain('Redefinir senha')
  })
})

describe('Email — Template de Confirmação de Pedido', () => {
  it('contém o nome do produto', () => {
    const { html } = emailTemplates.orderConfirmation({
      buyerName: 'João',
      productTitle: 'Minecraft Java Edition',
      orderNumber: 'ORD-12345',
      amount: 'R$ 49,90',
      deliveryType: 'Entrega automática',
    })
    expect(html).toContain('Minecraft Java Edition')
  })

  it('contém o número do pedido', () => {
    const { html } = emailTemplates.orderConfirmation({
      buyerName: 'João',
      productTitle: 'Test Product',
      orderNumber: 'ORD-67890',
      amount: 'R$ 29,90',
      deliveryType: 'Entrega manual',
    })
    expect(html).toContain('ORD-67890')
  })

  it('contém o valor', () => {
    const { html } = emailTemplates.orderConfirmation({
      buyerName: 'João',
      productTitle: 'Test',
      orderNumber: 'ORD-1',
      amount: 'R$ 199,90',
      deliveryType: 'auto',
    })
    expect(html).toContain('R$ 199,90')
  })

  it('contém o nome do comprador', () => {
    const { html } = emailTemplates.orderConfirmation({
      buyerName: 'Maria',
      productTitle: 'Test',
      orderNumber: 'ORD-1',
      amount: 'R$ 10',
      deliveryType: 'auto',
    })
    expect(html).toContain('Maria')
  })

  it('é HTML válido', () => {
    const { html } = emailTemplates.orderConfirmation({
      buyerName: 'João',
      productTitle: 'Test',
      orderNumber: 'ORD-1',
      amount: 'R$ 10',
      deliveryType: 'auto',
    })
    expect(html).toContain('<!DOCTYPE')
  })

  it('tem subject com número do pedido', () => {
    const { subject } = emailTemplates.orderConfirmation({
      buyerName: 'João',
      productTitle: 'Test',
      orderNumber: 'ORD-999',
      amount: 'R$ 10',
      deliveryType: 'auto',
    })
    expect(subject).toContain('ORD-999')
  })
})

describe('Email — Template de Nova Venda', () => {
  it('contém o nome do produto', () => {
    const { html } = emailTemplates.newSale({
      vendorName: 'SoftVault',
      productTitle: 'Windows 11 Pro Key',
      orderNumber: 'ORD-100',
      amount: 'R$ 299,90',
      vendorNet: 'R$ 269,91',
    })
    expect(html).toContain('Windows 11 Pro Key')
  })

  it('contém o nome do vendedor', () => {
    const { html } = emailTemplates.newSale({
      vendorName: 'PixelKing',
      productTitle: 'Product',
      orderNumber: 'ORD-1',
      amount: 'R$ 50',
      vendorNet: 'R$ 45',
    })
    expect(html).toContain('PixelKing')
  })

  it('contém o lucro do vendedor', () => {
    const { html } = emailTemplates.newSale({
      vendorName: 'Seller',
      productTitle: 'Product',
      orderNumber: 'ORD-1',
      amount: 'R$ 89,90',
      vendorNet: 'R$ 80,91',
    })
    expect(html).toContain('R$ 80,91')
  })
})

describe('Email — Template 2FA Ativado', () => {
  it('contém aviso sobre 2FA', () => {
    const { html } = emailTemplates.twoFactorEnabled({
      email: 'joao@test.com',
    })
    expect(html).toContain('2FA')
    expect(html).toContain('joao@test.com')
  })

  it('é HTML válido', () => {
    const { html } = emailTemplates.twoFactorEnabled({
      email: 'user@test.com',
    })
    expect(html).toContain('<!DOCTYPE')
  })

  it('tem subject correto', () => {
    const { subject } = emailTemplates.twoFactorEnabled({
      email: 'user@test.com',
    })
    expect(subject).toContain('2FA')
  })
})

describe('Email — Template Alerta de Segurança', () => {
  it('contém o tipo de alerta', () => {
    const { html } = emailTemplates.securityAlert({
      email: 'joao@test.com',
      alertType: 'Login de novo dispositivo',
      details: 'IP: 192.168.1.1 - São Paulo, BR',
      actionUrl: 'https://kiyvo.com.br/seguranca',
    })
    expect(html).toContain('Login de novo dispositivo')
  })

  it('contém o link de ação', () => {
    const { html } = emailTemplates.securityAlert({
      email: 'user@test.com',
      alertType: 'Test',
      details: 'Details',
      actionUrl: 'https://kiyvo.com.br/conta/seguranca',
    })
    expect(html).toContain('https://kiyvo.com.br/conta/seguranca')
  })

  it('tem subject com tipo de alerta', () => {
    const { subject } = emailTemplates.securityAlert({
      email: 'user@test.com',
      alertType: 'Acesso suspeito',
      details: 'Details',
    })
    expect(subject).toContain('Acesso suspeito')
  })
})

describe('Email — Template Liberação de Escrow', () => {
  it('contém o valor liberado', () => {
    const { html } = emailTemplates.escrowRelease({
      vendorName: 'SoftVault',
      amount: 'R$ 44,91',
      orderNumber: 'ORD-999',
    })
    expect(html).toContain('R$ 44,91')
    expect(html).toContain('SoftVault')
  })

  it('contém o número do pedido', () => {
    const { html } = emailTemplates.escrowRelease({
      vendorName: 'V',
      amount: 'R$ 10',
      orderNumber: 'ORD-ABC',
    })
    expect(html).toContain('ORD-ABC')
  })

  it('tem subject com pedido', () => {
    const { subject } = emailTemplates.escrowRelease({
      vendorName: 'V',
      amount: 'R$ 10',
      orderNumber: 'ORD-XYZ',
    })
    expect(subject).toContain('ORD-XYZ')
  })
})

describe('Email — Template de Notificação Genérica', () => {
  it('contém o título e a mensagem', () => {
    const { html } = emailTemplates.notification({
      email: 'user@test.com',
      title: 'Novidade!',
      message: 'Confira as novas categorias.',
      ctaText: 'Ver mais',
      ctaUrl: 'https://kiyvo.com.br/categorias',
    })
    expect(html).toContain('Confira as novas categorias.')
    expect(html).toContain('https://kiyvo.com.br/categorias')
  })
})

describe('Email — Segurança Geral', () => {
  it('nenhum template contém scripts inline', () => {
    const templates = [
      emailTemplates.emailVerification({ email: 'test@test.com', confirmationUrl: 'https://test.com' }),
      emailTemplates.passwordReset({ email: 'test@test.com', resetUrl: 'https://test.com' }),
      emailTemplates.twoFactorEnabled({ email: 'test@test.com' }),
    ]
    templates.forEach(({ html }) => {
      expect(html).not.toContain('<script')
      expect(html).not.toContain('javascript:')
    })
  })

  it('todos os templates são HTML5 válidos', () => {
    const templates = [
      emailTemplates.emailVerification({ email: 't@t.com', confirmationUrl: 'https://t.com' }),
      emailTemplates.passwordReset({ email: 't@t.com', resetUrl: 'https://t.com' }),
      emailTemplates.orderConfirmation({
        buyerName: 'Test',
        productTitle: 'Test',
        orderNumber: 'ORD-1',
        amount: 'R$ 10',
        deliveryType: 'auto',
      }),
      emailTemplates.newSale({
        vendorName: 'Test',
        productTitle: 'Test',
        orderNumber: 'ORD-1',
        amount: 'R$ 10',
        vendorNet: 'R$ 9',
      }),
      emailTemplates.twoFactorEnabled({ email: 't@t.com' }),
      emailTemplates.securityAlert({
        email: 't@t.com',
        alertType: 'Test',
        details: 'Test',
      }),
      emailTemplates.escrowRelease({
        vendorName: 'Test',
        amount: 'R$ 10',
        orderNumber: 'ORD-1',
      }),
    ]
    templates.forEach(({ html }) => {
      expect(html).toContain('<!DOCTYPE')
      expect(html).toContain('</html>')
      expect(html).toContain('<html')
    })
  })
})
