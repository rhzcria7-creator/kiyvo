// ─────────────────────────────────────────────────────────────
// Wallet API v0.0.1 — Saldo, extrato, saques
// Available vs Pending vs Blocked
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { ledgerService } from '@/domain/ledger/LedgerService'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) return errorResponse('userId é obrigatório')

  const supabase = await trySupabase()
  if (!supabase) {
    return successResponse({
      available: 0,
      pending: 0,
      total: 0,
      blocked: 0,
      entries: [],
      canWithdrawPix: { can: false, minAmount: 30 },
    })
  }

  // Buscar transações
  const { data: entries } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  // Buscar escrows
  const { data: escrows } = await supabase
    .from('escrow_transactions')
    .select('*')
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .in('status', ['held', 'disputed'])

  const balance = ledgerService.getBalance(
    userId,
    (escrows || []).map((e: any) => ({
      id: e.id,
      orderId: e.order_id,
      sellerId: e.seller_id,
      buyerId: e.buyer_id,
      amount: Number(e.amount),
      status: e.status as any,
      heldAt: e.held_at || e.created_at,
      releaseAt: e.release_at || e.created_at,
      releasedAt: e.released_at,
    })),
    (entries || []).map((e: any) => ({
      id: e.id,
      accountId: e.user_id,
      transactionType: e.type,
      debit: e.type === 'payout' || e.type === 'withdrawal' ? Number(e.amount) : 0,
      credit: e.type === 'sale' || e.type === 'escrow_release' ? Number(e.amount) : 0,
      balance: Number(e.balance_after || e.amount),
      description: e.description || '',
      referenceType: e.reference_type || 'order',
      referenceId: e.reference_id || '',
      userId: e.user_id,
      createdAt: e.created_at,
      metadata: {},
    }))
  )

  return successResponse({
    ...balance,
    entries: entries || [],
    canWithdrawPix: ledgerService.canWithdraw(balance, 'pix'),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, amount, method, pixKey, pixType } = body

  if (!userId || !amount) return errorResponse('userId e amount obrigatórios')
  if (amount < 30) return errorResponse('Valor mínimo para saque é R$ 30,00')

  const supabase = await trySupabase()
  if (supabase) {
    const { data: payout, error } = await supabase.from('payouts').insert({
      user_id: userId,
      amount: Number(amount),
      fee: 0.99,
      method: method || 'pix',
      pix_key: pixKey,
      pix_type: pixType || 'cpf',
      status: 'pending',
    }).select().single()

    if (error) return errorResponse(error.message)
    return successResponse(payout)
  }

  return successResponse({ id: `payout_${Date.now()}`, userId, amount, status: 'demo' })
}
