// ─────────────────────────────────────────────────────────────
// Membership API v0.0.1 — Planos de assinatura
// Upgrade/downgrade, cancelamento, benefícios
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { membershipEngine } from '@/domain/membership/MembershipEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const supabase = await trySupabase()
  const plans = membershipEngine.getAllPlans()

  if (!supabase || !userId) {
    return successResponse({ plans, currentPlan: null, activePlans: membershipEngine.getActivePlans() })
  }

  const { data: membership } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return successResponse({
    plans,
    activePlans: membershipEngine.getActivePlans(),
    currentPlan: membership ? {
      tier: membership.plan,
      status: membership.status,
      currentPeriodEnd: membership.current_period_end,
      trialEnd: membership.trial_end,
    } : null,
    savings: plans.filter(p => p.priceMonthly > 0).map(p => ({
      tier: p.id,
      ...membershipEngine.calculateYearlySavings(p.id),
    })),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, plan, action, stripePriceId } = body

  if (!userId || !action) return errorResponse('userId e action obrigatórios')

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ message: 'Demo mode' })

  switch (action) {
    case 'subscribe': {
      if (!plan) return errorResponse('plan obrigatório')

      const { error } = await supabase.from('subscriptions').insert({
        user_id: userId, plan, status: 'active',
        stripe_subscription_id: stripePriceId || null,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (error) return errorResponse(error.message)
      return successResponse({ userId, plan, status: 'active' })
    }

    case 'cancel': {
      const { data: sub } = await supabase
        .from('subscriptions').select('*').eq('user_id', userId).in('status', ['active', 'trialing']).single()
      if (!sub) return errorResponse('Nenhuma assinatura ativa')

      await supabase.from('subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', sub.id)
      return successResponse({ cancelled: true, expiresAt: sub.current_period_end })
    }

    case 'change_plan': {
      if (!plan) return errorResponse('plan obrigatório')
      await supabase.from('subscriptions').update({ plan, status: 'active' }).eq('user_id', userId)
      return successResponse({ userId, newPlan: plan })
    }

    default:
      return errorResponse('Ação inválida')
  }
}
