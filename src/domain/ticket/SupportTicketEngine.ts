// ─────────────────────────────────────────────────────────────
// Support Ticket Engine v0.0.1 — Sistema de tickets de suporte
// Categorias, prioridades, SLA, respostas automáticas
// ─────────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'awaiting_reply' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketCategory = 'order' | 'payment' | 'delivery' | 'account' | 'kyc' | 'technical' | 'fraud' | 'other'

export interface Ticket {
  id: string
  userId: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  orderId?: string
  assignedTo?: string
  messages: TicketMessage[]
  tags: string[]
  slaDeadline: string
  firstResponseAt: string | null
  resolvedAt: string | null
  satisfaction: 1 | 2 | 3 | 4 | 5 | null
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  authorId: string
  authorRole: 'user' | 'support' | 'admin' | 'system'
  message: string
  attachments: string[]
  isInternal: boolean
  createdAt: string
}

const SLA_HOURS: Record<TicketPriority, number> = {
  low: 48,
  normal: 24,
  high: 8,
  urgent: 2,
}

export class SupportTicketEngine {
  create(params: {
    userId: string
    subject: string
    description: string
    category: TicketCategory
    priority?: TicketPriority
    orderId?: string
  }): Ticket {
    const slaHours = SLA_HOURS[params.priority || 'normal']
    const ticket: Ticket = {
      id: `TKT-${Date.now().toString(36).toUpperCase()}`,
      userId: params.userId,
      subject: params.subject,
      description: params.description,
      category: params.category,
      priority: params.priority || 'normal',
      status: 'open',
      orderId: params.orderId,
      messages: [{
        id: `msg_${Date.now()}`,
        ticketId: `TKT-${Date.now().toString(36).toUpperCase()}`,
        authorId: params.userId,
        authorRole: 'user',
        message: params.description,
        attachments: [],
        isInternal: false,
        createdAt: new Date().toISOString(),
      }],
      tags: [params.category],
      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString(),
      firstResponseAt: null,
      resolvedAt: null,
      satisfaction: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return ticket
  }

  addMessage(ticket: Ticket, authorId: string, authorRole: TicketMessage['authorRole'], message: string, attachments: string[] = [], isInternal = false): Ticket {
    const msg: TicketMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ticketId: ticket.id,
      authorId,
      authorRole,
      message,
      attachments,
      isInternal,
      createdAt: new Date().toISOString(),
    }
    return {
      ...ticket,
      messages: [...ticket.messages, msg],
      status: ticket.status === 'open' ? 'awaiting_reply' : ticket.status,
      firstResponseAt: ticket.firstResponseAt || (authorRole !== 'user' ? new Date().toISOString() : null),
      updatedAt: new Date().toISOString(),
    }
  }

  resolve(ticket: Ticket, resolution: string): Ticket {
    return {
      ...ticket,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      messages: [...ticket.messages, {
        id: `msg_${Date.now()}`,
        ticketId: ticket.id,
        authorId: 'system',
        authorRole: 'system',
        message: `Ticket resolvido: ${resolution}`,
        attachments: [],
        isInternal: false,
        createdAt: new Date().toISOString(),
      }],
      updatedAt: new Date().toISOString(),
    }
  }

  rateSatisfaction(ticket: Ticket, rating: 1 | 2 | 3 | 4 | 5): Ticket {
    return { ...ticket, satisfaction: rating, updatedAt: new Date().toISOString() }
  }

  getSLARemainingHours(ticket: Ticket): number {
    return Math.max(0, (new Date(ticket.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60))
  }

  isSLABreached(ticket: Ticket): boolean {
    return ticket.status !== 'resolved' && ticket.status !== 'closed' && new Date(ticket.slaDeadline) < new Date()
  }
}

export const supportTicketEngine = new SupportTicketEngine()
