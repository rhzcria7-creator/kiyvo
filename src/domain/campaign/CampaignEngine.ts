// ─────────────────────────────────────────────────────────────
// Campaign Engine v0.0.1 — Campanhas de notificação em massa
// Segmentação, templates, agendamento, analytics
// ─────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
export type CampaignChannel = 'email' | 'push' | 'in_app' | 'sms'
export type CampaignSegment = 'all' | 'buyers' | 'sellers' | 'inactive_7d' | 'inactive_30d' | 'high_value' | 'new_users' | 'custom'

export interface Campaign { id: string; name: string; subject: string; message: string; channel: CampaignChannel; segment: CampaignSegment; scheduledAt: string | null; sentAt: string | null; status: CampaignStatus; totalRecipients: number; sentCount: number; openCount: number; clickCount: number; conversionCount: number; createdBy: string; createdAt: string }

export class CampaignEngine {
  estimateRecipients(segment: CampaignSegment, totalUsers: number): number {
    const multipliers: Record<CampaignSegment, number> = { all: 1, buyers: 0.4, sellers: 0.15, inactive_7d: 0.1, inactive_30d: 0.2, high_value: 0.05, new_users: 0.08, custom: 0.5 }
    return Math.round(totalUsers * (multipliers[segment] || 0.5))
  }

  create(params: { name: string; subject: string; message: string; channel: CampaignChannel; segment: CampaignSegment; scheduledAt?: string; createdBy: string; totalUsers: number }): Campaign {
    return { id: `camp_${Date.now()}`, ...params, scheduledAt: params.scheduledAt || null, sentAt: null, status: params.scheduledAt ? 'scheduled' : 'draft', totalRecipients: this.estimateRecipients(params.segment, params.totalUsers), sentCount: 0, openCount: 0, clickCount: 0, conversionCount: 0, createdAt: new Date().toISOString() }
  }

  calculateOpenRate(campaign: Campaign): number {
    return campaign.sentCount > 0 ? Math.round((campaign.openCount / campaign.sentCount) * 100) : 0
  }

  calculateConversionRate(campaign: Campaign): number {
    return campaign.sentCount > 0 ? Math.round((campaign.conversionCount / campaign.sentCount) * 100) : 0
  }
}
export const campaignEngine = new CampaignEngine()
