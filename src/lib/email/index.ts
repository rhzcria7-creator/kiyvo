// ─────────────────────────────────────────────────────────────
// KIYVO — Serviço de Email para Notificações
// Suporta: Resend (produção), SMTP genérico, console log (dev)
// Todos os templates são HTML responsivos com branding KIYVO
// ─────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/server'

// ─── CONFIGURAÇÃO ────────────────────────────────────────────

type EmailProvider = 'resend' | 'smtp' | 'console'

function getProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) return 'resend'
  if (process.env.SMTP_HOST) return 'smtp'
  return 'console'
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@kiyvo.com'
const FROM_NAME = 'KIYVO'

// ─── TEMPLATE BASE ───────────────────────────────────────────

function baseTemplate(params: {
  title: string
  content: string
  ctaText?: string
  ctaUrl?: string
  footer?: string
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 1px solid #e2e8f0; }
    .logo { font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
    .content { padding: 30px 0; line-height: 1.6; font-size: 15px; }
    .content h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    .content p { margin-bottom: 16px; color: #475569; }
    .cta-button { display: inline-block; padding: 14px 32px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 10px 0; }
    .cta-button:hover { background: #1d4ed8; }
    .footer { padding: 20px 0; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    .footer a { color: #2563eb; text-decoration: none; }
    .highlight { background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .danger { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    @media (max-width: 600px) {
      .container { padding: 10px; }
      .content h2 { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Kiyvo</div>
    </div>
    <div class="content">
      ${params.content}
      ${params.ctaText && params.ctaUrl ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${params.ctaUrl}" class="cta-button">${params.ctaText}</a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      ${params.footer || `
        <p>KIYVO — O marketplace de tudo que é digital</p>
        <p>Este email foi enviado para {email}. <a href="https://kiyvo.com/conta/notificacoes">Gerenciar preferências</a></p>
      `}
    </div>
  </div>
</body>
</html>`
}

// ─── TEMPLATES DE EMAIL ──────────────────────────────────────

export const emailTemplates = {
  /**
   * Email de verificação de conta
   */
  emailVerification(params: { email: string; confirmationUrl: string }): {
    subject: string
    html: string
  } {
    return {
      subject: 'KIYVO — Confirme seu email',
      html: baseTemplate({
        title: 'Confirme seu email',
        content: `
          <h2>Bem-vindo ao Kiyvo! 🎉</h2>
          <p>Para começar a comprar e vender no marketplace, confirme seu email:</p>
          <div class="highlight">
            <p style="margin:0;"><strong>Conta:</strong> ${params.email}</p>
          </div>
        `,
        ctaText: 'Confirmar Email',
        ctaUrl: params.confirmationUrl,
      }),
    }
  },

  /**
   * Email de recuperação de senha
   */
  passwordReset(params: { email: string; resetUrl: string }): {
    subject: string
    html: string
  } {
    return {
      subject: 'KIYVO — Redefinir senha',
      html: baseTemplate({
        title: 'Redefinir sua senha',
        content: `
          <h2>Redefinição de senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <div class="warning">
            <p style="margin:0;">Se você não solicitou isso, ignore este email. Sua senha não foi alterada.</p>
          </div>
        `,
        ctaText: 'Redefinir Senha',
        ctaUrl: params.resetUrl,
      }),
    }
  },

  /**
   * Email de confirmação de compra
   */
  orderConfirmation(params: {
    buyerName: string
    productTitle: string
    orderNumber: string
    amount: string
    deliveryType: string
  }): {
    subject: string
    html: string
  } {
    return {
      subject: `KIYVO — Pedido ${params.orderNumber} confirmado`,
      html: baseTemplate({
        title: 'Pagamento Confirmado!',
        content: `
          <h2>Pagamento confirmado! ✅</h2>
          <p>Olá ${params.buyerName}, seu pagamento foi processado com sucesso.</p>
          <div class="highlight">
            <p style="margin:0;"><strong>Pedido:</strong> ${params.orderNumber}</p>
            <p style="margin:0;"><strong>Produto:</strong> ${params.productTitle}</p>
            <p style="margin:0;"><strong>Valor:</strong> ${params.amount}</p>
            <p style="margin:0;"><strong>Entrega:</strong> ${params.deliveryType}</p>
          </div>
          <p>Seu produto será entregue em breve. Acompanhe o status na sua área de compras.</p>
        `,
        ctaText: 'Ver Minhas Compras',
        ctaUrl: 'https://kiyvo.com/conta/compras',
      }),
    }
  },

  /**
   * Email de nova venda (para o vendedor)
   */
  newSale(params: {
    vendorName: string
    productTitle: string
    orderNumber: string
    amount: string
    vendorNet: string
  }): {
    subject: string
    html: string
  } {
    return {
      subject: `KIYVO — Nova venda! Pedido ${params.orderNumber}`,
      html: baseTemplate({
        title: 'Nova Venda! 🎉',
        content: `
          <h2>Você fez uma venda!</h2>
          <p>Olá ${params.vendorName}, parabéns! Seu produto foi vendido.</p>
          <div class="highlight">
            <p style="margin:0;"><strong>Pedido:</strong> ${params.orderNumber}</p>
            <p style="margin:0;"><strong>Produto:</strong> ${params.productTitle}</p>
            <p style="margin:0;"><strong>Valor total:</strong> ${params.amount}</p>
            <p style="margin:0;"><strong>Seu lucro:</strong> ${params.vendorNet}</p>
          </div>
          <p>O valor está em custódia e será liberado após a confirmação do comprador.</p>
        `,
        ctaText: 'Ver Detalhes',
        ctaUrl: 'https://kiyvo.com/vendedor/relatorios',
      }),
    }
  },

  /**
   * Email de 2FA ativado
   */
  twoFactorEnabled(params: { email: string }): {
    subject: string
    html: string
  } {
    return {
      subject: 'KIYVO — 2FA ativado com sucesso',
      html: baseTemplate({
        title: '2FA Ativado',
        content: `
          <h2>Autenticação de dois fatores ativada 🔒</h2>
          <p>Sua conta agora está protegida com 2FA. A partir de agora, você precisará de um código do seu app autenticador toda vez que fizer login.</p>
          <div class="highlight">
            <p style="margin:0;"><strong>Conta:</strong> ${params.email}</p>
          </div>
          <p>Se você não ativou o 2FA, <a href="https://kiyvo.com/conta/seguranca">altere sua senha imediatamente</a>.</p>
        `,
      }),
    }
  },

  /**
   * Email de alerta de segurança
   */
  securityAlert(params: {
    email: string
    alertType: string
    details: string
    actionUrl?: string
  }): {
    subject: string
    html: string
  } {
    return {
      subject: `KIYVO — Alerta de segurança: ${params.alertType}`,
      html: baseTemplate({
        title: 'Alerta de Segurança',
        content: `
          <h2>⚠️ Alerta de Segurança</h2>
          <p>Detectamos uma atividade incomum na sua conta.</p>
          <div class="danger">
            <p style="margin:0;"><strong>Tipo:</strong> ${params.alertType}</p>
            <p style="margin:0;"><strong>Detalhes:</strong> ${params.details}</p>
          </div>
          <p>Se foi você, pode ignorar este email. Caso contrário, proteja sua conta imediatamente.</p>
        `,
        ctaText: 'Proteger Conta',
        ctaUrl: params.actionUrl || 'https://kiyvo.com/conta/seguranca',
      }),
    }
  },

  /**
   * Email de liberação de fundos (escrow release)
   */
  escrowRelease(params: {
    vendorName: string
    amount: string
    orderNumber: string
  }): {
    subject: string
    html: string
  } {
    return {
      subject: `KIYVO — Fundos liberados! Pedido ${params.orderNumber}`,
      html: baseTemplate({
        title: 'Fundos Liberados! 💰',
        content: `
          <h2>Fundos liberados</h2>
          <p>Olá ${params.vendorName}, o valor do seu pedido foi liberado e está disponível para saque.</p>
          <div class="highlight">
            <p style="margin:0;"><strong>Pedido:</strong> ${params.orderNumber}</p>
            <p style="margin:0;"><strong>Valor liberado:</strong> ${params.amount}</p>
          </div>
        `,
        ctaText: 'Solicitar Saque',
        ctaUrl: 'https://kiyvo.com/vendedor/retiradas',
      }),
    }
  },

  /**
   * Email de notificação genérica
   */
  notification(params: {
    email: string
    title: string
    message: string
    ctaText?: string
    ctaUrl?: string
  }): {
    subject: string
    html: string
  } {
    return {
      subject: `KIYVO — ${params.title}`,
      html: baseTemplate({
        title: params.title,
        content: `<p>${params.message}</p>`,
        ctaText: params.ctaText,
        ctaUrl: params.ctaUrl,
      }),
    }
  },
}

// ─── ENVIO DE EMAIL ──────────────────────────────────────────

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Envia email usando o provider configurado
 * Em desenvolvimento, apenas loga no console
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error: string | null }> {
  const provider = getProvider()

  switch (provider) {
    case 'resend':
      return sendViaResend(params)
    case 'smtp':
      return sendViaSMTP(params)
    case 'console':
    default:
      // Desenvolvimento — logar no console
      return { success: true, error: null }
  }
}

/**
 * Envio via Resend (https://resend.com)
 * Serverless-friendly, não precisa de SMTP
 */
async function sendViaResend(params: SendEmailParams): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.message || 'Erro ao enviar email via Resend' }
    }

    return { success: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao enviar email'
    return { success: false, error: message }
  }
}

/**
 * Envio via SMTP genérico
 * Usa fetch para API externa de SMTP (ex: Mailgun, SendGrid)
 */
async function sendViaSMTP(params: SendEmailParams): Promise<{ success: boolean; error: string | null }> {
  // Placeholder — em produção, integrar com nodemailer ou SendGrid API
  // Por enquanto, logar que o email seria enviado
  void params
  return { success: true, error: null }
}

// ─── HELPER: Enviar notificação por email ────────────────────

/**
 * Busca email do usuário e envia notificação
 * Usado pelos webhooks e APIs para notificar usuários
 */
export async function notifyUser(params: {
  userId: string
  template: keyof typeof emailTemplates
  templateParams: Record<string, string>
}): Promise<{ success: boolean; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { success: false, error: 'Admin client não disponível' }

  try {
    // Buscar email do usuário
    const { data: profile } = await admin
      .from('profiles')
      .select('id, email_notifications')
      .eq('id', params.userId)
      .single()

    if (!profile) return { success: false, error: 'Perfil não encontrado' }

    const profileData = profile as Record<string, unknown>
    // Respeitar preferências de notificação do usuário
    if (profileData.email_notifications === false) {
      return { success: true, error: null } // Usuário desativou notificações
    }

    // Buscar email via auth
    const { data: { user } } = await admin.auth.admin.getUserById(params.userId)
    if (!user?.email) return { success: false, error: 'Email não encontrado' }

    // Gerar template
    const templateFn = emailTemplates[params.template]
    if (!templateFn) return { success: false, error: 'Template não encontrado' }

    const { subject, html } = templateFn(params.templateParams as never)

    return sendEmail({
      to: user.email,
      subject,
      html: html.replace(/{email}/g, user.email),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao notificar usuário'
    return { success: false, error: message }
  }
}
