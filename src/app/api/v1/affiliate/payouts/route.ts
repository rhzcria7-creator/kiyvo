import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { affiliatePayoutEngine } from '@/domain/affiliatepayout/AffiliatePayoutEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const affiliateId = searchParams.get('affiliateId')
  if (!affiliateId) return errorResponse('affiliateId obrigatório')
  const supabase = await trySupabase()
  if (!supabase) return successResponse({ commissions: [], payouts: [], availableBalance: 0 })

  const { data: commissions } = await supabase.from('affiliate_commissions').select('*').eq('affiliate_id', affiliateId).order('created_at', { ascending: false }).limit(100)
  const { data: payouts } = await supabase.from('affiliate_payouts').select('*').eq('affiliate_id', affiliateId).order('created_at', { ascending: false }).limit(20)
  const availableBalance = (commissions || []).filter((c: any) => c.status === 'approved').reduce((s: number, c: any) => s + Number(c.commission), 0)

  return successResponse({ commissions: commissions || [], payouts: payouts || [], availableBalance: Math.round(availableBalance * 100) / 100 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { affiliateId, method = 'pix' } = body
  if (!affiliateId) return errorResponse('affiliateId obrigatório')

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ message: 'Modo demonstração' })

  const { data: commissions } = await supabase.from('affiliate_commissions').select('*').eq('affiliate_id', affiliateId).in('status', ['approved', 'pending'])
  const mapped = (commissions || []).map((c: any) => ({ ...c, amount: Number(c.amount), commission: Number(c.commission) }))
  const check = affiliatePayoutEngine.canRequestPayout(mapped.filter((c: any) => c.status === 'approved'), [])
  if (!check.can) return errorResponse(check.reason || 'Saldo insuficiente')

  const period = affiliatePayoutEngine.generatePeriod()
  const payout = affiliatePayoutEngine.calculatePayout(mapped)

  const { data, error } = await supabase.from('affiliate_payouts').insert({
    affiliate_id: affiliateId, period_start: period.start, period_end: period.end,
    gross_commission: payout.grossCommission, adjustments: payout.adjustments,
    net_commission: payout.netCommission, fee: payout.fee, method, status: 'pending',
  }).select().single()

  if (error) return errorResponse(error.message)
  return successResponse(data)
}
