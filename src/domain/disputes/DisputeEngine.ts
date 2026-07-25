// v0.0.1 — Máquina de estados de disputa sem dependência de infraestrutura.

export type DisputeStatus = 'open' | 'seller_response' | 'admin_review' | 'resolved' | 'refunded' | 'rejected'
export type DisputeActor = 'buyer' | 'seller' | 'admin' | 'system'

export interface DisputeTransition { from: DisputeStatus; to: DisputeStatus; actor: DisputeActor }
export interface DisputeTransitionResult { allowed: boolean; error?: string }

const ALLOWED: DisputeTransition[] = [
  { from: 'open', to: 'seller_response', actor: 'seller' },
  { from: 'open', to: 'admin_review', actor: 'admin' },
  { from: 'seller_response', to: 'admin_review', actor: 'buyer' },
  { from: 'seller_response', to: 'admin_review', actor: 'seller' },
  { from: 'seller_response', to: 'admin_review', actor: 'system' },
  { from: 'admin_review', to: 'resolved', actor: 'admin' },
  { from: 'admin_review', to: 'refunded', actor: 'admin' },
  { from: 'admin_review', to: 'rejected', actor: 'admin' },
]

export function canTransitionDispute(from: DisputeStatus, to: DisputeStatus, actor: DisputeActor): DisputeTransitionResult {
  if (from === to) return { allowed: false, error: 'A disputa já está neste estado.' }
  if (ALLOWED.some((transition) => transition.from === from && transition.to === to && transition.actor === actor)) return { allowed: true }
  return { allowed: false, error: 'Esta transição não é permitida para o seu perfil.' }
}
