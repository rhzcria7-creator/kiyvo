import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripeServer } from '@/lib/stripe/server'
import { isSetupComplete } from '@/lib/security'

// GET /api/health — Health check completo do sistema
// Usado para monitoramento automático (UptimeRobot, etc.)
export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'error' | 'warning'; message?: string; latency?: number }> = {}

  // 1. Check Supabase connection
  const supabase = createAdminClient()
  if (supabase) {
    const t0 = Date.now()
    try {
      const { error } = await supabase.from('categories').select('id').limit(1)
      checks.database = {
        status: error ? 'error' : 'ok',
        message: error ? error.message : 'Connected',
        latency: Date.now() - t0,
      }
    } catch {
      checks.database = { status: 'error', message: 'Connection failed', latency: Date.now() - t0 }
    }
  } else {
    checks.database = { status: 'error', message: 'Not configured' }
  }

  // 2. Check Stripe connection
  const stripe = getStripeServer()
  if (stripe) {
    const t0 = Date.now()
    try {
      await stripe.balance.retrieve()
      checks.stripe = { status: 'ok', message: 'Connected', latency: Date.now() - t0 }
    } catch (err: any) {
      checks.stripe = { status: 'error', message: err.message }
    }
  } else {
    checks.stripe = { status: 'warning', message: 'Not configured (demo mode)' }
  }

  // 3. Check Auth
  checks.auth = {
    status: isSetupComplete().supabase ? 'ok' : 'warning',
    message: isSetupComplete().supabase ? 'Configured' : 'Using placeholders',
  }

  // 4. Check Webhook
  checks.webhook = {
    status: isSetupComplete().webhook ? 'ok' : 'warning',
    message: isSetupComplete().webhook ? 'Configured' : 'Not configured — payments won\'t auto-confirm',
  }

  // Overall status
  const hasError = Object.values(checks).some(c => c.status === 'error')
  const hasWarning = Object.values(checks).some(c => c.status === 'warning')

  const status = hasError ? 503 : 200
  const overall = hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy'

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    uptime: process.uptime(),
    checks,
    latency: Date.now() - startTime,
  }, { status })
}
