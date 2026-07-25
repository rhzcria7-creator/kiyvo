// ─────────────────────────────────────────────────────────────
// Notification Engine v0.0.1 — Sistema completo de notificações
// Push, email, in-app, SMS (futuro), templates
// ─────────────────────────────────────────────────────────────

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationCategory =
  | 'order' | 'payment' | 'delivery' | 'dispute'
  | 'promotion' | 'system' | 'security' | 'social'
  | 'reminder' | 'kyc' | 'affiliate' | 'boost'

export interface Notification {
  id: string
  userId: string
  category: NotificationCategory
  title: string
  message: string
  icon: string
  priority: NotificationPriority
  channels: NotificationChannel[]
  actionUrl?: string
  imageUrl?: string
  metadata: Record<string, unknown>
  isRead: boolean
  isArchived: boolean
  createdAt: string
  readAt?: string
}

export interface NotificationTemplate {
  id: string
  category: NotificationCategory
  titleTemplate: string    // Suporta {{variavel}}
  messageTemplate: string
  icon: string
  channels: NotificationChannel[]
  priority: NotificationPriority
}

const TEMPLATES: Record<string, NotificationTemplate> = {
  order_confirmed: {
    id: 'order_confirmed',
    category: 'order',
    titleTemplate: 'Pedido #{{orderNumber}} confirmado!',
    messageTemplate: 'Seu pedido de {{productName}} foi confirmado e está sendo processado.',
    icon: '📦',
    channels: ['in_app', 'email'],
    priority: 'normal',
  },
  payment_received: {
    id: 'payment_received',
    category: 'payment',
    titleTemplate: 'Pagamento recebido — R$ {{amount}}',
    messageTemplate: 'Recebemos o pagamento do pedido #{{orderNumber}}. O valor será liberado em até 7 dias.',
    icon: '💰',
    channels: ['in_app', 'email'],
    priority: 'high',
  },
  delivery_ready: {
    id: 'delivery_ready',
    category: 'delivery',
    titleTemplate: 'Produto disponível!',
    messageTemplate: '{{productName}} já está disponível para download. Acesse sua biblioteca.',
    icon: '⬇️',
    channels: ['in_app', 'email', 'push'],
    priority: 'high',
  },
  dispute_opened: {
    id: 'dispute_opened',
    category: 'dispute',
    titleTemplate: 'Disputa aberta — Pedido #{{orderNumber}}',
    messageTemplate: 'Uma disputa foi aberta. Você tem 48h para responder.',
    icon: '⚖️',
    channels: ['in_app', 'email'],
    priority: 'urgent',
  },
  dispute_resolved: {
    id: 'dispute_resolved',
    category: 'dispute',
    titleTemplate: 'Disputa resolvida',
    messageTemplate: 'A disputa do pedido #{{orderNumber}} foi resolvida: {{resolution}}.',
    icon: '✅',
    channels: ['in_app', 'email'],
    priority: 'high',
  },
  sale_made: {
    id: 'sale_made',
    category: 'order',
    titleTemplate: 'Nova venda! 🎉',
    messageTemplate: 'Você vendeu {{productName}} por R$ {{amount}}. Parabéns!',
    icon: '🎉',
    channels: ['in_app', 'email', 'push'],
    priority: 'high',
  },
  withdrawal_completed: {
    id: 'withdrawal_completed',
    category: 'payment',
    titleTemplate: 'Saque de R$ {{amount}} concluído!',
    messageTemplate: 'Seu saque de R$ {{amount}} foi enviado para sua conta.',
    icon: '💸',
    channels: ['in_app', 'email'],
    priority: 'high',
  },
  kyc_approved: {
    id: 'kyc_approved',
    category: 'kyc',
    titleTemplate: 'KYC aprovado! ✅',
    messageTemplate: 'Sua verificação de identidade foi aprovada. Agora você pode vender sem limites.',
    icon: '✅',
    channels: ['in_app', 'email'],
    priority: 'high',
  },
  review_received: {
    id: 'review_received',
    category: 'social',
    titleTemplate: 'Nova avaliação! ⭐',
    messageTemplate: '{{buyerName}} avaliou {{productName}} com {{rating}} estrelas.',
    icon: '⭐',
    channels: ['in_app', 'email'],
    priority: 'normal',
  },
  price_drop: {
    id: 'price_drop',
    category: 'promotion',
    titleTemplate: '🔥 Preço caiu! {{productName}}',
    messageTemplate: 'O produto que você favoritou está com {{percent}}% de desconto!',
    icon: '🔥',
    channels: ['in_app', 'push'],
    priority: 'normal',
  },
  security_alert: {
    id: 'security_alert',
    category: 'security',
    titleTemplate: '🔒 Alerta de segurança',
    messageTemplate: 'Um novo login foi detectado na sua conta. Foi você?',
    icon: '🔒',
    channels: ['in_app', 'email'],
    priority: 'urgent',
  },
  streak_reminder: {
    id: 'streak_reminder',
    category: 'reminder',
    titleTemplate: '🔥 Streak de {{streak}} dias!',
    messageTemplate: 'Não perca sua sequência! Faça check-in hoje e ganhe {{reward}} KD Points.',
    icon: '🔥',
    channels: ['in_app', 'push'],
    priority: 'low',
  },
  boost_expiring: {
    id: 'boost_expiring',
    category: 'boost',
    titleTemplate: '⏰ Boost está acabando!',
    messageTemplate: 'Seu boost de {{productName}} expira em {{hours}} horas. Renove agora!',
    icon: '⏰',
    channels: ['in_app', 'email'],
    priority: 'normal',
  },
  welcome: {
    id: 'welcome',
    category: 'system',
    titleTemplate: 'Bem-vindo ao KIYVO! 🚀',
    messageTemplate: 'Estamos felizes em ter você aqui! Comece explorando o marketplace.',
    icon: '🚀',
    channels: ['in_app', 'email'],
    priority: 'normal',
  },
}

export class NotificationEngine {
  /**
   * Cria notificação a partir de template
   */
  createFromTemplate(
    templateId: string,
    userId: string,
    vars: Record<string, string | number>,
    metadata?: Record<string, unknown>
  ): Notification | null {
    const template = TEMPLATES[templateId]
    if (!template) return null

    const title = this.fillTemplate(template.titleTemplate, vars)
    const message = this.fillTemplate(template.messageTemplate, vars)

    return this.create({
      userId,
      category: template.category,
      title,
      message,
      icon: template.icon,
      priority: template.priority,
      channels: template.channels,
      metadata: metadata || {},
    })
  }

  /**
   * Cria notificação manual
   */
  create(params: {
    userId: string
    category: NotificationCategory
    title: string
    message: string
    icon?: string
    priority?: NotificationPriority
    channels?: NotificationChannel[]
    actionUrl?: string
    imageUrl?: string
    metadata?: Record<string, unknown>
  }): Notification {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: params.userId,
      category: params.category,
      title: params.title,
      message: params.message,
      icon: params.icon || '📌',
      priority: params.priority || 'normal',
      channels: params.channels || ['in_app'],
      actionUrl: params.actionUrl,
      imageUrl: params.imageUrl,
      metadata: params.metadata || {},
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Envia notificação para múltiplos canais
   */
  async send(notification: Notification): Promise<void> {
    // In-app: salvar no Supabase
    try {
      const { getServiceClient } = await import('@/lib/supabase/server')
      const supabase = getServiceClient()
      if (supabase) {
        await supabase.from('notifications').insert({
          user_id: notification.userId,
          type: notification.category,
          title: notification.title,
          message: notification.message,
          data: {
            icon: notification.icon,
            priority: notification.priority,
            action_url: notification.actionUrl,
            metadata: notification.metadata,
          },
          created_at: notification.createdAt,
        })
      }
    } catch {}

    // Email via Resend
    if (notification.channels.includes('email') && process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KIYVO <noreply@kiyvo.com.br>',
            to: notification.userId,
            subject: notification.title,
            html: this.generateEmailHTML(notification),
          }),
        })
      } catch {}
    }
  }

  /**
   * Preenche template com variáveis
   */
  private fillTemplate(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] || `{{${key}}}`))
  }

  /**
   * Gera HTML para email
   */
  private generateEmailHTML(notification: Notification): string {
    return `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="font-size: 32px; text-align: center; margin: 16px 0;">${notification.icon}</div>
        <h1 style="font-size: 20px; color: #0f172a; text-align: center;">${notification.title}</h1>
        <p style="color: #475569; text-align: center;">${notification.message}</p>
        ${notification.actionUrl ? `<div style="text-align: center; margin: 24px 0;">
          <a href="${notification.actionUrl}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">
            Ver agora
          </a>
        </div>` : ''}
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">KIYVO — Marketplace de Produtos Digitais</p>
      </div>
    `
  }

  /**
   * Retorna templates disponíveis
   */
  getTemplates(): NotificationTemplate[] {
    return Object.values(TEMPLATES)
  }
}

export const notificationEngine = new NotificationEngine()
