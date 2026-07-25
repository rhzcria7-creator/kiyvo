// v0.0.1 — Serviço de escrow: saldo fica pendente até a garantia terminar.
import { createAdminClient } from '@/lib/supabase/server'

export interface EscrowHoldInput { orderId: string; sellerId: string; amount: number; currency?: string; guaranteeDays?: number }
export interface EscrowHold { id: string; orderId: string; status: 'pending' | 'available' | 'frozen' | 'refunded'; availableAt: string }

function assertMoney(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Valor de escrow inválido.')
}

export class EscrowService {
  async createHold(input: EscrowHoldInput): Promise<EscrowHold | null> {
    assertMoney(input.amount)
    const admin = createAdminClient()
    if (!admin) return null
    const availableAt = new Date(Date.now() + (input.guaranteeDays ?? 7) * 86_400_000).toISOString()
    const { data, error } = await admin.from('escrow_holds').insert({ order_id: input.orderId, seller_id: input.sellerId, amount: Math.round(input.amount * 100) / 100, currency: input.currency ?? 'BRL', status: 'pending', available_at: availableAt }).select('id,order_id,status,available_at').single()
    if (error || !data) return null
    return { id: String(data.id), orderId: String(data.order_id), status: data.status as EscrowHold['status'], availableAt: String(data.available_at) }
  }

  async freezeForDispute(orderId: string): Promise<boolean> {
    const admin = createAdminClient()
    if (!admin) return false
    const { error } = await admin.from('escrow_holds').update({ status: 'frozen' }).eq('order_id', orderId).eq('status', 'pending')
    return !error
  }

  async releaseMatureHolds(): Promise<number> {
    const admin = createAdminClient()
    if (!admin) return 0
    const { data, error } = await admin.from('escrow_holds').update({ status: 'available', released_at: new Date().toISOString() }).eq('status', 'pending').lte('available_at', new Date().toISOString()).select('id')
    if (error) return 0
    return data?.length ?? 0
  }
}

export const escrowService = new EscrowService()
