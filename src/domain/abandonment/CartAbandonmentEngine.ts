// v0.0.1 — Lembrete respeita consentimento e evita spam de carrinho abandonado.
export interface AbandonedCartInput { updatedAt: Date; emailConsent: boolean; reminderCount: number; now?: Date }
export function shouldSendCartReminder(input: AbandonedCartInput): boolean { const now = input.now ?? new Date(); return input.emailConsent && input.reminderCount < 2 && now.getTime() - input.updatedAt.getTime() >= 3_600_000 }
