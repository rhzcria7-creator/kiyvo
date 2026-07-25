// GET /api/health — diagnóstico público sem vazar segredos.
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripeServer } from '@/lib/stripe/server'

export const dynamic = 'force-dynamic'

type ServiceState = 'up' | 'not_configured' | 'degraded'

export async function GET() {
  try {
    let supabase: ServiceState = 'not_configured'
    const admin = createAdminClient()
    if (admin) {
      const result = await admin.from('products').select('id', { count: 'exact', head: true }).limit(1)
      supabase = result.error ? 'degraded' : 'up'
    }

    let stripe: ServiceState = 'not_configured'
    const stripeClient = getStripeServer()
    if (stripeClient) {
      try {
        await stripeClient.balance.retrieve()
        stripe = 'up'
      } catch {
        stripe = 'degraded'
      }
    }

    const status = supabase === 'degraded' || stripe === 'degraded' ? 'degraded' : 'ok'
    return NextResponse.json({
      status,
      time: new Date().toISOString(),
      services: { supabase, stripe },
    }, {
      status: status === 'ok' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({
      status: 'degraded',
      time: new Date().toISOString(),
      services: { supabase: 'degraded', stripe: 'degraded' },
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
